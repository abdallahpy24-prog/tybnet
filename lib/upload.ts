import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const maxBytes = 3 * 1024 * 1024;
const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function saveImage(file: File) {
  if (!allowed.has(file.type)) {
    throw new Error("الملف يجب أن يكون صورة JPEG أو PNG أو WebP");
  }
  if (file.size > maxBytes) {
    throw new Error("حجم الصورة يجب ألا يتجاوز 3MB");
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const image = sharp(bytes).resize({ width: 1200, withoutEnlargement: true }).webp({ quality: 82 });
  const output = await image.toBuffer();
  const fileName = Date.now().toString(36) + "-" + Math.random().toString(36).slice(2) + ".webp";
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, fileName), output);
  return "/uploads/" + fileName;
}
