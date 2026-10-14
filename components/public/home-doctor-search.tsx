"use client";

import { useEffect, useState } from "react";
import { MapPin, Search, SlidersHorizontal, Stethoscope } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";

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
      .then((items) => {
        if (!controller.signal.aborted) setAreas(items);
      })
      .catch((error) => {
        if (
          controller.signal.aborted ||
          (error instanceof DOMException && error.name === "AbortError")
        ) {
          return;
        }
        setAreaLoadFailed(true);
        setAreas([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoadingAreas(false);
      });

    return () => controller.abort();
  }, [governorateId, specialtyId, retry]);

  return (
    <div className="home-search-shell rounded-[28px] border border-white/80 bg-white/[0.94] p-3 shadow-[0_28px_78px_rgba(11,33,61,0.13)] backdrop-blur-2xl md:p-3.5">
      <div className="mb-2.5 flex items-center justify-between gap-3 px-1 text-start">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary-dark">
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-black leading-6 text-navy">ابحث في دليل الأطباء</p>
            <p className="text-xs font-bold leading-5 text-slate-500">المحافظة، ثم الاختصاص، ثم المنطقة</p>
          </div>
        </div>
        <span className="hidden items-center gap-1.5 rounded-full bg-[#edf9f8] px-3 py-1.5 text-[11px] font-black text-primary-dark sm:inline-flex">
          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
          نتائج أدق حسب موقعك
        </span>
      </div>

      <form
        action="/doctors"
        className="home-search-grid grid gap-2 rounded-[22px] bg-slate-50/90 p-2 sm:grid-cols-2"
        role="search"
      >
        <label className="home-search-field grid min-w-0 gap-1 rounded-[16px] bg-white px-3 py-2 shadow-[0_7px_20px_rgba(15,35,64,0.035)]">
          <span className="text-xs font-black leading-5 text-slate-500">المحافظة</span>
          <Select
            name="governorateId"
            value={governorateId}
            onChange={(event) => {
              setGovernorateId(event.target.value);
              setAreaId("");
            }}
            aria-describedby="home-search-hint"
            className="h-9 border-0 bg-transparent px-0 text-[13px] font-black shadow-none"
          >
            <option value="">اختر المحافظة</option>
            {governorates.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
        </label>

        <label className="home-search-field grid min-w-0 gap-1 rounded-[16px] bg-white px-3 py-2 shadow-[0_7px_20px_rgba(15,35,64,0.035)]">
          <span className="text-xs font-black leading-5 text-slate-500">الاختصاص</span>
          <Select
            name="specialtyId"
            value={specialtyId}
            onChange={(event) => {
              setSpecialtyId(event.target.value);
              setAreaId("");
            }}
            className="h-9 border-0 bg-transparent px-0 text-[13px] font-black shadow-none"
          >
            <option value="">اختر الاختصاص</option>
            {specialties.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
        </label>

        <label className="home-search-field grid min-w-0 gap-1 rounded-[16px] bg-white px-3 py-2 shadow-[0_7px_20px_rgba(15,35,64,0.035)]">
          <span className="text-xs font-black leading-5 text-slate-500">المنطقة</span>
          <Select
            name="areaId"
            value={areaId}
            onChange={(event) => setAreaId(event.target.value)}
            disabled={!governorateId || !specialtyId || isLoadingAreas || areaLoadFailed}
            aria-busy={isLoadingAreas}
            className="h-9 border-0 bg-transparent px-0 text-[13px] font-black shadow-none disabled:bg-transparent disabled:text-slate-400 disabled:opacity-100"
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
        </label>

        <Button type="submit" className="home-search-action min-h-[70px] w-full rounded-[16px] px-4 text-[13px] font-black">
          <Search className="h-4 w-4" aria-hidden="true" />
          عرض الأطباء
        </Button>
      </form>

      {areaLoadFailed ? (
        <p className="mt-2.5 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700" role="alert">
          تعذر تحميل المناطق. {" "}
          <button
            type="button"
            className="min-h-9 font-black underline"
            onClick={() => setRetry((value) => value + 1)}
          >
            إعادة المحاولة
          </button>
        </p>
      ) : null}

      <div className="home-search-direct mt-2.5 flex flex-col gap-2 rounded-[18px] border border-slate-100/90 bg-white/70 p-2 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <span className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft/70 text-primary-dark sm:flex">
            <Stethoscope className="h-4 w-4" aria-hidden="true" />
          </span>
          <form action="/doctors" className="flex min-w-0 flex-1 gap-2" role="search">
            <label htmlFor="home-doctor-name-search" className="sr-only">ابحث باسم الطبيب أو الاختصاص أو المنطقة</label>
            <Input
              id="home-doctor-name-search"
              name="q"
              maxLength={120}
              placeholder="اسم الطبيب، الاختصاص أو المنطقة"
              className="h-10 min-w-0 flex-1 rounded-xl border-0 bg-slate-50/85 text-[13px] shadow-none"
            />
            <Button type="submit" variant="secondary" className="h-10 min-h-10 shrink-0 rounded-xl px-3.5 font-black">
              <Search className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">بحث</span>
            </Button>
          </form>
        </div>
        <span className="px-1 text-xs font-bold leading-5 text-slate-500 sm:max-w-[150px]">
          أو ابحث مباشرة بالاسم
        </span>
      </div>

      <p id="home-search-hint" className="sr-only">
        تظهر المناطق بعد اختيار المحافظة والاختصاص حتى تكون الخيارات مرتبطة بنتائج فعلية.
      </p>
    </div>
  );
}
