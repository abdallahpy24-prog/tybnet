import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const MAX_REQUEST_BYTES = 2 * 1024;

const unregisterSchema = z.object({
  installationId: z
    .string()
    .trim()
    .min(12)
    .max(120)
    .regex(/^[A-Za-z0-9._-]+$/)
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

    const body = unregisterSchema.safeParse(bodyResult.body);

    if (!body.success) {
      return NextResponse.json(
        {
          ok: false,
          message: "بيانات إلغاء الاشتراك غير صحيحة"
        },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    await prisma.pushSubscription.deleteMany({
      where: {
        installationId: body.data.installationId
      }
    });

    return NextResponse.json(
      {
        ok: true,
        message: "تم إيقاف إشعارات العروض"
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Push unregistration API error", error);

    return NextResponse.json(
      {
        ok: false,
        message: "تعذر إيقاف إشعارات العروض حالياً"
      },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
