"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";

type Option = {
  id: string;
  name: string;
};

type AreaResponse = {
  ok?: boolean;
  items?: Option[];
};

export function HomeDoctorSearch({
  governorates,
  specialties
}: {
  governorates: Option[];
  specialties: Option[];
}) {
  const [governorateId, setGovernorateId] = useState("");
  const [specialtyId, setSpecialtyId] = useState("");
  const [areaId, setAreaId] = useState("");
  const [areas, setAreas] = useState<Option[]>([]);
  const [isLoadingAreas, setIsLoadingAreas] = useState(false);

  const [areaLoadFailed, setAreaLoadFailed] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    setAreaId("");
    setAreas([]);

    setAreaLoadFailed(false);
    setIsLoadingAreas(false);
    if (!governorateId || !specialtyId) return;

    const controller = new AbortController();
    const query = new URLSearchParams({
      governorateId,
      specialtyId,
      forType: "DOCTOR"
    });

    setIsLoadingAreas(true);

    fetch(`/api/mobile/areas?${query.toString()}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" }
    })
      .then(async (response) => {
        const payload = (await response.json().catch(() => null)) as AreaResponse | null;
        if (!response.ok || !payload?.ok) throw new Error("areas-load-failed");
        return Array.isArray(payload.items) ? payload.items : [];
      })
      .then((items) => { if (!controller.signal.aborted) setAreas(items); })
      .catch((error) => {
        if (controller.signal.aborted || (error instanceof DOMException && error.name === "AbortError")) return;
        setAreaLoadFailed(true);
        setAreas([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoadingAreas(false);
      });

    return () => controller.abort();
  }, [governorateId, specialtyId, retry]);

  return (
    <div className="rounded-3xl border border-white/70 bg-white p-4 shadow-[0_24px_70px_rgba(16,45,85,0.14)] md:p-5">
      <form
        action="/doctors"
        className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]"
        role="search"
      >
        <Field label="المحافظة">
          <Select
            name="governorateId"
            value={governorateId}
            onChange={(event) => { setGovernorateId(event.target.value); setAreaId(""); }}
            aria-describedby="home-search-hint"
          >
            <option value="">اختر المحافظة</option>
            {governorates.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="الاختصاص">
          <Select
            name="specialtyId"
            value={specialtyId}
            onChange={(event) => { setSpecialtyId(event.target.value); setAreaId(""); }}
          >
            <option value="">اختر الاختصاص</option>
            {specialties.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="المنطقة">
          <Select
            name="areaId"
            value={areaId}
            onChange={(event) => setAreaId(event.target.value)}
            disabled={!governorateId || !specialtyId || isLoadingAreas || areaLoadFailed}
            aria-busy={isLoadingAreas}
          >
            <option value="">
              {!governorateId
                ? "اختر المحافظة أولاً"
                : !specialtyId
                  ? "اختر الاختصاص أولاً"
                  : isLoadingAreas
                    ? "جاري تحميل المناطق..."
                    : areaLoadFailed
                      ? "تعذر تحميل المناطق"
                    : areas.length
                      ? "كل المناطق المتاحة"
                      : "لا توجد مناطق مطابقة"}
            </option>
            {areas.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
        </Field>

        <div className="flex items-end">
          <Button type="submit" className="w-full md:min-w-32">
            <Search className="h-4 w-4" aria-hidden="true" />
            اعرض الأطباء
          </Button>
        </div>
      </form>

      {areaLoadFailed ? (
        <p className="mt-3 text-sm text-red-700" role="alert">
          تعذر تحميل المناطق. <button type="button" className="min-h-11 underline" onClick={() => setRetry((value) => value + 1)}>إعادة المحاولة</button>
        </p>
      ) : null}

      <div className="my-4 flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-borderSoft" />
        <span className="text-xs font-bold text-slate-400">أو</span>
        <span className="h-px flex-1 bg-borderSoft" />
      </div>

      <form action="/doctors" className="flex gap-2" role="search">
        <label htmlFor="home-doctor-name-search" className="sr-only">
          ابحث باسم الطبيب أو الاختصاص أو المنطقة
        </label>
        <Input
          id="home-doctor-name-search"
          name="q"
          maxLength={120}
          placeholder="اكتب اسم الطبيب أو الاختصاص أو المنطقة، مثل: عيون النجف"
          className="min-w-0 flex-1"
        />
        <Button type="submit" variant="secondary" className="shrink-0 px-4">
          <Search className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">بحث بالاسم</span>
          <span className="sm:hidden">بحث</span>
        </Button>
      </form>

      <p id="home-search-hint" className="mt-3 text-xs font-semibold leading-6 text-slate-500">
        المناطق تظهر بعد اختيار المحافظة والاختصاص، حتى لا نعرض لك خيارات بلا نتائج.
      </p>
    </div>
  );
}
