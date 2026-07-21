import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/site-shell";
import { OfferCard } from "@/components/public/offer-card";
import { SectionTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getOffers } from "@/lib/queries";

export const metadata: Metadata = {
  title: "العروض المتاحة في العراق | طب نت",
  description:
    "استعرض العروض المتاحة من مقدمي الخدمات الصحية والتجميلية عبر طب نت."
};

export default async function OffersPage() {
  const offers = await getOffers();

  return (
    <SiteShell>
      <section className="container-page py-10">
        <SectionTitle
          eyebrow="العروض"
          title="العروض متاحة عبر طب نت"
          description="اطّلع على العروض والخدمات المميزة، وتأكد من التفاصيل مباشرة مع مقدم الخدمة قبل طلب الموعد أو الزيارة."
        />

        {offers.length ? (
          <div className="card-grid">
            {offers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="لا توجد عروض متاحة حالياً"
            description="تابع هذه الصفحة للاطلاع على أحدث العروض عند توفرها."
          />
        )}
      </section>
    </SiteShell>
  );
}