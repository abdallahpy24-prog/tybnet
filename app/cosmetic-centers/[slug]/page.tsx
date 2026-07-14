import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Building2,
  Clock,
  Instagram,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles
} from "lucide-react";

import { SiteShell } from "@/components/layout/site-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { instagramLabel } from "@/lib/instagram";
import { getPublicCosmeticCenterBySlug } from "@/lib/queries";

function buildTelUrl(phone?: string | null) {
  const cleanPhone = phone?.trim();

  if (!cleanPhone) {
    return null;
  }

  const telValue = cleanPhone.replace(
    /[^\d+]/g,
    ""
  );

  if (!telValue) {
    return null;
  }

  return `tel:${telValue}`;
}

function extractUrl(value?: string | null) {
  if (!value) {
    return null;
  }

  const match = value.match(
    /https?:\/\/[^\s]+/
  );

  return match?.[0] ?? null;
}

function normalizeMapUrl(
  value?: string | null
) {
  const cleanValue = value?.trim();

  if (!cleanValue) {
    return null;
  }

  try {
    if (/^https?:\/\//i.test(cleanValue)) {
      return new URL(cleanValue).toString();
    }

    if (
      cleanValue.startsWith(
        "www.google.com/maps"
      ) ||
      cleanValue.startsWith(
        "google.com/maps"
      ) ||
      cleanValue.startsWith(
        "maps.google.com"
      ) ||
      cleanValue.startsWith(
        "maps.app.goo.gl"
      ) ||
      cleanValue.startsWith("goo.gl/maps") ||
      cleanValue.startsWith(
        "maps.apple.com"
      )
    ) {
      return new URL(
        `https://${cleanValue}`
      ).toString();
    }

    if (
      /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(
        cleanValue
      )
    ) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        cleanValue
      )}`;
    }

    return null;
  } catch {
    return null;
  }
}

function getMapUrlFromAddress(
  address?: string | null
) {
  const url = extractUrl(address);

  if (!url) {
    return null;
  }

  return normalizeMapUrl(url);
}

function isOnlyUrl(value?: string | null) {
  if (!value) {
    return false;
  }

  return value.trim() === extractUrl(value);
}

function getSiteUrl() {
  return (
    process.env.PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.AUTH_URL ||
    "https://tybnet.com"
  ).replace(/\/$/, "");
}

export async function generateMetadata({
  params
}: {
  params: Promise<{
    slug: string;
  }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const center =
    await getPublicCosmeticCenterBySlug(
      slug
    );

  if (!center) {
    return {
      title:
        "مركز التجميل غير موجود | طب نت"
    };
  }

  return {
    title: `${center.name} - مركز تجميل | طب نت`,
    description:
      center.bio ??
      center.services ??
      "بروفايل مركز تجميل على منصة طب نت للاستفسار عن الخدمات ومعلومات التواصل.",
    openGraph: {
      images: center.imageUrl
        ? [center.imageUrl]
        : center.imageThumbnailUrl
          ? [center.imageThumbnailUrl]
          : ["/assets/logo.png"]
    }
  };
}

export default async function CosmeticCenterDetailsPage({
  params
}: {
  params: Promise<{
    slug: string;
  }>;
}) {
  const { slug } = await params;

  const center =
    await getPublicCosmeticCenterBySlug(
      slug
    );

  if (!center) {
    notFound();
  }

  const siteUrl = getSiteUrl();

  const profileUrl =
    `${siteUrl}/cosmetic-centers/${center.slug}`;

  const inquiryHref =
    `/api/mobile/cosmetic-centers/${center.slug}/inquiry`;

  const phoneUrl = buildTelUrl(
    center.phone
  );

  const mapUrl =
    normalizeMapUrl(center.mapurl) ??
    getMapUrlFromAddress(center.address);

  const addressIsOnlyMapUrl =
    isOnlyUrl(center.address) &&
    Boolean(mapUrl);

  const locationText =
    `${center.governorate.name} - ${center.area.name}`;

  const summaryText =
    center.bio ||
    `مركز ${center.name} للتجميل في ${locationText}. يمكنك الاستفسار عن الخدمات والأسعار والمواعيد عبر واتساب أو الاتصال السريع عند توفر بيانات التواصل.`;

  const profileImageUrl =
    center.imageUrl ??
    center.imageThumbnailUrl;

  const originalImageUrl =
    center.imageOriginalUrl ??
    profileImageUrl;

  const instaLabel = instagramLabel(
    center.instagramUrl
  );

  return (
    <SiteShell>
      <section className="container-page py-8">
        <Link
          href="/cosmetic-centers"
          className="mb-5 inline-flex items-center gap-2 text-sm font-black text-primary-dark transition hover:text-primary"
        >
          <ArrowRight
            className="h-4 w-4"
            aria-hidden="true"
          />
          العودة إلى مراكز التجميل
        </Link>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <Card className="overflow-hidden p-0">
            <div className="grid gap-6 p-6 md:grid-cols-[220px_1fr] md:items-center">
              <div className="relative mx-auto h-52 w-52 overflow-hidden rounded-[2rem] border-8 border-primary-soft bg-surface md:mx-0">
                {profileImageUrl ? (
                  originalImageUrl ? (
                    <a
                      href={originalImageUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`تكبير صورة ${center.name}`}
                      title="اضغط لعرض الصورة الأصلية"
                      className="block h-full w-full"
                    >
                      <Image
                        src={profileImageUrl}
                        alt={center.name}
                        fill
                        sizes="208px"
                        className="object-cover"
                      />
                    </a>
                  ) : (
                    <Image
                      src={profileImageUrl}
                      alt={center.name}
                      fill
                      sizes="208px"
                      className="object-cover"
                    />
                  )
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl font-black text-primary">
                    تجميل
                  </div>
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  {center.isFeatured ? (
                    <Badge>مميز</Badge>
                  ) : null}

                  <span className="rounded-full bg-fuchsia-50 px-3 py-1 text-xs font-black text-fuchsia-700">
                    مركز تجميل
                  </span>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
                    النقاط: {center.inquiryCount}
                  </span>
                </div>

                <h1 className="mt-3 text-3xl font-black text-navy md:text-5xl">
                  {center.name}
                </h1>

                <p className="mt-3 flex items-center gap-2 text-lg font-bold text-primary-dark">
                  <Building2
                    className="h-5 w-5"
                    aria-hidden="true"
                  />
                  خدمات ومراكز التجميل
                </p>

                <p className="mt-3 flex items-start gap-2 text-slate-600">
                  <MapPin
                    className="mt-1 h-5 w-5 shrink-0 text-accent"
                    aria-hidden="true"
                  />
                  <span>{locationText}</span>
                </p>

                <p className="mt-5 max-w-2xl whitespace-pre-line text-base leading-8 text-slate-600">
                  {summaryText}
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  {center.whatsapp ? (
                    <a
                      href={inquiryHref}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button type="button">
                        <MessageCircle
                          className="h-4 w-4"
                          aria-hidden="true"
                        />
                        استفسار واتساب
                      </Button>
                    </a>
                  ) : null}

                  {phoneUrl ? (
                    <a
                      href={phoneUrl}
                      className="inline-flex"
                    >
                      <Button
                        type="button"
                        variant="secondary"
                      >
                        <Phone
                          className="h-4 w-4"
                          aria-hidden="true"
                        />
                        اتصال سريع
                      </Button>
                    </a>
                  ) : null}

                  {mapUrl ? (
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button
                        type="button"
                        variant="secondary"
                      >
                        <MapPin
                          className="h-4 w-4"
                          aria-hidden="true"
                        />
                        الموقع
                      </Button>
                    </a>
                  ) : null}

                  {center.instagramUrl ? (
                    <a
                      href={
                        center.instagramUrl
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button
                        type="button"
                        variant="secondary"
                      >
                        <Instagram
                          className="h-4 w-4"
                          aria-hidden="true"
                        />
                        {instaLabel}
                      </Button>
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <MessageCircle
                className="h-6 w-6"
                aria-hidden="true"
              />
            </div>

            <h2 className="mt-4 text-xl font-black text-navy">
              استفسار سريع
            </h2>

            <p className="mt-2 text-sm leading-7 text-slate-600">
              اضغط على زر الاستفسار لفتح واتساب
              برسالة جاهزة تتضمن اسم مركز التجميل
              وموقعه وخدماته ورابط الصفحة. كل
              استفسار يساعد على ترتيب المراكز
              الأكثر تفاعلاً داخل طب نت.
            </p>

            <div className="mt-5 rounded-3xl border border-borderSoft bg-primary-soft p-4">
              <p className="text-sm font-black text-primary">
                النقاط
              </p>

              <p className="mt-2 text-4xl font-black text-navy">
                {center.inquiryCount}
              </p>
            </div>

            <div className="mt-5 grid gap-2">
              {center.whatsapp ? (
                <a
                  href={inquiryHref}
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
                    استفسار واتساب
                  </Button>
                </a>
              ) : null}

              {phoneUrl ? (
                <a href={phoneUrl}>
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                  >
                    <Phone
                      className="h-4 w-4"
                      aria-hidden="true"
                    />
                    اتصال سريع
                  </Button>
                </a>
              ) : null}

              {mapUrl ? (
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                  >
                    <MapPin
                      className="h-4 w-4"
                      aria-hidden="true"
                    />
                    فتح الموقع
                  </Button>
                </a>
              ) : null}

              {center.instagramUrl ? (
                <a
                  href={center.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                  >
                    <Instagram
                      className="h-4 w-4"
                      aria-hidden="true"
                    />
                    {instaLabel}
                  </Button>
                </a>
              ) : null}
            </div>
          </Card>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-black text-navy">
              <Sparkles
                className="h-5 w-5 text-fuchsia-600"
                aria-hidden="true"
              />
              الخدمات التجميلية
            </h2>

            {center.services ? (
              <p className="whitespace-pre-line text-sm leading-8 text-slate-600">
                {center.services}
              </p>
            ) : (
              <p className="text-sm leading-8 text-slate-500">
                لم تتم إضافة الخدمات التجميلية
                بعد.
              </p>
            )}
          </Card>

          <Card>
            <h2 className="mb-4 text-xl font-black text-navy">
              معلومات الزيارة
            </h2>

            <p className="mb-3 flex gap-2 text-sm leading-7 text-slate-600">
              <MapPin
                className="mt-1 h-4 w-4 shrink-0 text-accent"
                aria-hidden="true"
              />
              <span>{locationText}</span>
            </p>

            {center.address ? (
              <p className="mb-3 flex gap-2 text-sm leading-7 text-slate-600">
                <MapPin
                  className="mt-1 h-4 w-4 shrink-0 text-accent"
                  aria-hidden="true"
                />

                <span>
                  {addressIsOnlyMapUrl
                    ? "موقع مركز التجميل متوفر عبر زر الموقع أعلى الصفحة."
                    : center.address}
                </span>
              </p>
            ) : null}

            {center.workingHours ? (
              <p className="flex gap-2 text-sm leading-7 text-slate-600">
                <Clock
                  className="mt-1 h-4 w-4 shrink-0 text-primary"
                  aria-hidden="true"
                />

                <span className="whitespace-pre-line">
                  {center.workingHours}
                </span>
              </p>
            ) : (
              <p className="text-sm leading-7 text-slate-500">
                لم تتم إضافة أوقات الدوام بعد.
                يُفضّل التأكد عبر الاتصال أو واتساب
                قبل الزيارة.
              </p>
            )}
          </Card>
        </div>

        <Card className="mt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <ShieldCheck
                className="h-6 w-6"
                aria-hidden="true"
              />
            </div>

            <div>
              <h2 className="text-lg font-black text-navy">
                تنبيه مهم قبل حجز الخدمة أو الزيارة
              </h2>

              <p className="mt-2 text-sm leading-7 text-slate-600">
                طب نت يساعدك على الوصول إلى مركز
                التجميل والتواصل معه، ولا يضمن توفر
                الخدمة أو السعر النهائي أو ملاءمة
                الإجراء لحالتك. يُفضّل التأكد من
                التفاصيل وهوية المختص قبل الحجز أو
                الزيارة.
              </p>

              <p className="mt-2 break-all text-xs font-semibold leading-6 text-slate-400">
                رابط الصفحة: {profileUrl}
              </p>
            </div>
          </div>
        </Card>
      </section>
    </SiteShell>
  );
}
