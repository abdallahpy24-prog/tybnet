import Image from "next/image";
import Link from "next/link";
import { Clock, ExternalLink, MapPin, MessageCircle } from "lucide-react";

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
  const summaryText = item.bio || item.services;

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <div className="relative mb-4 aspect-[16/9] overflow-hidden rounded-xl bg-primary-soft">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition duration-300 hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-2xl font-black text-primary">
            {label}
          </div>
        )}

        <span className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-black text-navy shadow-sm">
          {kindLabel}
        </span>
      </div>

      <div className="flex flex-1 flex-col">
        <h3 className="text-xl font-black leading-8 text-navy">{item.name}</h3>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-black text-primary">
            {kindLabel}
          </span>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
            {inquiryCount} استفسار
          </span>
        </div>

        <p className="mt-3 flex items-start gap-2 text-sm leading-7 text-slate-600">
          <MapPin
            className="mt-1 h-4 w-4 shrink-0 text-accent"
            aria-hidden="true"
          />
          <span>{locationText}</span>
        </p>

        {item.workingHours ? (
          <p className="mt-2 flex items-start gap-2 text-sm leading-7 text-slate-600">
            <Clock
              className="mt-1 h-4 w-4 shrink-0 text-primary"
              aria-hidden="true"
            />
            <span>{item.workingHours}</span>
          </p>
        ) : null}

        {summaryText ? (
          <p className="mt-3 line-clamp-2 text-sm leading-7 text-slate-600">
            {summaryText}
          </p>
        ) : null}

        <div className="mt-auto grid gap-2 pt-5 sm:grid-cols-2">
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
      </div>
    </Card>
  );
}