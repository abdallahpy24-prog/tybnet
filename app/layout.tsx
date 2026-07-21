import type { Metadata } from "next";

import "./globals.css";

export const dynamic = "force-dynamic";

function getMetadataBase() {
  const siteUrl =
    process.env.PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.AUTH_URL ||
    "https://tybnet.com";

  try {
    return new URL(siteUrl);
  } catch {
    return new URL("https://tybnet.com");
  }
}

export const metadata: Metadata = {
  title: {
    default: "طب نت - TybNet",
    template: "%s | طب نت"
  },
  description:
    "دليل عراقي لخدمات الصحة والجمال يساعد على اكتشاف الأطباء وأطباء الأسنان وأطباء التجميل ومراكز التجميل والصيدليات والمختبرات.",
  metadataBase: getMetadataBase(),
  openGraph: {
    title: "طب نت - TybNet",
    description:
      "اكتشف خدمات الصحة والجمال في العراق، وابحث حسب المحافظة والمنطقة والاختصاص.",
    images: ["/assets/logo.png"]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
