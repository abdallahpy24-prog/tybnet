import { normalizeDisplayImageUrl } from "@/lib/image-url";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  FlaskConical,
  Instagram,
  MapPin,
  MessageCircleMore,
  Phone,
  Pill,
  ShieldCheck,
  Sparkles
} from "lucide-react";

import { SiteShell } from "@/components/layout/site-shell";
import { ProfileActions } from "@/components/public/profile-actions";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { instagramLabel } from "@/lib/instagram";
import { normalizeTrustedMapUrl, trustedMapUrlFromText } from "@/lib/maps";
import { normalizeArabicDigits } from "@/lib/search";
import { buildWhatsappUrl } from "@/lib/whatsapp";

type PlaceKind = "PHARMACY" | "LAB" | "COSMETIC_CENTER";

type PlaceProfileData = {
  id: string;
  name: string;
  slug: string;
  bio?: string | null;
  services?: string | null;
  address?: string | null;
  mapurl?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  instagramUrl?: string | null;
  imageUrl?: string | null;
  imageThumbnailUrl?: string | null;
  imageOriginalUrl?: string | null;
  workingHours?: string | null;
  isFeatured?: boolean;
  lastVerifiedAt?: Date | null;
  governorate: { name: string };
  area: { name: string };
};

type Props = {
  kind: PlaceKind;
  place: PlaceProfileData;
  listPath: string;
  backHref: string;
  backLabel: string;
};

function kindMeta(kind: PlaceKind) {
  if (kind === "LAB") {
    return {
      label: "مختبر طبي",
      Icon: FlaskConical,
      action: "التحاليل والخدمات"
    };
  }

  if (kind === "COSMETIC_CENTER") {
    return {
      label: "مركز تجميل",
      Icon: Sparkles,
      action: "الخدمات المتوفرة"
    };
  }

  return {
    label: "صيدلية",
    Icon: Pill,
    action: "الخدمات المتوفرة"
  };
}

function telHref(value?: string | null) {
  if (!value) return null;
  const phone = normalizeArabicDigits(value).replace(/[^\d+]/g, "");
  return phone ? `tel:${phone}` : null;
}

function verifiedLabel(value?: Date | null) {
  if (!value) return null;
  return new Intl.DateTimeFormat("ar-IQ", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Baghdad"
  }).format(value);
}

export function PlaceProfile({ kind, place, backHref, backLabel }: Props) {
  const { label, Icon, action } = kindMeta(kind);
  const image = normalizeDisplayImageUrl(place.imageUrl) || normalizeDisplayImageUrl(place.imageThumbnailUrl) || normalizeDisplayImageUrl(place.imageOriginalUrl);
  const originalImage = normalizeDisplayImageUrl(place.imageOriginalUrl) || normalizeDisplayImageUrl(place.imageUrl) || image;
  const mapUrl = normalizeTrustedMapUrl(place.mapurl) ?? trustedMapUrlFromText(place.address);
  const addressIsOnlyMap = Boolean(place.address && normalizeTrustedMapUrl(place.address));
  const phoneUrl = telHref(place.phone);
  const whatsappUrl = buildWhatsappUrl(
    place.whatsapp || place.phone,
    `مرحباً، وصلت إلى ${place.name} عبر طب نت وأرغب بالاستفسار عن الخدمات المتاحة.`
  );
  const lastVerified = verifiedLabel(place.lastVerifiedAt);

  return (
    <SiteShell>
      <section className="container-page py-8">
        <Link
          href={backHref}
          className="focus-ring mb-5 inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-black text-primary-dark hover:text-primary"
        >
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
          {backLabel}
        </Link>

        <Card className="overflow-hidden p-0">
          <div className="grid gap-6 p-6 md:grid-cols-[180px_minmax(0,1fr)] md:items-start">
            <div className="relative mx-auto flex h-40 w-40 items-center justify-center overflow-hidden rounded-3xl border border-borderSoft bg-slate-50 md:mx-0">
              {image ? (
                originalImage ? (
                  <a
                    href={originalImage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block h-full w-full cursor-zoom-in"
                    aria-label={`فتح صورة ${place.name} بالحجم الأصلي`}
                  >
                    <Image src={image} alt={`صورة ${place.name}`} fill sizes="160px" className="object-cover" />
                  </a>
                ) : (
                  <Image src={image} alt={`صورة ${place.name}`} fill sizes="160px" className="object-cover" />
                )
              ) : (
                <Icon className="h-14 w-14 text-primary" aria-hidden="true" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap gap-2">
                <Badge>{label}</Badge>
                {place.isFeatured ? (
                  <Badge title="ظهور مميز داخل طب نت، ولا يمثل تقييماً للخدمة">ملف مميز</Badge>
                ) : null}
              </div>

              <h1 className="mt-3 text-3xl font-black leading-tight text-navy md:text-4xl">
                {place.name}
              </h1>

              <div className="mt-4 grid gap-2 text-sm leading-7 text-slate-600">
                <p className="flex items-start gap-2">
                  <MapPin className="mt-1 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                  <span>
                    {place.governorate.name} · {place.area.name}
                    {place.address && !addressIsOnlyMap ? ` — ${place.address}` : ""}
                  </span>
                </p>

                {place.workingHours ? (
                  <p className="flex items-start gap-2">
                    <Clock3 className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    <span>{place.workingHours}</span>
                  </p>
                ) : (
                  <p className="text-xs font-bold text-amber-800">أوقات الدوام غير مؤكدة؛ تواصل قبل الزيارة.</p>
                )}

                {lastVerified ? (
                  <p className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <ShieldCheck className="h-4 w-4 text-emerald-700" aria-hidden="true" />
                    آخر تحقق من البيانات: <bdi dir="ltr">{lastVerified}</bdi>
                  </p>
                ) : null}
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {whatsappUrl ? (
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={buttonStyles()}>
                    <MessageCircleMore className="h-4 w-4" aria-hidden="true" />
                    واتساب
                  </a>
                ) : null}
                {phoneUrl ? (
                  <a href={phoneUrl} className={buttonStyles({ variant: "secondary" })}>
                    <Phone className="h-4 w-4" aria-hidden="true" />
                    اتصال
                  </a>
                ) : null}
                {mapUrl ? (
                  <a href={mapUrl} target="_blank" rel="noopener noreferrer" className={buttonStyles({ variant: "secondary" })}>
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                    الخريطة
                  </a>
                ) : null}
                {place.instagramUrl ? (
                  <a href={place.instagramUrl} target="_blank" rel="noopener noreferrer" className={buttonStyles({ variant: "ghost" })}>
                    <Instagram className="h-4 w-4" aria-hidden="true" />
                    {instagramLabel(place.instagramUrl)}
                  </a>
                ) : null}
              </div>

              <ProfileActions
                entityType={kind}
                entityId={place.id}
                entitySlug={place.slug}
                entityName={place.name}
              />
            </div>
          </div>
        </Card>

        {(place.bio || place.services) ? (
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {place.bio ? (
              <Card>
                <h2 className="text-xl font-black text-navy">نبذة</h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-8 text-slate-700">{place.bio}</p>
              </Card>
            ) : null}

            {place.services ? (
              <Card>
                <h2 className="text-xl font-black text-navy">{action}</h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-8 text-slate-700">{place.services}</p>
              </Card>
            ) : null}
          </div>
        ) : null}

        <Card className="mt-6">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary-dark">
              <ShieldCheck className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-black text-navy">تحقق قبل الزيارة</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                قد تتغير أوقات الدوام وتوفر الخدمات. استخدم رقم الهاتف أو واتساب للتأكد من التفاصيل قبل التوجه إلى المكان. ظهور الملف في طب نت لا يمثل تقييماً طبياً أو ضماناً للخدمة.
              </p>
            </div>
          </div>
        </Card>
      </section>
    </SiteShell>
  );
}
