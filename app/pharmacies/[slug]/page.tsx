import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PlaceProfile } from "@/components/public/place-profile";
import { getPublicPharmacyBySlug } from "@/lib/queries";

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
    return "/pharmacies";
  }
  return value === "/pharmacies" || value.startsWith("/pharmacies?")
    ? value
    : "/pharmacies";
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const pharmacy = await getPublicPharmacyBySlug(slug);

  if (!pharmacy) return { title: "الصيدلية غير موجودة" };

  const title = `${pharmacy.name} – ${pharmacy.area.name}`;
  const description =
    pharmacy.bio || pharmacy.services ||
    `${pharmacy.name} في ${pharmacy.governorate.name} – ${pharmacy.area.name}. العنوان ووسائل التواصل على طب نت.`;
  const canonical = `/pharmacies/${pharmacy.slug}`;
  const image = pharmacy.imageUrl || pharmacy.imageThumbnailUrl || "/assets/logo.png";

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

export default async function PharmacyDetailsPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ from?: string | string[] }>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams ?? Promise.resolve<{ from?: string | string[] }>({})]);
  const pharmacy = await getPublicPharmacyBySlug(slug);
  if (!pharmacy) notFound();

  const url = `${siteUrl()}/pharmacies/${pharmacy.slug}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Pharmacy",
    name: pharmacy.name,
    url,
    image: pharmacy.imageUrl || pharmacy.imageThumbnailUrl || undefined,
    telephone: pharmacy.phone || undefined,
    address: {
      "@type": "PostalAddress",
      addressRegion: pharmacy.governorate.name,
      addressLocality: pharmacy.area.name,
      streetAddress: pharmacy.address || undefined,
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
        kind="PHARMACY"
        place={pharmacy}
        listPath="/pharmacies"
        backHref={safeReturnPath(query.from)}
        backLabel="العودة إلى نتائج الصيدليات"
      />
    </>
  );
}
