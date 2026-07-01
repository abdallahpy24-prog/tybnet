import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Clock,
  Instagram,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Stethoscope
} from "lucide-react";
import { SiteShell } from "@/components/layout/site-shell";
import { AppointmentForm } from "@/components/public/appointment-form";
import { OfferCard } from "@/components/public/offer-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { buildWhatsappUrl } from "@/lib/whatsapp";
import { getProviderBySlug } from "@/lib/queries";
import { instagramLabel } from "@/lib/instagram";

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const provider = await getProviderBySlug(slug);

  if (!provider) {
    return {
      title: "مقدم الخدمة غير موجود | طب نت"
    };
  }

  const displayName = (provider.titlePrefix ? provider.titlePrefix + " " : "") + provider.name;

  return {
    title: `${displayName} | طب نت`,
    description:
      provider.bio ??
      provider.specialty?.name ??
      "ملف مقدم خدمة طبية على منصة طب نت",
    openGraph: {
      images: provider.imageUrl ? [provider.imageUrl] : ["/assets/logo.png"]
    }
  };
}

export default async function ProviderDetailsPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const provider = await getProviderBySlug(slug);

  if (!provider) notFound();

  const displayName = (provider.titlePrefix ? provider.titlePrefix + " " : "") + provider.name;

  const backHref = provider.type === "DENTIST" ? "/dentists" : "/doctors";
  const backLabel = provider.type === "DENTIST" ? "العودة إلى أطباء الأسنان" : "العودة إلى الأطباء";

  const whatsappUrl = buildWhatsappUrl(
    provider.whatsapp,
    `مرحباً، وصلت إلى ${displayName} عبر منصة طب نت، وأرغب بالاستفسار عن الحجز أو المواعيد المتاحة.`
  );

  const instaLabel = instagramLabel(provider.instagramUrl);

  return (
    <SiteShell>
      <section className="container-page py-8">
        <Link
          href={backHref}
          className="mb-5 inline-flex items-center gap-2 text-sm font-black text-primary-dark transition hover:text-primary"
        >
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
          {backLabel}
        </Link>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <Card className="overflow-hidden p-0">
            <div className="grid gap-6 p-6 md:grid-cols-[220px_1fr] md:items-center">
              <div className="relative mx-auto h-52 w-52 overflow-hidden rounded-full border-8 border-primary-soft bg-surface md:mx-0">
                {provider.imageUrl ? (
                  <Image
                    src={provider.imageUrl}
                    alt={displayName}
                    fill
                    sizes="208px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-5xl font-black text-primary">
                    طب
                  </div>
                )}
              </div>

              <div>
                {provider.isFeatured ? <Badge>مميز</Badge> : null}

                <h1 className="mt-3 text-3xl font-black text-navy md:text-5xl">
                  {displayName}
                </h1>

                <p className="mt-3 flex items-center gap-2 text-lg font-bold text-primary-dark">
                  <Stethoscope className="h-5 w-5" aria-hidden="true" />
                  {provider.specialty?.name ?? "الاختصاص غير محدد"}
                </p>

                <p className="mt-3 flex items-start gap-2 text-slate-600">
                  <MapPin className="mt-1 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
                  <span>
                    {provider.governorate.name} - {provider.area.name}
                  </span>
                </p>

                {provider.bio ? (
                  <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
                    {provider.bio}
                  </p>
                ) : (
                  <p className="mt-5 max-w-2xl text-base leading-8 text-slate-500">
                    لم تتم إضافة نبذة تفصيلية بعد. يمكنك الاطلاع على معلومات
                    التواصل والعيادة أدناه.
                  </p>
                )}

                <div className="mt-6 flex flex-wrap gap-3">
                  {whatsappUrl ? (
                    <a href={whatsappUrl} target="_blank" rel="noreferrer">
                      <Button type="button">
                        <MessageCircle className="h-4 w-4" aria-hidden="true" />
                        تواصل واتساب
                      </Button>
                    </a>
                  ) : null}

                  {provider.phone ? (
                    <a href={"tel:" + provider.phone} className="inline-flex">
                      <Button type="button" variant="secondary">
                        <Phone className="h-4 w-4" aria-hidden="true" />
                        اتصال مباشر
                      </Button>
                    </a>
                  ) : null}

                  {provider.instagramUrl ? (
                    <a href={provider.instagramUrl} target="_blank" rel="noreferrer">
                      <Button type="button" variant="secondary">
                        <Instagram className="h-4 w-4" aria-hidden="true" />
                        {instaLabel}
                      </Button>
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-black text-navy">طلب موعد</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              املأ البيانات المطلوبة وسيتم تسجيل طلبك للمتابعة. إرسال الطلب لا
              يعني تأكيد الموعد نهائياً إلا بعد التواصل معك.
            </p>

            <div className="mt-5">
              <AppointmentForm providerId={provider.id} />
            </div>
          </Card>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card>
            <h2 className="mb-4 text-xl font-black text-navy">
              معلومات العيادة
            </h2>

            {provider.address ? (
              <p className="mb-3 flex gap-2 text-sm leading-7 text-slate-600">
                <MapPin className="mt-1 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                <span>{provider.address}</span>
              </p>
            ) : null}

            {provider.workingHours ? (
              <p className="flex gap-2 text-sm leading-7 text-slate-600">
                <Clock className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <span>{provider.workingHours}</span>
              </p>
            ) : null}

            {!provider.address && !provider.workingHours ? (
              <p className="text-sm leading-7 text-slate-500">
                لم تتم إضافة تفاصيل العنوان أو أوقات الدوام بعد. يُفضّل التأكد
                من التفاصيل عبر الاتصال أو واتساب قبل الزيارة.
              </p>
            ) : null}
          </Card>

          <Card>
            <h2 className="mb-4 text-xl font-black text-navy">
              العروض والخدمات المرتبطة
            </h2>

            {provider.offers.length ? (
              <div className="grid gap-4">
                {provider.offers.map((offer) => (
                  <OfferCard key={offer.id} offer={offer} />
                ))}
              </div>
            ) : (
              <p className="text-sm leading-7 text-slate-500">
                لا توجد عروض متاحة مرتبطة بهذا الملف حالياً.
              </p>
            )}
          </Card>
        </div>

        <Card className="mt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <ShieldCheck className="h-6 w-6" aria-hidden="true" />
            </div>

            <div>
              <h2 className="text-lg font-black text-navy">
                تنبيه مهم قبل الحجز أو الزيارة
              </h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                طب نت يساعدك على الوصول إلى مقدم الخدمة والتواصل معه، ولا يقدم
                تشخيصاً أو علاجاً طبياً. للحالات الطارئة، راجع أقرب طوارئ أو
                مؤسسة صحية فوراً.
              </p>
            </div>
          </div>
        </Card>
      </section>
    </SiteShell>
  );
}