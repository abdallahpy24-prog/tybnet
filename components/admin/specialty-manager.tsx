import { Plus, Save, Trash2 } from "lucide-react";

import { StatusPill } from "@/components/admin/status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createSpecialty,
  deleteSpecialty,
  updateSpecialty
} from "@/lib/actions/admin";

type SpecialtyRow = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
};

type SpecialtyManagerProps = {
  forType: "DOCTOR" | "COSMETIC_DOCTOR";
  rows: SpecialtyRow[];
};

export function SpecialtyManager({
  forType,
  rows
}: SpecialtyManagerProps) {
  return (
    <details className="rounded-2xl border border-borderSoft bg-white shadow-sm">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 font-black text-navy">
        <span>اختصاصات هذا القسم</span>

        <span className="rounded-full bg-primary-soft px-3 py-1 text-xs text-primary-dark">
          {rows.length} اختصاص
        </span>
      </summary>

      <div className="space-y-3 border-t border-borderSoft p-4">
        <form
          action={createSpecialty}
          className="grid gap-2 md:grid-cols-[1fr_1fr_auto_auto]"
        >
          <input type="hidden" name="forType" value={forType} />

          <Input
            name="name"
            required
            maxLength={120}
            placeholder="اسم الاختصاص"
          />

          <Input
            name="slug"
            maxLength={120}
            placeholder="الرابط المختصر - اختياري"
            className="ltr"
          />

          <label className="flex h-11 items-center gap-2 rounded-xl bg-slate-50 px-3 text-sm font-bold">
            <input type="checkbox" name="isActive" defaultChecked />
            فعال
          </label>

          <Button type="submit">
            <Plus className="h-4 w-4" aria-hidden="true" />
            إضافة
          </Button>
        </form>

        <div className="divide-y divide-borderSoft overflow-hidden rounded-xl border border-borderSoft">
          {rows.length ? (
            rows.map((row) => (
              <details key={row.id} className="bg-white">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-3 text-sm font-bold">
                  <span>{row.name}</span>
                  <StatusPill value={row.isActive} />
                </summary>

                <div className="border-t border-borderSoft bg-slate-50 p-3">
                  <form
                    action={updateSpecialty}
                    className="grid gap-2 md:grid-cols-[1fr_1fr_auto_auto]"
                  >
                    <input type="hidden" name="id" value={row.id} />
                    <input type="hidden" name="forType" value={forType} />

                    <Input
                      name="name"
                      required
                      maxLength={120}
                      defaultValue={row.name}
                    />

                    <Input
                      name="slug"
                      maxLength={120}
                      defaultValue={row.slug}
                      className="ltr"
                    />

                    <label className="flex h-11 items-center gap-2 rounded-xl bg-white px-3 text-sm font-bold">
                      <input
                        type="checkbox"
                        name="isActive"
                        defaultChecked={row.isActive}
                      />
                      فعال
                    </label>

                    <Button type="submit" variant="secondary">
                      <Save className="h-4 w-4" aria-hidden="true" />
                      حفظ
                    </Button>
                  </form>

                  <form
                    action={deleteSpecialty}
                    className="mt-2 flex justify-end"
                  >
                    <input type="hidden" name="id" value={row.id} />

                    <Button type="submit" variant="danger" className="h-9">
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      حذف
                    </Button>
                  </form>
                </div>
              </details>
            ))
          ) : (
            <p className="p-4 text-center text-sm font-bold text-slate-500">
              لا توجد اختصاصات بعد. أضف أول اختصاص من الحقول أعلاه.
            </p>
          )}
        </div>
      </div>
    </details>
  );
}
