import { NextRequest, NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/permissions";
import { saveImageVariants } from "@/lib/upload";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB
const MAX_REQUEST_SIZE = MAX_FILE_SIZE + 512 * 1024;
const UNAUTHORIZED_MESSAGE = "غير مصرح لك بتنفيذ هذه العملية";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif"
]);

function errorResponse(error: string, status: number) {
  return NextResponse.json(
    {
      ok: false,
      error
    },
    {
      status,
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}

function isUploadInputError(message: string) {
  return (
    message === "ملف الصورة فارغ" ||
    message.startsWith("الملف يجب أن يكون صورة") ||
    message.startsWith("حجم الصورة يجب ألا يتجاوز") ||
    message.startsWith("تعذر معالجة الصورة")
  );
}

function readContentLength(request: NextRequest) {
  const value = request.headers.get("content-length");

  if (!value) {
    return null;
  }

  const length = Number(value);

  return Number.isSafeInteger(length) && length >= 0 ? length : null;
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminApi();

    const contentLength = readContentLength(request);

    if (contentLength !== null && contentLength > MAX_REQUEST_SIZE) {
      return errorResponse("حجم الصورة يجب ألا يتجاوز 3MB", 413);
    }

    let formData: FormData;

    try {
      formData = await request.formData();
    } catch {
      return errorResponse("تعذر قراءة ملف الصورة المرسل", 400);
    }

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return errorResponse("الصورة مطلوبة", 400);
    }

    if (!file.size) {
      return errorResponse("ملف الصورة فارغ", 400);
    }

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return errorResponse(
        "الملف يجب أن يكون صورة بصيغة JPG أو PNG أو WebP أو GIF",
        400
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return errorResponse("حجم الصورة يجب ألا يتجاوز 3MB", 413);
    }

    const { imageUrl, imageThumbnailUrl, imageOriginalUrl } =
      await saveImageVariants(file);

    return NextResponse.json(
      {
        ok: true,

        // Backward-compatible fields used by the current admin forms.
        url: imageUrl,
        imageUrl,
        path: imageUrl,

        // New image variants.
        imageThumbnailUrl,
        imageOriginalUrl,
        variants: {
          profile: imageUrl,
          thumbnail: imageThumbnailUrl,
          original: imageOriginalUrl
        }
      },
      {
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "";

    if (message === UNAUTHORIZED_MESSAGE) {
      return errorResponse("غير مصرح لك بتنفيذ هذه العملية", 401);
    }

    if (isUploadInputError(message)) {
      return errorResponse(message, 400);
    }

    console.error("Image upload API error", error);

    return errorResponse("صار خطأ أثناء رفع الصورة", 500);
  }
}
