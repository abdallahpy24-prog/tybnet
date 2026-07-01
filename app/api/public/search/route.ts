import { NextRequest, NextResponse } from "next/server";
import { searchProviders } from "@/lib/queries";
import { buildWhatsappUrl } from "@/lib/whatsapp";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const type = searchParams.get("type") === "DENTIST" ? "DENTIST" : "DOCTOR";
  const params = Object.fromEntries(searchParams.entries());
  const providers = await searchProviders(type, params, 50);
  return NextResponse.json({
    items: providers.map((provider) => ({
      id: provider.id,
      type: provider.type,
      name: (provider.titlePrefix ? provider.titlePrefix + " " : "") + provider.name,
      specialty: provider.specialty?.name ?? null,
      location: provider.governorate.name + " - " + provider.area.name,
      imageUrl: provider.imageUrl,
      whatsappUrl: buildWhatsappUrl(provider.whatsapp),
      detailUrl: "/providers/" + provider.slug
    })),
    total: providers.length
  });
}
