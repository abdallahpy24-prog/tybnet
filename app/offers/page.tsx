import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/site-shell";
import { OfferCard } from "@/components/public/offer-card";
import { SectionTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getOffers } from "@/lib/queries";

export const metadata: Metadata = {
  title: "العروض الطبية في العراق | طب نت",
  description:
    "استعرض العروض الطبية المتاحة من الأطباء والمراكز ومقدمي الخدمات الطبية عبر منصة طب نت."
};

export default async function OffersPage() {
  const offers = await getOffers();

  return (
    <SiteShell>
      <section className="container-page py-10">
        <SectionTitle
          eyebrow="العروض"
          title="عروض طبية متاحة عبر طب نت"
          description="تابع العروض والخدمات المميزة من مقدمي الخدمات الطبية، وتأكد من تفاصيل العرض مباشرة قبل الحجز أو الزيارة."
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
            description="تابع هذه الصفحة لاحقاً للاطلاع على أحدث العروض الطبية عند توفرها."
          />
        )}
      </section>
    </SiteShell>
  );
}