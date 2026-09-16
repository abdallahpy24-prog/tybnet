import type { Metadata } from "next";
import type { SearchParams } from "@/lib/queries";

export function listPageMetadata(base: Metadata, params: SearchParams): Metadata {
  const filtered = ["q", "governorateId", "specialtyId", "areaId", "cursor", "featuredOnly"]
    .some((key) => {
      const raw = params[key];
      return (Array.isArray(raw) ? raw : [raw]).some((value) => Boolean(value?.trim()));
    });
  return {
    ...base,
    ...(filtered ? { robots: { index: false, follow: true } } : {})
  };
}
