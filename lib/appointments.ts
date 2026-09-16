import { createHash } from "node:crypto";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { normalizeArabicDigits } from "@/lib/search";
import { logServerError } from "@/lib/server-error";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_PHONE_PER_WINDOW = 5;
const MAX_SERIALIZABLE_RETRIES = 3;

export type StoreAppointmentInput = {
  providerId: string;
  patientName: string;
  patientPhone: string;
  preferredDate?: string | null;
  note?: string | null;
  source: "public-whatsapp-form" | "mobile-api";
};

export type StoreAppointmentResult = {
  saved: boolean;
  duplicate: boolean;
  rateLimited: boolean;
  appointmentId: string | null;
};

export function normalizePatientPhone(value: string) {
  const digits = normalizeArabicDigits(value).replace(/\D/g, "");

  if (digits.startsWith("00964")) return digits.slice(2);
  if (digits.startsWith("964")) return digits;
  if (/^07\d{9}$/.test(digits)) return `964${digits.slice(1)}`;
  if (/^7\d{9}$/.test(digits)) return `964${digits}`;
  return digits;
}

function requestKeyFor(input: {
  providerId: string;
  phone: string;
  now: Date;
}) {
  const bucket = Math.floor(input.now.getTime() / WINDOW_MS);
  return createHash("sha256")
    .update(`${input.providerId}:${input.phone}:${bucket}`)
    .digest("hex");
}

function isRetryableSerializableError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2034"
  );
}

export async function storeAppointmentSafely(
  input: StoreAppointmentInput
): Promise<StoreAppointmentResult> {
  const normalizedPhone = normalizePatientPhone(input.patientPhone);
  const now = new Date();
  const windowStart = new Date(now.getTime() - WINDOW_MS);
  const requestKey = requestKeyFor({
    providerId: input.providerId,
    phone: normalizedPhone,
    now
  });

  for (let attempt = 1; attempt <= MAX_SERIALIZABLE_RETRIES; attempt += 1) {
    try {
      const result = await prisma.$transaction(
        async (tx) => {
          const duplicate = await tx.appointment.findFirst({
            where: {
              providerId: input.providerId,
              patientPhoneNormalized: normalizedPhone,
              createdAt: { gte: windowStart }
            },
            orderBy: { createdAt: "desc" },
            select: { id: true }
          });

          if (duplicate) {
            return {
              saved: false,
              duplicate: true,
              rateLimited: false,
              appointmentId: duplicate.id
            } satisfies StoreAppointmentResult;
          }

          const recentCount = await tx.appointment.count({
            where: {
              patientPhoneNormalized: normalizedPhone,
              createdAt: { gte: windowStart }
            }
          });

          if (recentCount >= MAX_REQUESTS_PER_PHONE_PER_WINDOW) {
            return {
              saved: false,
              duplicate: false,
              rateLimited: true,
              appointmentId: null
            } satisfies StoreAppointmentResult;
          }

          const appointment = await tx.appointment.create({
            data: {
              providerId: input.providerId,
              patientName: input.patientName,
              patientPhone: input.patientPhone,
              patientPhoneNormalized: normalizedPhone,
              requestKey,
              preferredDate: input.preferredDate || null,
              note: input.note || null,
              status: "NEW"
            },
            select: { id: true }
          });

          return {
            saved: true,
            duplicate: false,
            rateLimited: false,
            appointmentId: appointment.id
          } satisfies StoreAppointmentResult;
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable
        }
      );

      if (result.saved && result.appointmentId) {
        try {
          await prisma.auditLog.create({
            data: {
              userId: null,
              action:
                input.source === "mobile-api"
                  ? "create-mobile-appointment"
                  : "create-whatsapp-appointment",
              entity: "Appointment",
              entityId: result.appointmentId,
              afterJson: {
                appointmentId: result.appointmentId,
                providerId: input.providerId,
                source: input.source
              }
            }
          });
        } catch (auditError) {
          logServerError("Appointment audit log error", auditError);
        }
      }

      return result;
    } catch (error) {
      if (isRetryableSerializableError(error) && attempt < MAX_SERIALIZABLE_RETRIES) {
        continue;
      }

      // A unique request-key collision means the same request was already accepted.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const existing = await prisma.appointment.findUnique({
          where: { requestKey },
          select: { id: true }
        });

        if (!existing) throw error;

        return {
          saved: false,
          duplicate: true,
          rateLimited: false,
          appointmentId: existing.id
        };
      }

      throw error;
    }
  }

  throw new Error("Appointment transaction retry limit reached");
}
