import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

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

async function readJsonBody(request: NextRequest) {
  const contentType = request.headers.get("content-type")?.toLowerCase() || "";

  if (!contentType.startsWith("application/json")) {
    return {
      ok: false as const,
      status: 415,
      message: "نوع البيانات غير مدعوم"
    };
  }

  const contentLength = Number(request.headers.get("content-length") || 0);

  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
    return {
      ok: false as const,
      status: 413,
      message: "حجم البيانات كبير جداً"
    };
  }

  try {
    return { ok: true as const, body: (await request.json()) as unknown };
  } catch {
    return {
      ok: false as const,
      status: 400,
      message: "البيانات المرسلة غير صحيحة"
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const bodyResult = await readJsonBody(request);

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
