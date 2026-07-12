import Image from "next/image";
import Link from "next/link";
import {
  Eye,
  Instagram,
  MapPin,
  Star
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type ProviderCardData = {
  name: string;
  titlePrefix: string;
  slug: string;
  imageUrl?: string | null;
  whatsapp?: string | null;
  instagramUrl?: string | null;
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
  bookingPoints?: number;
};

type ProviderCardProps = {
  provider: ProviderCardData;
  compact?: boolean;
  detailBasePath?: string;
};

export function ProviderCard({
  provider,
  compact = false,
  detailBasePath = "/providers"
}: ProviderCardProps) {
  const displayName = `${
    provider.titlePrefix
      ? `${provider.titlePrefix} `
      : ""
  }${provider.name}`;

  const bookingPoints =
    provider.bookingPoints ?? 0;

  const detailsHref = `${detailBasePath.replace(
    /\/$/,
    ""
  )}/${provider.slug}`;

  return (
    <Card
      className={[
        "flex h-full flex-col overflow-hidden",
        compact ? "p-4" : "p-5"
      ].join(" ")}
    >
      <div className="flex flex-1 gap-4">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-primary-soft bg-surface shadow-sm">
          {provider.imageUrl ? (
            <Image
              src={provider.imageUrl}
              alt={displayName}
              fill
              sizes="96px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl font-black text-primary">
              طب
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {provider.isFeatured ? (
              <Badge>مميز</Badge>
            ) : null}

            <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-[11px] font-black text-slate-500">
              <Star
                className="h-3 w-3 text-accent"
                aria-hidden="true"
              />
              النقاط: {bookingPoints}
            </span>
          </div>

          <h3 className="mt-2 line-clamp-2 text-lg font-black leading-7 text-navy md:text-xl">
            {displayName}
          </h3>

          <p className="mt-2 line-clamp-1 text-sm font-bold text-primary-dark">
            {provider.specialty?.name ??
              "الاختصاص غير محدد"}
          </p>

          <p className="mt-2 flex items-center gap-2 text-sm leading-6 text-slate-600">
            <MapPin
              className="h-4 w-4 shrink-0 text-accent"
              aria-hidden="true"
            />

            <span className="line-clamp-1">
              {provider.governorate.name} -{" "}
              {provider.area.name}
            </span>
          </p>

          {provider.instagramUrl ? (
            <p className="mt-2 flex items-center gap-2 text-sm text-slate-500 ltr">
              <Instagram
                className="h-4 w-4 shrink-0 text-primary"
                aria-hidden="true"
              />

              <span className="line-clamp-1">
                {provider.instagramUrl.replace(
                  /^https?:\/\/(www\.)?/,
                  ""
                )}
              </span>
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-5">
        <Link
          href={detailsHref}
          className="block w-full"
        >
          <Button
            type="button"
            className="w-full"
          >
            <Eye
              className="h-4 w-4"
              aria-hidden="true"
            />
            عرض التفاصيل
          </Button>
        </Link>
      </div>
    </Card>
  );
}