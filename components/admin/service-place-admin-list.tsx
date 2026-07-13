import Image from "next/image";
import Link from "next/link";
import { MapPin, Pencil, Star } from "lucide-react";

import { StatusPill } from "@/components/admin/status-pill";
import { Card } from "@/components/ui/card";

type ServicePlaceListRow = {
  id: string;
  name: string;
  imageUrl: string | null;
  status: "ACTIVE" | "INACTIVE";
  inquiryCount: number;
  isFeatured: boolean;
  governorate: { name: string };
  area: { name: string };
};

type ServicePlaceAdminListProps = {
  rows: ServicePlaceListRow[];
  editBasePath: string;
  emptyText: string;
};

export function ServicePlaceAdminList({
  rows,
  editBasePath,
  emptyText
}: ServicePlaceAdminListProps) {
  if (!rows.length) {
    return (
      <Card className="py-12 text-center text-sm font-bold text-slate-500">
        {emptyText}
      </Card>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-borderSoft bg-white shadow-sm">
      {rows.map((row) => (
        <div
          key={row.id}
          className="flex flex-col gap-3 border-b border-borderSoft p-3 last:border-b-0 sm:flex-row sm:items-center"
        >
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-slate-100">
              {row.imageUrl ? (
                <Image
                  src={row.imageUrl}
                  alt={row.name}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              ) : (
                <div className="grid h-full place-items-center text-lg font-black text-slate-400">
                  {row.name.charAt(0)}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-sm font-black text-navy">
                  {row.name}
                </h2>

                <StatusPill value={row.status} />

                {row.isFeatured ? (
                  <Star
                    className="h-4 w-4 fill-amber-400 text-amber-400"
                    aria-label="مميز"
                  />
                ) : null}
              </div>

              <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                {row.governorate.name} - {row.area.name}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-black text-primary-dark">
              {row.inquiryCount} نقطة
            </span>

            <Link
              href={`${editBasePath}/${row.id}/edit`}
              className="focus-ring inline-flex h-9 items-center gap-2 rounded-xl border border-borderSoft px-3 text-xs font-black text-navy hover:bg-primary-soft"
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
              تعديل
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
