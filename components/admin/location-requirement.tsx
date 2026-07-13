import Link from "next/link";
import { MapPin } from "lucide-react";

type LocationRequirementProps = {
  hasGovernorates: boolean;
  hasAreas: boolean;
};

export function LocationRequirement({
  hasGovernorates,
  hasAreas
}: LocationRequirementProps) {
  if (hasGovernorates && hasAreas) {
    return null;
  }

  return (
    <div
      role="status"
      className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold leading-7 text-amber-900"
    >
      <MapPin className="mt-1 h-5 w-5 shrink-0" aria-hidden="true" />

      <p>
        قبل إنشاء سجل جديد، يرجى إضافة
        {!hasGovernorates ? (
          <Link href="/admin/governorates" className="mx-1 underline">
            محافظة
          </Link>
        ) : null}
        {!hasGovernorates && !hasAreas ? "و" : null}
        {!hasAreas ? (
          <Link href="/admin/areas" className="mx-1 underline">
            منطقة
          </Link>
        ) : null}
        . تقدر تتصفح القائمة وتستخدم البحث بصورة طبيعية.
      </p>
    </div>
  );
}
