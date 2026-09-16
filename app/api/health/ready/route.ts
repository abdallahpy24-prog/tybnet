import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function isAuthorized(request: NextRequest) {
  const expected = process.env.READINESS_TOKEN?.trim();
  if (!expected) return false;

  const header = request.headers.get("authorization")?.trim() ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";

  return token.length > 0 && token === expected;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { ok: false, error: "not_found" },
      {
        status: 404,
        headers: { "Cache-Control": "no-store" }
      }
    );
  }

  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json(
      {
        ok: true,
        service: "tybnet",
        database: "ready",
        time: new Date().toISOString()
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Readiness check failed", error);

    return NextResponse.json(
      {
        ok: false,
        service: "tybnet",
        database: "unavailable",
        time: new Date().toISOString()
      },
      {
        status: 503,
        headers: { "Cache-Control": "no-store" }
      }
    );
  }
}
