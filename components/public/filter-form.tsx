"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { RotateCcw, Search } from "lucide-react";

import { Button, buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/input";

type GovernorateOption = {
  id: string;
  name: string;
};

type AreaOption = {
  id: string;
  name: string;
  governorateId?: string;
  governorate?: {
    id?: string;
    name: string;
  } | null;
};

type SpecialtyOption = {
  id: string;
  name: string;
};

type ProviderType = "DOCTOR" | "DENTIST" | "COSMETIC_DOCTOR";
type PlaceType = "pharmacies" | "labs" | "cosmetic-centers";

type AreaApiResponse = {
  ok?: boolean;
  items?: Array<{
    id: string;
    name: string;
    governorateId?: string;
  }>;
};

function getAreaGovernorateId(area: AreaOption) {
  return area.governorateId ?? area.governorate?.id ?? "";
}

function FilterFormFields({
  action,
  q,
  governorates,
  areas,
  specialties,
  showSpecialties = true,
  providerType = "DOCTOR",
  placeType
}: {
  action: string;
  q?: string;
  governorates: GovernorateOption[];
  areas: AreaOption[];
  specialties?: SpecialtyOption[];
  showSpecialties?: boolean;
  providerType?: ProviderType;
  placeType?: PlaceType;
}) {
  const searchParams = useSearchParams();

  const initialGovernorateId = searchParams.get("governorateId") ?? "";
  const initialAreaId = searchParams.get("areaId") ?? "";
  const initialSpecialtyId = searchParams.get("specialtyId") ?? "";

  const [retry, setRetry] = useState(0);
  const [governorateId, setGovernorateId] = useState(initialGovernorateId);
  const [specialtyId, setSpecialtyId] = useState(initialSpecialtyId);
  const [areaId, setAreaId] = useState(initialAreaId);
  const [availableAreas, setAvailableAreas] = useState<AreaOption[]>(() =>
    initialGovernorateId
      ? areas.filter(
          (area) => getAreaGovernorateId(area) === initialGovernorateId
        )
      : []
  );
  const [isLoadingAreas, setIsLoadingAreas] = useState(false);
  const [areaLoadFailed, setAreaLoadFailed] = useState(false);

  const canLoadAreas = useMemo(() => {
    if (!governorateId) return false;
    if (placeType) return true;
    if (providerType === "DENTIST") return true;
    return Boolean(specialtyId);
  }, [governorateId, placeType, providerType, specialtyId]);

  useEffect(() => {
    if (!canLoadAreas) {
      setAvailableAreas([]);
      setIsLoadingAreas(false);
      setAreaLoadFailed(false);
      return;
    }

    const controller = new AbortController();
    const query = new URLSearchParams({ governorateId });

    if (placeType) {
      query.set("placeType", placeType);
    } else if (providerType === "DENTIST") {
      query.set("forType", "DENTIST");
    } else {
      query.set("forType", providerType);
      query.set("specialtyId", specialtyId);
    }

    setIsLoadingAreas(true);
    setAreaLoadFailed(false);

    fetch(`/api/mobile/areas?${query.toString()}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" }
    })
      .then(async (response) => {
        const payload = (await response.json().catch(() => null)) as AreaApiResponse | null;
        if (!response.ok || !payload?.ok) {
          throw new Error("areas-load-failed");
        }
        return Array.isArray(payload.items) ? payload.items : [];
      })
      .then((items) => {
        if (controller.signal.aborted) return;
        setAvailableAreas(items);
        setAreaId((current) =>
          current && !items.some((item) => item.id === current) ? "" : current
        );
      })
      .catch((error) => {
        if (controller.signal.aborted || (error instanceof DOMException && error.name === "AbortError")) {
          return;
        }
        setAvailableAreas([]);
        setAreaLoadFailed(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoadingAreas(false);
        }
      });

    return () => controller.abort();
  }, [canLoadAreas, governorateId, placeType, providerType, specialtyId, retry]);

  const hasActiveFilters = Boolean(
    q || initialGovernorateId || initialAreaId || initialSpecialtyId
  );

  const areaPrompt = !governorateId
    ? "اختر المحافظة أولاً"
    : showSpecialties && providerType !== "DENTIST" && !specialtyId
      ? "اختر الاختصاص أولاً"
      : isLoadingAreas
        ? "جاري تحميل المناطق..."
        : areaLoadFailed
          ? "تعذر تحميل المناطق"
          : availableAreas.length
            ? "كل المناطق المتاحة"
            : "لا توجد مناطق مطابقة";

  return (
    <Card className="mb-6 md:mb-8">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-base font-black text-navy">فلترة النتائج</h2>
          <p className="mt-1 text-xs font-semibold leading-6 text-slate-500">
            ابدأ بالمحافظة، ثم الاختصاص عند توفره، وبعدها تظهر المناطق التي تحتوي نتائج فعلية.
          </p>
        </div>
        {hasActiveFilters ? (
          <Link
            href={action}
            className={buttonStyles({
              variant: "ghost",
              className: "min-h-9 h-9 self-start px-3 text-xs sm:self-auto"
            })}
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            مسح الكل
          </Link>
        ) : null}
      </div>

      {areaLoadFailed ? (
        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm" role="alert">
          <span>تعذر تحميل المناطق. يمكنك إعادة المحاولة أو البحث بكل المناطق.</span>
          <Button type="button" variant="ghost" onClick={() => setRetry((value) => value + 1)}>إعادة المحاولة</Button>
        </div>
      ) : null}

      <form
        action={action}
        className="grid gap-4 lg:grid-cols-4"
        role="search"
      >
        <Field label="المحافظة">
          <Select
            name="governorateId"
            value={governorateId}
            onChange={(event) => {
              setGovernorateId(event.target.value);
              setAreaId("");
            }}
          >
            <option value="">كل المحافظات</option>
            {governorates.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
        </Field>

        {showSpecialties ? (
          <Field label="الاختصاص">
            <Select
              name="specialtyId"
              value={specialtyId}
              onChange={(event) => {
                setSpecialtyId(event.target.value);
                setAreaId("");
              }}
            >
              <option value="">كل الاختصاصات</option>
              {(specialties ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </Field>
        ) : null}

        <Field label="المنطقة">
          <Select
            name="areaId"
            value={areaId}
            onChange={(event) => setAreaId(event.target.value)}
            disabled={!canLoadAreas || isLoadingAreas || areaLoadFailed}
            aria-busy={isLoadingAreas}
          >
            <option value="">{areaPrompt}</option>
            {availableAreas.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="بحث بالاسم أو الكلمات">
          <Input
            name="q"
            defaultValue={q}
            maxLength={120}
            placeholder={placeType ? "اسم الجهة أو المنطقة" : "مثال: عيون النجف أو اسم الطبيب"}
          />
        </Field>

        <div className="flex items-end lg:col-span-4 lg:justify-end">
          <Button type="submit" className="w-full sm:w-auto sm:min-w-40">
            <Search className="h-4 w-4" aria-hidden="true" />
            عرض النتائج
          </Button>
        </div>
      </form>
    </Card>
  );
}

export function FilterForm(props: Parameters<typeof FilterFormFields>[0]) {
  const searchParams = useSearchParams();
  return <FilterFormFields key={searchParams.toString()} {...props} />;
}
