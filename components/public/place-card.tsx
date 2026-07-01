import Image from "next/image";
import { Clock, MapPin, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { buildWhatsappUrl } from "@/lib/whatsapp";

type PlaceData = {
  name: string;
  imageUrl?: string | null;
  whatsapp?: string | null;
  workingHours?: string | null;
  address?: string | null;
  services?: string | null;
  governorate: { name: string };
  area: { name: string };
};

export function PlaceCard({ item, label }: { item: PlaceData; label: string }) {
  const whatsappUrl = buildWhatsappUrl(item.whatsapp);

  return (
    <Card className="h-full">
      <div className="relative mb-4 aspect-[16/9] overflow-hidden rounded-xl bg-primary-soft">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-2xl font-black text-primary">
            {label}
          </div>
        )}
      </div>

      <h3 className="text-xl font-black text-navy">{item.name}</h3>

      <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
        <MapPin className="h-4 w-4 text-accent" />
        {item.governorate.name} - {item.area.name}
      </p>

      {item.workingHours ? (
        <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
          <Clock className="h-4 w-4 text-primary" />
          {item.workingHours}
        </p>
      ) : null}

      {item.services ? (
        <p className="mt-3 text-sm leading-7 text-slate-600">{item.services}</p>
      ) : null}

      {whatsappUrl ? (
        <a href={whatsappUrl} target="_blank" rel="noreferrer" className="mt-5 block">
          <Button type="button" className="w-full">
            <MessageCircle className="h-4 w-4" />
            تواصل عبر واتساب
          </Button>
        </a>
      ) : null}
    </Card>
  );
}