import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "طب نت - TibNet",
    template: "%s | طب نت"
  },
  description: "منصة خدمات طبية عراقية للبحث عن الأطباء وأطباء الأسنان والصيدليات والمختبرات والعروض.",
  metadataBase: new URL(process.env.PUBLIC_SITE_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "طب نت - TibNet",
    description: "ابحث عن الخدمات الطبية في العراق حسب المحافظة والمنطقة والاختصاص.",
    images: ["/assets/logo.png"]
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
