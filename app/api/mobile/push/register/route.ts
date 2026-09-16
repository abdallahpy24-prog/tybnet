import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { readJsonBodyWithLimit } from "@/lib/http-body";
import { prisma } from "@/lib/prisma";
import { isValidExpoPushToken } from "@/lib/push-notifications";

export const dynamic = "force-dynamic";

const MAX_REQUEST_BYTES = 4 * 1024;

const registerSchema = z.object({
  installationId: z
    .string()
    .trim()
    .min(12)
    .max(120)
    .regex(/^[A-Za-z0-9._-]+$/),
  expoPushToken: z
    .string()
    .trim()
    .max(300)
    .refine(isValidExpoPushToken),
  platform: z.enum(["ios", "android"]),
  appVersion: z.string().trim().max(40).optional().nullable()
});

export async function POST(request: NextRequest) {
  try {
    const bodyResult = await readJsonBodyWithLimit(request, MAX_REQUEST_BYTES);

    if (!bodyResult.ok) {
      return NextResponse.json(
        { ok: false, message: bodyResult.message },
        {
          status: bodyResult.status,
          headers: { "Cache-Control": "no-store" }
        }
      );
    }

    const body = registerSchema.safeParse(bodyResult.body);

    if (!body.success) {
      return NextResponse.json(
        {
          ok: false,
          message: "بيانات الاشتراك بالإشعارات غير صحيحة"
        },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const now = new Date();
    const input = body.data;

    await prisma.$transaction(async (tx) => {
      await tx.pushSubscription.deleteMany({
        where: {
          expoPushToken: input.expoPushToken,
          NOT: {
            installationId: input.installationId
          }
        }
      });

      await tx.pushSubscription.upsert({
        where: {
          installationId: input.installationId
        },
        update: {
          expoPushToken: input.expoPushToken,
          platform: input.platform,
          appVersion: input.appVersion || null,
          offersEnabled: true,
          lastSeenAt: now
        },
        create: {
          installationId: input.installationId,
          expoPushToken: input.expoPushToken,
          platform: input.platform,
          appVersion: input.appVersion || null,
          offersEnabled: true,
          lastSeenAt: now
        }
      });
    });

    return NextResponse.json(
      {
        ok: true,
        message: "تم تفعيل إشعارات العروض"
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Push registration API error", error);

    return NextResponse.json(
      {
        ok: false,
        message: "تعذر تفعيل إشعارات العروض حالياً"
      },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
