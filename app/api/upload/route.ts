import { NextRequest, NextResponse } from "next/server";
import { saveImage } from "@/lib/upload";
import { requireAdmin } from "@/lib/permissions";

export async function POST(request: NextRequest) {
  await requireAdmin();
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "الصورة مطلوبة" }, { status: 400 });
  }

  try {
    const url = await saveImage(file);
    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "فشل رفع الصورة" }, { status: 400 });
  }
}
