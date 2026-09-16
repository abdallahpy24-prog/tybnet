import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import "./globals.css";

const arabicFont = localFont({
  src: [
    { path: "../public/fonts/NotoSansArabic-Regular.ttf", weight: "400", style: "normal" },
    { path: "../public/fonts/NotoSansArabic-Bold.ttf", weight: "700", style: "normal" }
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
    "دليل عراقي للبحث عن الأطباء وأطباء الأسنان والصيدليات والمختبرات وأطباء ومراكز التجميل حسب المحافظة والاختصاص والمنطقة.",
  metadataBase: getMetadataBase(),
  icons: {
    icon: "/assets/logo.png",
    apple: "/assets/logo.png"
  },
  openGraph: {
    type: "website",
    title: "طب نت | دليلك الصحي في العراق",
    description:
      "ابحث حسب المحافظة والاختصاص والمنطقة، واطّلع على معلومات العيادة ووسائل التواصل.",
    siteName: "طب نت",
    locale: "ar_IQ",
    images: ["/assets/logo.png"]
  },
  twitter: {
    card: "summary_large_image",
    title: "طب نت | دليلك الصحي في العراق",
    description:
      "ابحث عن مقدمي الخدمات الصحية في العراق حسب موقعك واحتياجك.",
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
  themeColor: "#0b5263",
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
