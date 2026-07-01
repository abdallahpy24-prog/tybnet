import Image from "next/image";
import Link from "next/link";
import { Eye, Instagram, MapPin, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { buildWhatsappUrl } from "@/lib/whatsapp";

type ProviderCardData = {
  name: string;
  titlePrefix: string;
  slug: string;
  imageUrl?: string | null;
  whatsapp?: string | null;
  instagramUrl?: string | null;
  specialty?: { name: string } | null;
  governorate: { name: string };
  area: { name: string };
  isFeatured?: boolean;
};

export function ProviderCard({
  provider,
  compact = false
}: {
  provider: ProviderCardData;
  compact?: boolean;
}) {
  const displayName = (provider.titlePrefix ? provider.titlePrefix + " " : "") + provider.name;

  const whatsappUrl = buildWhatsappUrl(
    provider.whatsapp,
    `مرحباً، وصلت إلى ${displayName} عبر منصة طب نت، وأرغب بالاستفسار عن الحجز أو المواعيد المتاحة.`
  );

  return (
    <Card className={compact ? "h-full" : "h-full md:flex md:items-center md:gap-5"}>
      <div className="mb-4 flex items-center gap-4 md:mb-0">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-primary-soft bg-surface">
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

        <div className="md:hidden">
          {provider.isFeatured ? <Badge>مميز</Badge> : null}
          <h3 className="mt-2 text-lg font-black text-navy">{displayName}</h3>
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="hidden md:block">
          {provider.isFeatured ? <Badge>مميز</Badge> : null}
          <h3 className="mt-2 text-xl font-black text-navy">{displayName}</h3>
        </div>

        <p className="mt-2 text-sm font-bold text-primary-dark">
          {provider.specialty?.name ?? "الاختصاص غير محدد"}
        </p>

        <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
          <MapPin className="h-4 w-4 text-accent" aria-hidden="true" />
          {provider.governorate.name} - {provider.area.name}
        </p>

        {provider.instagramUrl ? (
          <p className="mt-2 flex items-center gap-2 text-sm text-slate-500 ltr">
            <Instagram className="h-4 w-4 text-primary" aria-hidden="true" />
            {provider.instagramUrl.replace(/^https?:\/\/(www\.)?/, "")}
          </p>
        ) : null}
      </div>

      <div className="mt-5 flex flex-wrap gap-2 md:mt-0 md:w-44 md:flex-col">
        <Link href={"/providers/" + provider.slug} className="flex-1 md:flex-none">
          <Button type="button" variant="secondary" className="w-full">
            <Eye className="h-4 w-4" aria-hidden="true" />
            عرض الملف
          </Button>
        </Link>

        {whatsappUrl ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="flex-1 md:flex-none"
          >
            <Button type="button" className="w-full">
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              تواصل واتساب
            </Button>
          </a>
        ) : null}
      </div>
    </Card>
  );
}