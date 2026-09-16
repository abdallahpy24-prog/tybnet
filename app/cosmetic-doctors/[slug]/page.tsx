import { normalizeDisplayImageUrl } from "@/lib/image-url";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Clock3,
  Instagram,
  MapPin,
  MessageCircleMore,
  Phone,
  ShieldCheck,
  Stethoscope
} from "lucide-react";

import { SiteShell } from "@/components/layout/site-shell";
import { AppointmentForm } from "@/components/public/appointment-form";
import { OfferCard } from "@/components/public/offer-card";
import { ProfileActions } from "@/components/public/profile-actions";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { instagramLabel } from "@/lib/instagram";
import { normalizeTrustedMapUrl, trustedMapUrlFromText } from "@/lib/maps";
import { getCosmeticDoctorBySlug } from "@/lib/queries";
import { normalizeArabicDigits } from "@/lib/search";
import { buildWhatsappUrl } from "@/lib/whatsapp";

function getSiteUrl() {
  return (
    process.env.PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.AUTH_URL ||
    "https://www.tybnet.com"
  ).replace(/\/$/, "");
}

function displayName(provider: { name: string; titlePrefix: string | null }) {
  return `${provider.titlePrefix || ""} ${provider.name}`.trim();
}

function telHref(phone?: string | null) {
  if (!phone) return null;
  const normalized = normalizeArabicDigits(phone).replace(/[^\d+]/g, "");
  return normalized ? `tel:${normalized}` : null;
}

function formatVerificationDate(value?: Date | null) {
  if (!value) return null;

  return new Intl.DateTimeFormat("ar-IQ", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Baghdad"
  }).format(value);
}

function safeReturnPath(value: unknown, fallback: string) {
  if (typeof value !== "string" || !value || value.includes("\n") || value.includes("\r") || value.startsWith("//")) {
    return fallback;
  }

  if (value === fallback || value.startsWith(`${fallback}?`)) return value;
  return fallback;
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const provider = await getCosmeticDoctorBySlug(slug);

  if (!provider) return { title: "مقدم الخدمة غير موجود" };

  const name = displayName(provider);
  const specialty = provider.specialty?.name || "طبيب تجميل";
  const title = `${name} – ${specialty} – ${provider.area.name}`;
  const description =
    provider.bio ||
    `${name}، ${specialty} في ${provider.governorate.name} – ${provider.area.name}. معلومات العيادة والتواصل على طب نت.`;
  const canonical = `/cosmetic-doctors/${provider.slug}`;
  const image = normalizeDisplayImageUrl(provider.imageUrl) || normalizeDisplayImageUrl(provider.imageThumbnailUrl) || "/assets/logo.png";

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "profile",
      title,
      description,
      url: canonical,
      siteName: "طب نت",
      locale: "ar_IQ",
      images: [image]
    }
  };
}

export default async function CosmeticDoctorDetailsPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ from?: string | string[] }>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams ?? Promise.resolve<{ from?: string | string[] }>({})]);
  const provider = await getCosmeticDoctorBySlug(slug);

  if (!provider) notFound();

  const name = displayName(provider);
  const listPath = "/cosmetic-doctors";
  const backHref = safeReturnPath(query.from, listPath);
  const backLabel = "العودة إلى نتائج أطباء التجميل";
  const specialtyLabel = provider.specialty?.name || "جراحة وتجميل";
  const clinicMapUrl =
    normalizeTrustedMapUrl(provider.mapurl) ?? trustedMapUrlFromText(provider.address);
  const phoneUrl = telHref(provider.phone);
  const whatsappUrl = buildWhatsappUrl(
    provider.whatsapp || provider.phone,
    `مرحباً، وصلت إلى ${name} عبر طب نت وأرغب بالاستفسار عن المواعيد المتاحة.`
  );
  const verifiedAt = formatVerificationDate(provider.lastVerifiedAt);
  const profileImageUrl = normalizeDisplayImageUrl(provider.imageUrl) || normalizeDisplayImageUrl(provider.imageThumbnailUrl) || normalizeDisplayImageUrl(provider.imageOriginalUrl);
  const originalImageUrl = normalizeDisplayImageUrl(provider.imageOriginalUrl) || normalizeDisplayImageUrl(provider.imageUrl) || profileImageUrl;
  const addressLooksLikeMapOnly = Boolean(
    provider.address &&
      (normalizeTrustedMapUrl(provider.address) ||
        provider.address.trim() === trustedMapUrlFromText(provider.address))
  );
  const canonicalUrl = `${getSiteUrl()}/cosmetic-doctors/${provider.slug}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Physician",
    name,
    url: canonicalUrl,
    image: profileImageUrl || undefined,
    telephone: provider.phone || undefined,
    medicalSpecialty: provider.specialty?.name || undefined,
    address: {
      "@type": "PostalAddress",
      addressRegion: provider.governorate.name,
      addressLocality: provider.area.name,
      streetAddress:
        provider.address && !addressLooksLikeMapOnly ? provider.address : undefined,
      addressCountry: "IQ"
    }
  };

  return (
    <SiteShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />

      <section className="container-page py-8">
        <Link
          href={backHref}
          className="focus-ring mb-5 inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-black text-primary-dark transition hover:text-primary"
        >
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
          {backLabel}
        </Link>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <Card className="overflow-hidden p-0 self-start">
            <div className="grid gap-6 p-6 md:grid-cols-[180px_minmax(0,1fr)] md:items-start">
              <div className="relative mx-auto h-40 w-40 overflow-hidden rounded-3xl border border-borderSoft bg-slate-50 md:mx-0">
                {profileImageUrl ? (
                  originalImageUrl ? (
                    <a
                      href={originalImageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`فتح صورة ${name} بالحجم الأصلي`}
                      className="block h-full w-full cursor-zoom-in"
                    >
                      <Image src={profileImageUrl} alt={`صورة ${name}`} fill sizes="160px" className="object-cover" />
                    </a>
                  ) : (
                    <Image src={profileImageUrl} alt={`صورة ${name}`} fill sizes="160px" className="object-cover" />
                  )
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Stethoscope className="h-14 w-14 text-primary" aria-hidden="true" />
                  </div>
                )}
              </div>

              <div className="min-w-0">
                {provider.isFeatured ? (
                  <Badge title="ظهور مميز داخل طب نت، ولا يمثل تقييماً طبياً لجودة الطبيب">
                    ملف مميز
                  </Badge>
                ) : null}

                <h1 className="mt-3 text-3xl font-black leading-tight text-navy md:text-4xl">
                  {name}
                </h1>

                <p className="mt-3 flex items-center gap-2 text-lg font-bold text-primary-dark">
                  <Stethoscope className="h-5 w-5" aria-hidden="true" />
                  {specialtyLabel}
                </p>

                <div className="mt-4 grid gap-2 text-sm leading-7 text-slate-600">
                  <p className="flex items-start gap-2">
                    <MapPin className="mt-1 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                    <span>
                      {provider.governorate.name} · {provider.area.name}
                      {provider.address && !addressLooksLikeMapOnly ? ` — ${provider.address}` : ""}
                    </span>
                  </p>

                  {provider.workingHours ? (
                    <p className="flex items-start gap-2">
                      <Clock3 className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                      <span>{provider.workingHours}</span>
                    </p>
                  ) : (
                    <p className="text-xs font-bold text-amber-800">أوقات الدوام غير مؤكدة؛ يُفضّل التواصل قبل الزيارة.</p>
                  )}

                  {verifiedAt ? (
                    <p className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <ShieldCheck className="h-4 w-4 text-emerald-700" aria-hidden="true" />
                      آخر تحقق من بيانات الملف: <bdi dir="ltr">{verifiedAt}</bdi>
                    </p>
                  ) : (
                    <p className="text-xs font-bold text-slate-500">تاريخ التحقق من بيانات التواصل غير منشور بعد.</p>
                  )}
                </div>

                {provider.bio ? (
                  <p className="mt-5 max-w-3xl whitespace-pre-line text-base leading-8 text-slate-700">
                    {provider.bio}
                  </p>
                ) : null}

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

                  {clinicMapUrl ? (
                    <a href={clinicMapUrl} target="_blank" rel="noopener noreferrer" className={buttonStyles({ variant: "secondary" })}>
                      <MapPin className="h-4 w-4" aria-hidden="true" />
                      الخريطة
                    </a>
                  ) : null}

                  {provider.instagramUrl ? (
                    <a href={provider.instagramUrl} target="_blank" rel="noopener noreferrer" className={buttonStyles({ variant: "ghost" })}>
                      <Instagram className="h-4 w-4" aria-hidden="true" />
                      {instagramLabel(provider.instagramUrl)}
                    </a>
                  ) : null}
                </div>

                <ProfileActions
                  entityType="PROVIDER"
                  entityId={provider.id}
                  entitySlug={provider.slug}
                  entityName={name}
                />
              </div>
            </div>
          </Card>

          <Card className="self-start lg:sticky lg:top-24">
            <h2 className="text-xl font-black text-navy">طلب موعد عبر واتساب</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              جهّز طلبك ثم افتح واتساب لإرساله إلى العيادة. تجهيز الطلب أو حفظه في طب نت لا يعني أن الموعد أصبح مؤكداً.
            </p>
            <div className="mt-5">
              <AppointmentForm providerId={provider.id} />
            </div>
          </Card>
        </div>

        {provider.offers.length ? (
          <section className="mt-6" aria-labelledby="provider-offers-title">
            <h2 id="provider-offers-title" className="mb-4 text-2xl font-black text-navy">
              العروض المتاحة على طب نت
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {provider.offers.map((offer) => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
            </div>
          </section>
        ) : null}

        <Card className="mt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary-dark">
              <ShieldCheck className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-black text-navy">ماذا يعني «تم التحقق»؟</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                تحقق البيانات يعني مراجعة معلومات الملف والتواصل بحسب المصادر المتاحة، ولا يمثل اعتماداً لجودة العلاج أو تقييماً طبياً. طب نت دليل للبحث والتواصل ولا يقدم تشخيصاً أو علاجاً.
              </p>
            </div>
          </div>
        </Card>
      </section>
    </SiteShell>
  );
}
