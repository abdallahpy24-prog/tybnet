import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import "./globals.css";

const arabicFont = localFont({
  src: [
    { path: "../public/fonts/NotoSansArabic-Regular.ttf", weight: "400", style: "normal" },
    { path: "../public/fonts/NotoSansArabic-Bold.ttf", weight: "700", style: "normal" },
    { path: "../public/fonts/NotoSansArabic-Bold.ttf", weight: "800", style: "normal" },
    { path: "../public/fonts/NotoSansArabic-Bold.ttf", weight: "900", style: "normal" }
  ],
  display: "swap",
  variable: "--font-arabic",
  fallback: ["Tahoma", "Arial"],
  adjustFontFallback: false
});

function getMetadataBase() {
  const siteUrl =
    process.env.PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.AUTH_URL ||
    "https://www.tybnet.com";

  try {
    return new URL(siteUrl);
  } catch {
    return new URL("https://www.tybnet.com");
  }
}

export const metadata: Metadata = {
  title: {
    default: "طب نت | دليلك الصحي في العراق",
    template: "%s | طب نت"
  },
  applicationName: "طب نت",
  description:
    "منصة عراقية للبحث عن الأطباء وأطباء الأسنان والصيدليات والمختبرات وخدمات التجميل حسب المحافظة والمنطقة والاختصاص.",
  metadataBase: getMetadataBase(),
  icons: {
    icon: "/assets/logo-mark.png",
    shortcut: "/assets/logo-mark.png",
    apple: "/assets/logo-mark.png"
  },
  openGraph: {
    type: "website",
    title: "طب نت | دليلك الصحي في العراق",
    description:
      "ابحث عن مقدمي الخدمات الصحية في العراق حسب المحافظة والمنطقة والاختصاص، واطّلع على التفاصيل قبل التواصل.",
    siteName: "طب نت",
    locale: "ar_IQ",
    images: ["/assets/logo.png"]
  },
  twitter: {
    card: "summary_large_image",
    title: "طب نت | دليلك الصحي في العراق",
    description:
      "ابحث عن مقدمي الخدمات الصحية في العراق حسب موقعك واحتياجك، واطّلع على معلومات التواصل في مكان واحد.",
    images: ["/assets/logo.png"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0B213D",
  colorScheme: "light"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={arabicFont.variable}>{children}</body>
    </html>
  );
}
