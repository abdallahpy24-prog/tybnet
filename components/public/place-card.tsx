import { normalizeDisplayImageUrl } from "@/lib/image-url";
import Image from "next/image";
import Link from "next/link";
import {
  Clock3,
  ExternalLink,
  FlaskConical,
  MapPin,
  MessageCircleMore,
  ShieldCheck,
  Sparkles,
  Store
} from "lucide-react";

import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { buildWhatsappUrl } from "@/lib/whatsapp";

type PlaceKind = "pharmacy" | "lab" | "cosmetic-center";

type PlaceData = {
  name: string;
  slug?: string | null;
  imageUrl?: string | null;
  imageThumbnailUrl?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  workingHours?: string | null;
  address?: string | null;
  bio?: string | null;
  services?: string | null;
  lastVerifiedAt?: string | Date | null;
  governorate: { name: string };
  area: { name: string };
};

type PlaceCardProps = {
  item: PlaceData;
  label: string;
  kind?: PlaceKind;
  returnTo?: string;
};

function inferKind(label: string, providedKind?: PlaceKind): PlaceKind {
  if (providedKind) return providedKind;
  if (label.includes("مختبر") || label.includes("تحليل")) return "lab";
  if (label.includes("تجميل")) return "cosmetic-center";
  return "pharmacy";
}

function getProfileHref(item: PlaceData, kind: PlaceKind, returnTo?: string) {
  if (!item.slug) return null;

  const base =
    kind === "lab"
      ? `/labs/${item.slug}`
      : kind === "cosmetic-center"
        ? `/cosmetic-centers/${item.slug}`
        : `/pharmacies/${item.slug}`;

  return returnTo ? `${base}?from=${encodeURIComponent(returnTo)}` : base;
}

function kindMeta(kind: PlaceKind) {
  if (kind === "lab") {
    return { label: "مختبر طبي", Icon: FlaskConical };
  }

  if (kind === "cosmetic-center") {
    return { label: "مركز تجميل", Icon: Sparkles };
  }

  return { label: "صيدلية", Icon: Store };
}

function verificationLabel(value?: string | Date | null) {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("ar-IQ", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Baghdad"
  }).format(date);
}

export function PlaceCard({ item, label, kind: providedKind, returnTo }: PlaceCardProps) {
  const kind = inferKind(label, providedKind);
  const { label: kindLabel, Icon } = kindMeta(kind);
  const profileHref = getProfileHref(item, kind, returnTo);
  const cardImageUrl = normalizeDisplayImageUrl(item.imageThumbnailUrl) || normalizeDisplayImageUrl(item.imageUrl);
  const verifiedAt = verificationLabel(item.lastVerifiedAt);
  const whatsappUrl = buildWhatsappUrl(
    item.whatsapp || item.phone,
    `مرحبا، وصلت إلى ${item.name} عبر طب نت وأرغب بالاستفسار.`
  );

  return (
    <Card className="flex h-full flex-col p-5">
      <div className="flex items-start gap-4">
        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-borderSoft bg-slate-50">
          {cardImageUrl ? (
            <Image
              src={cardImageUrl}
              alt={`صورة ${item.name}`}
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <Icon className="h-8 w-8 text-primary" aria-hidden="true" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <span className="inline-flex rounded-full bg-primary-soft px-3 py-1 text-xs font-black text-primary-dark">
            {kindLabel}
          </span>

          <h3 className="mt-2 line-clamp-2 text-lg font-black leading-7 text-navy md:text-xl">
            {item.name}
          </h3>

          <p className="mt-2 flex items-start gap-2 text-sm leading-6 text-slate-600">
            <MapPin className="mt-1 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
            <span className="line-clamp-2">
              {item.governorate.name} · {item.area.name}
              {item.address ? ` — ${item.address}` : ""}
            </span>
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2 border-t border-borderSoft pt-4 text-sm text-slate-600">
        {item.workingHours ? (
          <p className="flex items-start gap-2">
            <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            <span className="line-clamp-2">{item.workingHours}</span>
          </p>
        ) : null}

        {verifiedAt ? (
          <p className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-700" aria-hidden="true" />
            آخر تحقق من البيانات: <bdi dir="ltr">{verifiedAt}</bdi>
          </p>
        ) : null}
      </div>

      <div className="mt-auto grid gap-2 pt-5 sm:grid-cols-2">
        {profileHref ? (
          <Link
            href={profileHref}
            className={buttonStyles({
              variant: "secondary",
              className: cn(!whatsappUrl && "sm:col-span-2")
            })}
            aria-label={`عرض تفاصيل ${item.name}`}
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            عرض التفاصيل
          </Link>
        ) : null}

        {whatsappUrl ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonStyles()}
            aria-label={`التواصل مع ${item.name} عبر واتساب`}
          >
            <MessageCircleMore className="h-4 w-4" aria-hidden="true" />
            واتساب
          </a>
        ) : null}
      </div>
    </Card>
  );
}
