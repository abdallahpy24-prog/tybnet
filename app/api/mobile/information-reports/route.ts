import { createHash } from "node:crypto";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const MAX_REQUEST_BYTES = 16 * 1024;
const DUPLICATE_WINDOW_MS = 15 * 60 * 1000;

const reportSchema = z
  .object({
    entityType: z.enum([
      "PROVIDER",
      "PHARMACY",
      "LAB",
      "COSMETIC_CENTER"
    ]),
    entityId: z.string().trim().min(1).max(80),
    entitySlug: z.string().trim().min(1).max(180),
    entityName: z.string().trim().min(1).max(180),
    issueType: z.enum([
      "PHONE",
      "ADDRESS",
      "WORKING_HOURS",
      "SPECIALTY_SERVICES",
      "MAP_LOCATION",
      "CLOSED_OR_UNAVAILABLE",
      "OTHER"
    ]),
    details: z.string().trim().max(700).optional().nullable()
  })
  .superRefine((value, context) => {
    if (value.issueType === "OTHER" && !value.details?.trim()) {
      context.addIssue({
        code: "custom",
        path: ["details"],
        message: "اكتب تفاصيل المعلومة الخاطئة"
      });
    }
  });

function readClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  return (
    request.headers.get("cf-connecting-ip")?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    forwardedFor?.split(",")[0]?.trim() ||
    null
  );
}

function buildFingerprint(request: NextRequest) {
  const ip = readClientIp(request);

  if (!ip) {
    return null;
  }

  const userAgent = request.headers.get("user-agent")?.trim() || "unknown";
  const salt =
    process.env.AUTH_SECRET ||
    process.env.PUBLIC_SITE_URL ||
    "tybnet-information-report";

  return createHash("sha256")
    .update(`${salt}|${ip}|${userAgent}`)
    .digest("hex");
}

async function readJsonBody(request: NextRequest) {
  const contentType = request.headers.get("content-type")?.toLowerCase() || "";

  if (!contentType.startsWith("application/json")) {
    return { ok: false as const, status: 415, message: "نوع البيانات غير مدعوم" };
  }

  const contentLength = Number(request.headers.get("content-length") || 0);

  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
    return { ok: false as const, status: 413, message: "حجم البيانات كبير جداً" };
  }

  try {
    return { ok: true as const, body: (await request.json()) as unknown };
  } catch {
    return { ok: false as const, status: 400, message: "البيانات المرسلة غير صحيحة" };
  }
}

async function findReportableEntity(input: {
  entityType: "PROVIDER" | "PHARMACY" | "LAB" | "COSMETIC_CENTER";
  entityId: string;
  entitySlug: string;
}) {
  const where = {
    id: input.entityId,
    slug: input.entitySlug,
    status: "ACTIVE" as const
  };

  switch (input.entityType) {
    case "PROVIDER":
      return prisma.provider.findFirst({
        where,
        select: { id: true, slug: true, name: true }
      });
    case "PHARMACY":
      return prisma.pharmacy.findFirst({
        where,
        select: { id: true, slug: true, name: true }
      });
    case "LAB":
      return prisma.lab.findFirst({
        where,
        select: { id: true, slug: true, name: true }
      });
    case "COSMETIC_CENTER":
      return prisma.cosmeticCenter.findFirst({
        where,
        select: { id: true, slug: true, name: true }
      });
  }
}

export async function POST(request: NextRequest) {
  try {
    const bodyResult = await readJsonBody(request);

    if (!bodyResult.ok) {
      return NextResponse.json(
        { ok: false, message: bodyResult.message },
        { status: bodyResult.status, headers: { "Cache-Control": "no-store" } }
      );
    }

    const parsed = reportSchema.safeParse(bodyResult.body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          message: parsed.error.issues[0]?.message || "تحقق من بيانات البلاغ"
        },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const entity = await findReportableEntity(parsed.data);

    if (!entity) {
      return NextResponse.json(
        { ok: false, message: "مقدم الخدمة غير موجود أو غير متاح حالياً" },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }

    const fingerprint = buildFingerprint(request);

    if (fingerprint) {
      const duplicate = await prisma.informationReport.findFirst({
        where: {
          fingerprint,
          entityType: parsed.data.entityType,
          entityId: entity.id,
          issueType: parsed.data.issueType,
          createdAt: {
            gte: new Date(Date.now() - DUPLICATE_WINDOW_MS)
          }
        },
        select: { id: true }
      });

      if (duplicate) {
        return NextResponse.json(
          {
            ok: true,
            message: "استلمنا بلاغك مسبقاً، شكراً لمساعدتنا في تحديث المعلومات"
          },
          { headers: { "Cache-Control": "no-store" } }
        );
      }
    }

    const report = await prisma.informationReport.create({
      data: {
        entityType: parsed.data.entityType,
        entityId: entity.id,
        entitySlug: entity.slug,
        entityName: entity.name,
        issueType: parsed.data.issueType,
        details: parsed.data.details?.trim() || null,
        fingerprint
      },
      select: { id: true }
    });

    return NextResponse.json(
      {
        ok: true,
        reportId: report.id,
        message: "شكراً لك، تم إرسال البلاغ إلى فريق طب نت للمراجعة"
      },
      { status: 201, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Information report creation failed", error);

    return NextResponse.json(
      { ok: false, message: "تعذر إرسال البلاغ حالياً، حاول مرة ثانية" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
