import { normalizeDisplayImageUrl } from "@/lib/image-url";
import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  Clock3,
  MapPin,
  MessageCircle,
  Stethoscope
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { buildWhatsappUrl } from "@/lib/whatsapp";

type ProviderCardData = {
  name: string;
  titlePrefix: string;
  slug: string;
  imageUrl?: string | null;
  imageThumbnailUrl?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  address?: string | null;
  lastVerifiedAt?: string | null;
  specialty?: {
    name: string;
  } | null;
  governorate: {
    name: string;
  };
  area: {
    name: string;
  };
  isFeatured?: boolean;
};

type ProviderCardProps = {
  provider: ProviderCardData;
  compact?: boolean;
  detailBasePath?: string;
  showSpecialty?: boolean;
  returnTo?: string;
};

function formatVerificationDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("ar-IQ", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Baghdad"
  }).format(date);
}

export function ProviderCard({
  provider,
  compact = false,
  detailBasePath = "/providers",
  showSpecialty = true,
  returnTo
}: ProviderCardProps) {
  const displayName = `${
    provider.titlePrefix ? `${provider.titlePrefix} ` : ""
  }${provider.name}`;

  const cardImageUrl = normalizeDisplayImageUrl(provider.imageThumbnailUrl) || normalizeDisplayImageUrl(provider.imageUrl);
  const verificationDate = formatVerificationDate(provider.lastVerifiedAt);
  const baseDetailsHref = `${detailBasePath.replace(/\/$/, "")}/${provider.slug}`;
  const detailsHref = returnTo
    ? `${baseDetailsHref}?from=${encodeURIComponent(returnTo)}`
    : baseDetailsHref;
  const whatsappUrl = buildWhatsappUrl(
    provider.whatsapp || provider.phone,
    `مرحباً، وصلت إلى ${displayName} عبر منصة طب نت وأرغب بالاستفسار عن المواعيد المتاحة.`
  );

  return (
    <Card
      className={[
        "flex h-full flex-col overflow-hidden",
        compact ? "p-4" : "p-5"
      ].join(" ")}
    >
      <div className="flex flex-1 gap-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-borderSoft bg-surface sm:h-24 sm:w-24">
          {cardImageUrl ? (
            <Image
              src={cardImageUrl}
              alt={displayName}
              fill
              sizes="96px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-primary-dark" aria-hidden="true">
              <Stethoscope className="h-8 w-8" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          {provider.isFeatured ? (
            <Badge title="إبراز داخل طب نت، وليس تقييماً طبياً">
              ملف مميز
            </Badge>
          ) : null}

          <h3 className="mt-2 line-clamp-2 text-lg font-black leading-7 text-navy md:text-xl">
            {displayName}
          </h3>

          {showSpecialty ? (
            <p className="mt-2 line-clamp-1 text-sm font-bold text-primary-dark">
              {provider.specialty?.name ?? "الاختصاص غير محدد"}
            </p>
          ) : null}

          <p className="mt-2 flex items-start gap-2 text-sm leading-6 text-slate-600">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary-dark" aria-hidden="true" />
            <span>
              {provider.governorate.name} - {provider.area.name}
            </span>
          </p>

          {provider.address ? (
            <p className="mt-1 line-clamp-2 text-xs font-semibold leading-6 text-slate-500">
              {provider.address}
            </p>
          ) : null}

          {verificationDate ? (
            <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-slate-500">
              <BadgeCheck className="h-4 w-4 text-primary-dark" aria-hidden="true" />
              آخر تحقق من البيانات: {verificationDate}
            </p>
          ) : (
            <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400">
              <Clock3 className="h-4 w-4" aria-hidden="true" />
              تاريخ التحقق غير متوفر بعد
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        <Link
          href={detailsHref}
          className={buttonStyles({
            variant: whatsappUrl ? "secondary" : "primary",
            className: "w-full"
          })}
          aria-label={`عرض ملف ${displayName}`}
        >
          عرض الملف
        </Link>

        {whatsappUrl ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonStyles({ className: "w-full" })}
            aria-label={`التواصل مع ${displayName} عبر واتساب`}
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            واتساب
          </a>
        ) : null}
      </div>
    </Card>
  );
}
