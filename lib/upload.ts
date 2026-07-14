import { randomUUID } from "node:crypto";
import { mkdir, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const MAX_BYTES = 3 * 1024 * 1024; // 3MB
const MAX_INPUT_PIXELS = 25_000_000;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif"
]);

const ALLOWED_FORMATS = new Set(["jpeg", "png", "webp", "gif"]);

const ORIGINAL_QUALITY = 95;
const PROFILE_MAX_SIZE = 1600;
const PROFILE_QUALITY = 88;
const THUMBNAIL_MAX_SIZE = 320;
const THUMBNAIL_QUALITY = 80;
const CACHE_CONTROL_SECONDS = "31536000";
const DEFAULT_BUCKET = "tibnet-uploads";

type UploadProvider = "local" | "supabase";
type ImageVariantName = "original" | "profile" | "thumbnail";

type PreparedImage = {
  output: Buffer;
  storagePath: string;
};

type PreparedImageVariants = Record<ImageVariantName, PreparedImage>;

export type SavedImageVariants = {
  imageUrl: string;
  imageThumbnailUrl: string;
  imageOriginalUrl: string;
};

function getUploadProvider(): UploadProvider {
  const provider = (process.env.UPLOAD_PROVIDER || "local").toLowerCase();

  if (provider === "local" || provider === "supabase") {
    return provider;
  }

  throw new Error("إعداد خدمة رفع الصور غير صحيح");
}

function getSafeFileBase() {
  const timestamp = Date.now().toString(36);
  const random = randomUUID().replaceAll("-", "").slice(0, 16);

  return `${timestamp}-${random}`;
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

function createImagePipeline(bytes: Buffer) {
  return sharp(bytes, {
    animated: false,
    failOn: "error",
    limitInputPixels: MAX_INPUT_PIXELS,
    sequentialRead: true
  });
}

async function readAndValidateImage(file: File) {
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
    const metadata = await createImagePipeline(bytes).metadata();

    if (
      !metadata.format ||
      !ALLOWED_FORMATS.has(metadata.format) ||
      !metadata.width ||
      !metadata.height ||
      metadata.width * metadata.height > MAX_INPUT_PIXELS
    ) {
      throw new Error("invalid-image");
    }

    return bytes;
  } catch {
    throw new Error(
      "تعذر معالجة الصورة. تأكد من الصيغة والأبعاد ثم جرّب صورة أخرى"
    );
  }
}

async function createOriginalImage(bytes: Buffer) {
  return createImagePipeline(bytes)
    .rotate()
    .webp({
      quality: ORIGINAL_QUALITY,
      effort: 5,
      smartSubsample: true
    })
    .toBuffer();
}

async function createProfileImage(bytes: Buffer) {
  return createImagePipeline(bytes)
    .rotate()
    .resize({
      width: PROFILE_MAX_SIZE,
      height: PROFILE_MAX_SIZE,
      fit: "inside",
      withoutEnlargement: true
    })
    .webp({
      quality: PROFILE_QUALITY,
      effort: 5,
      smartSubsample: true
    })
    .toBuffer();
}

async function createThumbnailImage(bytes: Buffer) {
  return createImagePipeline(bytes)
    .rotate()
    .resize({
      width: THUMBNAIL_MAX_SIZE,
      height: THUMBNAIL_MAX_SIZE,
      fit: "inside",
      withoutEnlargement: true
    })
    .webp({
      quality: THUMBNAIL_QUALITY,
      effort: 5,
      smartSubsample: true
    })
    .toBuffer();
}

async function prepareSingleProfileImage(file: File): Promise<PreparedImage> {
  const bytes = await readAndValidateImage(file);
  const fileBase = getSafeFileBase();
  const output = await createProfileImage(bytes);

  return {
    output,
    storagePath: getStoragePath(`${fileBase}-profile.webp`)
  };
}

async function prepareImageVariants(file: File): Promise<PreparedImageVariants> {
  const bytes = await readAndValidateImage(file);
  const fileBase = getSafeFileBase();

  const [originalOutput, profileOutput, thumbnailOutput] = await Promise.all([
    createOriginalImage(bytes),
    createProfileImage(bytes),
    createThumbnailImage(bytes)
  ]);

  return {
    original: {
      output: originalOutput,
      storagePath: getStoragePath(`${fileBase}-original.webp`)
    },
    profile: {
      output: profileOutput,
      storagePath: getStoragePath(`${fileBase}-profile.webp`)
    },
    thumbnail: {
      output: thumbnailOutput,
      storagePath: getStoragePath(`${fileBase}-thumbnail.webp`)
    }
  };
}

function getAbsoluteLocalPath(storagePath: string) {
  const publicDir = path.resolve(process.cwd(), "public");
  const absolutePath = path.resolve(publicDir, storagePath);

  if (!absolutePath.startsWith(`${publicDir}${path.sep}`)) {
    throw new Error("مسار حفظ الصورة غير صحيح");
  }

  return absolutePath;
}

async function saveLocalImage(output: Buffer, storagePath: string) {
  const absolutePath = getAbsoluteLocalPath(storagePath);
  const uploadDir = path.dirname(absolutePath);
  const temporaryPath = `${absolutePath}.${randomUUID()}.tmp`;

  await mkdir(uploadDir, {
    recursive: true
  });

  try {
    await writeFile(temporaryPath, output, {
      flag: "wx"
    });
    await rename(temporaryPath, absolutePath);
  } catch (error) {
    await rm(temporaryPath, {
      force: true
    }).catch(() => undefined);

    throw error;
  }

  return getPublicLocalUrl(storagePath);
}

async function removeLocalImages(storagePaths: string[]) {
  await Promise.all(
    storagePaths.map(async (storagePath) => {
      const absolutePath = getAbsoluteLocalPath(storagePath);

      await rm(absolutePath, {
        force: true
      }).catch(() => undefined);
    })
  );
}

function getSupabaseStorageContext() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || DEFAULT_BUCKET;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Supabase upload configuration is incomplete");
    throw new Error("خدمة رفع الصور غير مهيأة حالياً");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  return {
    supabase,
    bucket
  };
}

type SupabaseStorageContext = ReturnType<typeof getSupabaseStorageContext>;

async function saveSupabaseImage(
  context: SupabaseStorageContext,
  output: Buffer,
  storagePath: string
) {
  const { error } = await context.supabase.storage
    .from(context.bucket)
    .upload(storagePath, output, {
      contentType: "image/webp",
      cacheControl: CACHE_CONTROL_SECONDS,
      upsert: false
    });

  if (error) {
    console.error("Supabase image upload error", {
      message: error.message,
      statusCode: error.statusCode
    });
    throw new Error("فشل رفع الصورة إلى خدمة التخزين");
  }

  const { data } = context.supabase.storage
    .from(context.bucket)
    .getPublicUrl(storagePath);

  if (!data.publicUrl) {
    throw new Error("فشل إنشاء رابط الصورة");
  }

  return data.publicUrl;
}

async function removeSupabaseImages(
  context: SupabaseStorageContext,
  storagePaths: string[]
) {
  if (!storagePaths.length) {
    return;
  }

  const { error } = await context.supabase.storage
    .from(context.bucket)
    .remove(storagePaths);

  if (error) {
    console.error("Supabase image cleanup error", {
      message: error.message,
      statusCode: error.statusCode
    });
  }
}

async function savePreparedLocalVariants(
  variants: PreparedImageVariants
): Promise<SavedImageVariants> {
  const savedPaths: string[] = [];

  try {
    const imageOriginalUrl = await saveLocalImage(
      variants.original.output,
      variants.original.storagePath
    );
    savedPaths.push(variants.original.storagePath);

    const imageUrl = await saveLocalImage(
      variants.profile.output,
      variants.profile.storagePath
    );
    savedPaths.push(variants.profile.storagePath);

    const imageThumbnailUrl = await saveLocalImage(
      variants.thumbnail.output,
      variants.thumbnail.storagePath
    );
    savedPaths.push(variants.thumbnail.storagePath);

    return {
      imageUrl,
      imageThumbnailUrl,
      imageOriginalUrl
    };
  } catch (error) {
    await removeLocalImages(savedPaths);
    throw error;
  }
}

async function savePreparedSupabaseVariants(
  variants: PreparedImageVariants
): Promise<SavedImageVariants> {
  const context = getSupabaseStorageContext();
  const savedPaths: string[] = [];

  try {
    const imageOriginalUrl = await saveSupabaseImage(
      context,
      variants.original.output,
      variants.original.storagePath
    );
    savedPaths.push(variants.original.storagePath);

    const imageUrl = await saveSupabaseImage(
      context,
      variants.profile.output,
      variants.profile.storagePath
    );
    savedPaths.push(variants.profile.storagePath);

    const imageThumbnailUrl = await saveSupabaseImage(
      context,
      variants.thumbnail.output,
      variants.thumbnail.storagePath
    );
    savedPaths.push(variants.thumbnail.storagePath);

    return {
      imageUrl,
      imageThumbnailUrl,
      imageOriginalUrl
    };
  } catch (error) {
    await removeSupabaseImages(context, savedPaths);
    throw error;
  }
}

/**
 * Backward-compatible single-image upload.
 * Existing callers continue receiving the optimized profile image URL.
 */
export async function saveImage(file: File) {
  const prepared = await prepareSingleProfileImage(file);
  const provider = getUploadProvider();

  if (provider === "supabase") {
    const context = getSupabaseStorageContext();

    return saveSupabaseImage(context, prepared.output, prepared.storagePath);
  }

  return saveLocalImage(prepared.output, prepared.storagePath);
}

/**
 * Saves a full-resolution visual master, a high-quality profile image,
 * and a lightweight thumbnail. Nothing is cropped, so the existing UI
 * keeps the same framing through its current object-fit/cover styles.
 */
export async function saveImageVariants(file: File) {
  const variants = await prepareImageVariants(file);
  const provider = getUploadProvider();

  if (provider === "supabase") {
    return savePreparedSupabaseVariants(variants);
  }

  return savePreparedLocalVariants(variants);
}
