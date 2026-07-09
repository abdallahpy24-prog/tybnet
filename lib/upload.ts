import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const MAX_BYTES = 3 * 1024 * 1024; // 3MB

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif"
]);

const IMAGE_WIDTH = 1200;
const IMAGE_QUALITY = 82;
const DEFAULT_BUCKET = "tibnet-uploads";

type UploadProvider = "local" | "supabase";

function getUploadProvider(): UploadProvider {
  const provider = (process.env.UPLOAD_PROVIDER || "local").toLowerCase();

  if (provider === "local" || provider === "supabase") {
    return provider;
  }

  throw new Error("UPLOAD_PROVIDER غير مدعوم. استخدم local أو supabase");
}

function getSafeFileName() {
  const timestamp = Date.now().toString(36);
  const random = randomUUID().replaceAll("-", "").slice(0, 16);

  return `${timestamp}-${random}.webp`;
}

function getStoragePath(fileName: string) {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");

  return `uploads/${year}/${month}/${fileName}`;
}

function getPublicLocalUrl(storagePath: string) {
  return `/${storagePath.replace(/\\/g, "/")}`;
}

async function optimizeImage(file: File) {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("الملف يجب أن يكون صورة JPG أو PNG أو WebP أو GIF");
  }

  if (!file.size) {
    throw new Error("ملف الصورة فارغ");
  }

  if (file.size > MAX_BYTES) {
    throw new Error("حجم الصورة يجب ألا يتجاوز 3MB");
  }

  const bytes = Buffer.from(await file.arrayBuffer());

  try {
    return await sharp(bytes, {
      animated: false
    })
      .rotate()
      .resize({
        width: IMAGE_WIDTH,
        withoutEnlargement: true
      })
      .webp({
        quality: IMAGE_QUALITY,
        effort: 5
      })
      .toBuffer();
  } catch {
    throw new Error("تعذر معالجة الصورة. جرّب صورة أخرى بصيغة JPG أو PNG أو WebP");
  }
}

async function saveLocalImage(output: Buffer, storagePath: string) {
  const absolutePath = path.join(process.cwd(), "public", storagePath);
  const uploadDir = path.dirname(absolutePath);

  await mkdir(uploadDir, {
    recursive: true
  });

  await writeFile(absolutePath, output);

  return getPublicLocalUrl(storagePath);
}

async function saveSupabaseImage(output: Buffer, storagePath: string) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || DEFAULT_BUCKET;

  if (!supabaseUrl) {
    throw new Error("SUPABASE_URL غير موجود");
  }

  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY غير موجود");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  const { error } = await supabase.storage.from(bucket).upload(storagePath, output, {
    contentType: "image/webp",
    cacheControl: "31536000",
    upsert: false
  });

  if (error) {
    throw new Error(`فشل رفع الصورة إلى Supabase: ${error.message}`);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);

  if (!data.publicUrl) {
    throw new Error("فشل إنشاء رابط الصورة");
  }

  return data.publicUrl;
}

export async function saveImage(file: File) {
  const output = await optimizeImage(file);
  const fileName = getSafeFileName();
  const storagePath = getStoragePath(fileName);
  const provider = getUploadProvider();

  if (provider === "supabase") {
    return saveSupabaseImage(output, storagePath);
  }

  return saveLocalImage(output, storagePath);
}