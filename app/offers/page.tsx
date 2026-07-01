import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/site-shell";
import { OfferCard } from "@/components/public/offer-card";
import { SectionTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getOffers } from "@/lib/queries";

export const metadata: Metadata = {
  title: "العروض الطبية",
  description: "العروض الطبية النشطة في طب نت."
};

export default async function OffersPage() {
  const offers = await getOffers();
  return (
    <SiteShell>
      <section className="container-page py-10">
        <SectionTitle eyebrow="العروض" title="العروض الطبية" description="العروض النشطة وغير المنتهية فقط تظهر للزوار." />
        {offers.length ? <div className="card-grid">{offers.map((offer) => <OfferCard key={offer.id} offer={offer} />)}</div> : <EmptyState title="لا توجد عروض نشطة حالياً" />}
      </section>
    </SiteShell>
  );
}
