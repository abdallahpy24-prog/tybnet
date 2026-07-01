import Image from "next/image";
import { CalendarDays, Percent } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

type OfferData = {
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  discountText?: string | null;
  startsAt?: Date | null;
  endsAt?: Date | null;
  provider?: { name: string; titlePrefix: string; slug: string } | null;
};

export function OfferCard({ offer }: { offer: OfferData }) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="relative aspect-[16/9] bg-primary-soft">
        {offer.imageUrl ? (
          <Image
            src={offer.imageUrl}
            alt={offer.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-3xl font-black text-primary">
            عرض
          </div>
        )}
      </div>
      <div className="p-5">
        {offer.discountText ? (
          <Badge className="mb-3 gap-1">
            <Percent className="h-3.5 w-3.5" aria-hidden="true" />
            {offer.discountText}
          </Badge>
        ) : null}
        <h3 className="text-xl font-black text-navy">{offer.title}</h3>
        {offer.description ? (
          <p className="mt-2 text-sm leading-7 text-slate-600">{offer.description}</p>
        ) : null}
        <p className="mt-4 flex items-center gap-2 text-xs font-bold text-slate-500">
          <CalendarDays className="h-4 w-4 text-primary" aria-hidden="true" />
          {offer.startsAt ? formatDate(offer.startsAt) : "متاح الآن"} -{" "}
          {offer.endsAt ? formatDate(offer.endsAt) : "حتى إشعار آخر"}
        </p>
        {offer.provider ? (
          <p className="mt-3 text-sm font-bold text-primary-dark">
            {offer.provider.titlePrefix} {offer.provider.name}
          </p>
        ) : null}
      </div>
    </Card>
  );
}