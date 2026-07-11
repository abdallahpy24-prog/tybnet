import Image from "next/image";
import Link from "next/link";
import {
  ExternalLink,
  MapPin,
  MessageCircle
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { buildWhatsappUrl } from "@/lib/whatsapp";

type PlaceKind =
  | "pharmacy"
  | "lab"
  | "cosmetic-center";

type PlaceData = {
  name: string;
  slug?: string | null;
  imageUrl?: string | null;
  whatsapp?: string | null;
  instagramUrl?: string | null;
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

type PlaceCardProps = {
  item: PlaceData;
  label: string;
  kind?: PlaceKind;
};

function cleanText(value?: string | null) {
  return String(value || "").trim();
}

function inferKind(
  label: string,
  providedKind?: PlaceKind
): PlaceKind {
  if (providedKind) {
    return providedKind;
  }

  if (
    label.includes("مختبر") ||
    label.includes("تحليل")
  ) {
    return "lab";
  }

  return "pharmacy";
}

function getProfileHref(
  item: PlaceData,
  kind: PlaceKind
) {
  if (!item.slug) {
    return null;
  }

  if (kind === "lab") {
    return `/labs/${item.slug}`;
  }

  if (kind === "cosmetic-center") {
    return `/cosmetic-centers/${item.slug}`;
  }

  return `/pharmacies/${item.slug}`;
}

function getInquiryHref(
  item: PlaceData,
  kind: PlaceKind
) {
  if (item.inquiryUrl) {
    return item.inquiryUrl;
  }

  if (!item.slug) {
    return null;
  }

  if (kind === "lab") {
    return `/api/mobile/labs/${item.slug}/inquiry`;
  }

  if (kind === "cosmetic-center") {
    return `/api/mobile/cosmetic-centers/${item.slug}/inquiry`;
  }

  return `/api/mobile/pharmacies/${item.slug}/inquiry`;
}

function buildFallbackWhatsappMessage(
  item: PlaceData,
  kind: PlaceKind
) {
  const location = [
    item.governorate.name,
    item.area.name
  ]
    .map(cleanText)
    .filter(Boolean)
    .join(" - ");

  const intro =
    kind === "lab"
      ? "مرحباً، وصلت لكم عن طريق طب نت وأرغب بالاستفسار عن تحليل أو خدمة."
      : kind === "cosmetic-center"
        ? "مرحباً، وصلت لكم عن طريق طب نت وأرغب بالاستفسار عن خدمة تجميلية أو موعد."
        : "مرحباً، وصلت لكم عن طريق طب نت وأرغب بالاستفسار عن دواء أو خدمة.";

  const placeLabel =
    kind === "lab"
      ? "المختبر"
      : kind === "cosmetic-center"
        ? "مركز التجميل"
        : "الصيدلية";

  const lines = [
    intro,
    "",
    `${placeLabel}: ${item.name}`,
    location
      ? `المنطقة: ${location}`
      : null,
    item.address
      ? `العنوان: ${item.address}`
      : null,
    item.services
      ? `الخدمات: ${item.services}`
      : null,
    item.workingHours
      ? `أوقات العمل: ${item.workingHours}`
      : null
  ].filter(Boolean);

  return lines.join("\n");
}

function placeKindLabel(kind: PlaceKind) {
  if (kind === "lab") {
    return "مختبر طبي";
  }

  if (kind === "cosmetic-center") {
    return "مركز تجميل";
  }

  return "صيدلية";
}

function fallbackImageLabel(kind: PlaceKind) {
  if (kind === "lab") {
    return "مختبر";
  }

  if (kind === "cosmetic-center") {
    return "تجميل";
  }

  return "صيدلية";
}

export function PlaceCard({
  item,
  label,
  kind: providedKind
}: PlaceCardProps) {
  const kind = inferKind(
    label,
    providedKind
  );

  const profileHref = getProfileHref(
    item,
    kind
  );

  const inquiryHref = getInquiryHref(
    item,
    kind
  );

  const fallbackWhatsappUrl =
    buildWhatsappUrl(
      item.whatsapp,
      buildFallbackWhatsappMessage(
        item,
        kind
      )
    );

  const finalInquiryHref =
    inquiryHref || fallbackWhatsappUrl;

  const locationText =
    item.address ||
    `${item.governorate.name} - ${item.area.name}`;

  const kindLabel = placeKindLabel(kind);
  const imageLabel =
    fallbackImageLabel(kind);

  const inquiryCount =
    item.inquiryCount ?? 0;

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
            <div className="flex h-full w-full items-center justify-center text-lg font-black text-primary">
              {imageLabel}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-black text-primary">
              {kindLabel}
            </span>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
              النقاط: {inquiryCount}
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

            <span className="line-clamp-2">
              {locationText}
            </span>
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {finalInquiryHref ? (
          <a
            href={finalInquiryHref}
            target="_blank"
            rel="noreferrer"
          >
            <Button
              type="button"
              className="w-full"
            >
              <MessageCircle
                className="h-4 w-4"
                aria-hidden="true"
              />
              استفسار
            </Button>
          </a>
        ) : null}

        {profileHref ? (
          <Link href={profileHref}>
            <Button
              type="button"
              variant="secondary"
              className="w-full"
            >
              <ExternalLink
                className="h-4 w-4"
                aria-hidden="true"
              />
              التفاصيل
            </Button>
          </Link>
        ) : null}
      </div>
    </Card>
  );
}