import type { ProviderType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { searchProviders } from "@/lib/queries";
import { buildWhatsappUrl } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

const PROVIDER_TYPES = new Set<ProviderType>([
  "DOCTOR",
  "DENTIST",
  "COSMETIC_DOCTOR"
]);

function errorResponse(message: string, status: number) {
  return NextResponse.json(
    {
      ok: false,
      message,
      items: [],
      total: 0
    },
    { status }
  );
}

function readProviderType(value: string | null): ProviderType | null {
  if (!value) {
    return "DOCTOR";
  }

  const normalized = value.trim().toUpperCase() as ProviderType;

  return PROVIDER_TYPES.has(normalized) ? normalized : null;
}

function readSearchValue(
  searchParams: URLSearchParams,
  name: string,
  maxLength: number
) {
  const value = searchParams.get(name)?.trim();

  if (!value) {
    return undefined;
  }

  if (
    value.length > maxLength ||
    /[\u0000-\u001F\u007F]/.test(value)
  ) {
    return null;
  }

  return value;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const type = readProviderType(searchParams.get("type"));

    if (!type) {
      return errorResponse(
        "نوع مقدم الخدمة يجب أن يكون طبيباً أو طبيب أسنان أو طبيب تجميل",
        400
      );
    }

    const q = readSearchValue(searchParams, "q", 100);
    const governorateId = readSearchValue(
      searchParams,
      "governorateId",
      128
    );
    const areaId = readSearchValue(searchParams, "areaId", 128);
    const specialtyId = readSearchValue(searchParams, "specialtyId", 128);

    if (
      q === null ||
      governorateId === null ||
      areaId === null ||
      specialtyId === null
    ) {
      return errorResponse("بيانات البحث غير صحيحة أو طويلة جداً", 400);
    }

    const providers = await searchProviders(
      type,
      {
        q,
        governorateId,
        areaId,
        specialtyId
      },
      50
    );

    return NextResponse.json({
      ok: true,
      items: providers.map((provider) => ({
        id: provider.id,
        type: provider.type,
        name: [provider.titlePrefix, provider.name].filter(Boolean).join(" "),
        specialty: provider.specialty?.name ?? null,
        location: `${provider.governorate.name} - ${provider.area.name}`,
        imageUrl: provider.imageUrl,
        whatsappUrl: buildWhatsappUrl(
          provider.whatsapp || provider.phone
        ),
        detailUrl:
          provider.type === "COSMETIC_DOCTOR"
            ? `/cosmetic-doctors/${provider.slug}`
            : `/providers/${provider.slug}`
      })),
      total: providers.length
    });
  } catch (error) {
    console.error("Public search API error", error);

    return errorResponse("صار خطأ أثناء البحث، حاول مرة أخرى", 500);
  }
}
