import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { readJsonBodyWithLimit } from "@/lib/http-body";
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
