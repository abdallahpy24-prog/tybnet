import Image from "next/image";
import { Clock, MapPin, MessageCircle, Navigation } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { buildWhatsappUrl } from "@/lib/whatsapp";

type PlaceData = {
  name: string;
  imageUrl?: string | null;
  whatsapp?: string | null;
  workingHours?: string | null;
  address?: string | null;
  mapurl?: string | null;
  mapUrl?: string | null;
  services?: string | null;
  governorate: {
    name: string;
  };
  area: {
    name: string;
  };
};

function normalizeMapUrl(value?: string | null) {
  const cleanValue = value?.trim();

  if (!cleanValue) return null;

  try {
    if (/^https?:\/\//i.test(cleanValue)) {
      return new URL(cleanValue).toString();
    }

    if (
      cleanValue.startsWith("www.google.com/maps") ||
      cleanValue.startsWith("google.com/maps") ||
      cleanValue.startsWith("maps.google.com") ||
      cleanValue.startsWith("maps.app.goo.gl") ||
      cleanValue.startsWith("goo.gl/maps") ||
      cleanValue.startsWith("maps.apple.com")
    ) {
      return new URL(`https://${cleanValue}`).toString();
    }

    if (/^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(cleanValue)) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        cleanValue
      )}`;
    }

    return null;
  } catch {
    return null;
  }
}

function readMapUrlFromText(value?: string | null) {
  const cleanValue = value?.trim();

  if (!cleanValue) return null;

  const directUrl = normalizeMapUrl(cleanValue);

  if (directUrl) return directUrl;

  const match = cleanValue.match(
    /(https?:\/\/(?:www\.)?google\.com\/maps[^\s،]+|https?:\/\/maps\.google\.com[^\s،]+|https?:\/\/maps\.app\.goo\.gl[^\s،]+|https?:\/\/goo\.gl\/maps[^\s،]+|https?:\/\/maps\.apple\.com[^\s،]+)/i
  );

  if (!match?.[0]) return null;

  return normalizeMapUrl(match[0]);
}

export function PlaceCard({ item, label }: { item: PlaceData; label: string }) {
  const whatsappUrl = buildWhatsappUrl(
    item.whatsapp,
    `مرحباً، وصلت إلى ${item.name} عبر منصة طب نت، وأرغب بالاستفسار عن الخدمات أو أوقات الدوام.`
  );

  const mapUrl =
    normalizeMapUrl(item.mapUrl) ??
    normalizeMapUrl(item.mapurl) ??
    readMapUrlFromText(item.address);

  const locationText = item.address
    ? item.address
    : `${item.governorate.name} - ${item.area.name}`;

  const hasActions = Boolean(whatsappUrl || mapUrl);

  return (
    <Card className="flex h-full flex-col">
      <div className="relative mb-4 aspect-[16/9] overflow-hidden rounded-xl bg-primary-soft">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-2xl font-black text-primary">
            {label}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col">
        <h3 className="text-xl font-black text-navy">{item.name}</h3>

        <p className="mt-2 flex items-start gap-2 text-sm leading-7 text-slate-600">
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

        {item.services ? (
          <p className="mt-3 text-sm leading-7 text-slate-600">
            {item.services}
          </p>
        ) : null}

        {hasActions ? (
          <div className="mt-auto grid gap-2 pt-5 sm:grid-cols-2">
            {whatsappUrl ? (
              <a href={whatsappUrl} target="_blank" rel="noreferrer">
                <Button type="button" className="w-full">
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  واتساب
                </Button>
              </a>
            ) : null}

            {mapUrl ? (
              <a href={mapUrl} target="_blank" rel="noreferrer">
                <Button type="button" variant="secondary" className="w-full">
                  <Navigation className="h-4 w-4" aria-hidden="true" />
                  الموقع
                </Button>
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </Card>
  );
}