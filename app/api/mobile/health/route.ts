import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "tybnet-mobile-api",
    message: "Mobile API is working",
    time: new Date().toISOString(),
  });
}