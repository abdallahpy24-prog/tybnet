"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
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

function getAreaGovernorateId(area: AreaOption) {
  return area.governorateId ?? area.governorate?.id ?? "";
}

export function FilterForm({
  action,
  q,
  governorates,
  areas,
  specialties,
  showSpecialties = true
}: {
  action: string;
  q?: string;
  governorates: GovernorateOption[];
  areas: AreaOption[];
  specialties?: SpecialtyOption[];
  showSpecialties?: boolean;
}) {
  const searchParams = useSearchParams();

  const initialGovernorateId = searchParams.get("governorateId") ?? "";
  const initialAreaId = searchParams.get("areaId") ?? "";
  const initialSpecialtyId = searchParams.get("specialtyId") ?? "";

  const [governorateId, setGovernorateId] = useState(initialGovernorateId);
  const [areaId, setAreaId] = useState(initialAreaId);

  const filteredAreas = useMemo(() => {
    if (!governorateId) return areas;

    return areas.filter((area) => getAreaGovernorateId(area) === governorateId);
  }, [areas, governorateId]);

  useEffect(() => {
    if (!areaId) return;

    const selectedAreaStillValid = filteredAreas.some((area) => area.id === areaId);

    if (!selectedAreaStillValid) {
      setAreaId("");
    }
  }, [areaId, filteredAreas]);

  return (
    <Card className="mb-8">
      <form action={action} className="grid gap-4 lg:grid-cols-[1.3fr_1fr_1fr_1fr_auto]">
        <Field label="بحث">
          <Input
            name="q"
            defaultValue={q}
            placeholder="اسم، اختصاص، أو عنوان"
          />
        </Field>

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

        <Field label="المنطقة">
          <Select
            name="areaId"
            value={areaId}
            onChange={(event) => setAreaId(event.target.value)}
            disabled={!filteredAreas.length}
          >
            <option value="">
              {governorateId ? "كل مناطق المحافظة" : "كل المناطق"}
            </option>

            {filteredAreas.map((item) => (
              <option key={item.id} value={item.id}>
                {!governorateId && item.governorate?.name
                  ? item.governorate.name + " - "
                  : ""}
                {item.name}
              </option>
            ))}
          </Select>
        </Field>

        {showSpecialties ? (
          <Field label="الاختصاص">
            <Select name="specialtyId" defaultValue={initialSpecialtyId}>
              <option value="">كل الاختصاصات</option>

              {(specialties ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </Field>
        ) : null}

        <div className="flex items-end">
          <Button type="submit" className="w-full">
            <Search className="h-4 w-4" aria-hidden="true" />
            بحث
          </Button>
        </div>
      </form>
    </Card>
  );
}