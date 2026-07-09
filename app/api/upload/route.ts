import { NextRequest, NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/permissions";
import { saveImage } from "@/lib/upload";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB

function isUnauthorizedError(message: string) {
  return (
    message.includes("غير مصرح") ||
    message.includes("Unauthorized") ||
    message.toLowerCase().includes("admin")
  );
}

function isValidImageType(type: string) {
  return ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(type);
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminApi();

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          ok: false,
          error: "الصورة مطلوبة"
        },
        {
          status: 400
        }
      );
    }

    if (!file.size) {
      return NextResponse.json(
        {
          ok: false,
          error: "ملف الصورة فارغ"
        },
        {
          status: 400
        }
      );
    }

    if (!file.type.startsWith("image/") || !isValidImageType(file.type)) {
      return NextResponse.json(
        {
          ok: false,
          error: "الملف يجب أن يكون صورة بصيغة JPG أو PNG أو WebP أو GIF"
        },
        {
          status: 400
        }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          ok: false,
          error: "حجم الصورة يجب ألا يتجاوز 3MB"
        },
        {
          status: 400
        }
      );
    }

    const url = await saveImage(file);

    return NextResponse.json({
      ok: true,
      url,
      imageUrl: url,
      path: url
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "فشل رفع الصورة";

    return NextResponse.json(
      {
        ok: false,
        error: message
      },
      {
        status: isUnauthorizedError(message) ? 401 : 400
      }
    );
  }
}