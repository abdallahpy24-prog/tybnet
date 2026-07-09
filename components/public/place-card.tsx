import Image from "next/image";
import Link from "next/link";
import { ExternalLink, MapPin, MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { buildWhatsappUrl } from "@/lib/whatsapp";

type PlaceData = {
  name: string;
  slug?: string | null;

  imageUrl?: string | null;

  whatsapp?: string | null;
  workingHours?: string | null;
  address?: string | null;

  bio?: string | null;
  services?: string | null;

  inquiryCount?: number | null;
  inquiryUrl?: string | null;

  governorate: {
    name: string;
  };

  area: {
    name: string;
  };
};

function cleanText(value?: string | null) {
  return String(value || "").trim();
}

function isLabLabel(label: string) {
  return label.includes("مختبر") || label.includes("تحليل");
}

function getProfileHref(item: PlaceData, label: string) {
  if (!item.slug) return null;

  return isLabLabel(label) ? `/labs/${item.slug}` : `/pharmacies/${item.slug}`;
}

function getInquiryHref(item: PlaceData, label: string) {
  if (item.inquiryUrl) return item.inquiryUrl;

  if (!item.slug) return null;

  return isLabLabel(label)
    ? `/api/mobile/labs/${item.slug}/inquiry`
    : `/api/mobile/pharmacies/${item.slug}/inquiry`;
}

function buildFallbackWhatsappMessage(item: PlaceData, label: string) {
  const isLab = isLabLabel(label);
  const location = [item.governorate.name, item.area.name]
    .map(cleanText)
    .filter(Boolean)
    .join(" - ");

  const lines = [
    isLab
      ? "مرحباً، وصلت لكم عن طريق طب نت وأرغب بالاستفسار عن تحليل أو خدمة."
      : "مرحباً، وصلت لكم عن طريق طب نت وأرغب بالاستفسار عن دواء أو خدمة.",
    "",
    `${isLab ? "المختبر" : "الصيدلية"}: ${item.name}`,
    location ? `المنطقة: ${location}` : null,
    item.address ? `العنوان: ${item.address}` : null,
    item.services ? `الخدمات: ${item.services}` : null,
    item.workingHours ? `أوقات العمل: ${item.workingHours}` : null,
  ].filter(Boolean);

  return lines.join("\n");
}

export function PlaceCard({ item, label }: { item: PlaceData; label: string }) {
  const isLab = isLabLabel(label);
  const profileHref = getProfileHref(item, label);
  const inquiryHref = getInquiryHref(item, label);

  const fallbackWhatsappUrl = buildWhatsappUrl(
    item.whatsapp,
    buildFallbackWhatsappMessage(item, label)
  );

  const finalInquiryHref = inquiryHref || fallbackWhatsappUrl;

  const locationText = item.address
    ? item.address
    : `${item.governorate.name} - ${item.area.name}`;

  const kindLabel = isLab ? "مختبر طبي" : "صيدلية";
  const inquiryCount = item.inquiryCount ?? 0;

  return (
    <Card className="flex h-full flex-col overflow-hidden p-5">
      <div className="flex flex-1 gap-4">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-primary-soft bg-surface shadow-sm">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              sizes="96px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xl font-black text-primary">
              {isLab ? "مختبر" : "صيدلية"}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-black text-primary">
              {kindLabel}
            </span>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
              {inquiryCount} استفسار
            </span>
          </div>

          <h3 className="mt-2 line-clamp-2 text-lg font-black leading-7 text-navy md:text-xl">
            {item.name}
          </h3>

          <p className="mt-3 flex items-start gap-2 text-sm leading-7 text-slate-600">
            <MapPin
              className="mt-1 h-4 w-4 shrink-0 text-accent"
              aria-hidden="true"
            />
            <span className="line-clamp-2">{locationText}</span>
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {finalInquiryHref ? (
          <a href={finalInquiryHref} target="_blank" rel="noreferrer">
            <Button type="button" className="w-full">
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              استفسار
            </Button>
          </a>
        ) : null}

        {profileHref ? (
          <Link href={profileHref}>
            <Button type="button" variant="secondary" className="w-full">
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              التفاصيل
            </Button>
          </Link>
        ) : null}
      </div>
    </Card>
  );
}