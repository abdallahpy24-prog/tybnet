import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PlaceProfile } from "@/components/public/place-profile";
import { getPublicLabBySlug } from "@/lib/queries";

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
    return "/labs";
  }
  return value === "/labs" || value.startsWith("/labs?") ? value : "/labs";
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const lab = await getPublicLabBySlug(slug);

  if (!lab) return { title: "المختبر غير موجود" };

  const title = `${lab.name} – ${lab.area.name}`;
  const description =
    lab.bio || lab.services ||
    `${lab.name} في ${lab.governorate.name} – ${lab.area.name}. التحاليل والخدمات ووسائل التواصل على طب نت.`;
  const canonical = `/labs/${lab.slug}`;
  const image = lab.imageUrl || lab.imageThumbnailUrl || "/assets/logo.png";

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

export default async function LabDetailsPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ from?: string | string[] }>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams ?? Promise.resolve<{ from?: string | string[] }>({})]);
  const lab = await getPublicLabBySlug(slug);
  if (!lab) notFound();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    name: lab.name,
    url: `${siteUrl()}/labs/${lab.slug}`,
    image: lab.imageUrl || lab.imageThumbnailUrl || undefined,
    telephone: lab.phone || undefined,
    address: {
      "@type": "PostalAddress",
      addressRegion: lab.governorate.name,
      addressLocality: lab.area.name,
      streetAddress: lab.address || undefined,
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
        kind="LAB"
        place={lab}
        listPath="/labs"
        backHref={safeReturnPath(query.from)}
        backLabel="العودة إلى نتائج المختبرات"
      />
    </>
  );
}
