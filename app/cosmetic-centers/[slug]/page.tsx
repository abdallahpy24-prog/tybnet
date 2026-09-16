import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PlaceProfile } from "@/components/public/place-profile";
import { getPublicCosmeticCenterBySlug } from "@/lib/queries";

export const revalidate = 300;

function siteUrl() {
  return (
    process.env.PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.AUTH_URL ||
    "https://www.tybnet.com"
  ).replace(/\/$/, "");
}

function safeReturnPath(value?: unknown) {
  if (typeof value !== "string" || !value || value.startsWith("//") || value.includes("\n") || value.includes("\r")) {
    return "/cosmetic-centers";
  }
  return value === "/cosmetic-centers" || value.startsWith("/cosmetic-centers?")
    ? value
    : "/cosmetic-centers";
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const center = await getPublicCosmeticCenterBySlug(slug);

  if (!center) return { title: "مركز التجميل غير موجود" };

  const title = `${center.name} – ${center.area.name}`;
  const description =
    center.bio || center.services ||
    `${center.name} في ${center.governorate.name} – ${center.area.name}. الخدمات ووسائل التواصل على طب نت.`;
  const canonical = `/cosmetic-centers/${center.slug}`;
  const image = center.imageUrl || center.imageThumbnailUrl || "/assets/logo.png";

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      title,
      description,
      url: canonical,
      siteName: "طب نت",
      locale: "ar_IQ",
      images: [image]
    }
  };
}

export default async function CosmeticCenterDetailsPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ from?: string | string[] }>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams ?? Promise.resolve<{ from?: string | string[] }>({})]);
  const center = await getPublicCosmeticCenterBySlug(slug);
  if (!center) notFound();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "HealthAndBeautyBusiness",
    name: center.name,
    url: `${siteUrl()}/cosmetic-centers/${center.slug}`,
    image: center.imageUrl || center.imageThumbnailUrl || undefined,
    telephone: center.phone || undefined,
    address: {
      "@type": "PostalAddress",
      addressRegion: center.governorate.name,
      addressLocality: center.area.name,
      streetAddress: center.address || undefined,
      addressCountry: "IQ"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
      <PlaceProfile
        kind="COSMETIC_CENTER"
        place={center}
        listPath="/cosmetic-centers"
        backHref={safeReturnPath(query.from)}
        backLabel="العودة إلى نتائج مراكز التجميل"
      />
    </>
  );
}
