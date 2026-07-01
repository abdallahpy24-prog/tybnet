"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";

type Status = "DRAFT" | "ACTIVE" | "INACTIVE";
type ServiceKind = "pharmacy" | "lab";

type GovernorateOption = {
  id: string;
  name: string;
};

type AreaOption = {
  id: string;
  name: string;
  governorateId: string;
  governorateName: string;
};

type ServicePlaceRow = {
  id: string;
  name: string;
  slug: string;
  governorateId: string;
  areaId: string;
  whatsapp: string | null;
  phone: string | null;
  imageUrl: string | null;
  status: Status;
  isFeatured: boolean;
  address: string | null;
  workingHours: string | null;
  services?: string | null;
};

type FormAction = (formData: FormData) => void | Promise<void>;

type ServicePlaceFormProps = {
  kind: ServiceKind;
  action: FormAction;
  governorates: GovernorateOption[];
  areas: AreaOption[];
  submit: string;
  row?: ServicePlaceRow;
};

export function ServicePlaceForm({
  kind,
  action,
  governorates,
  areas,
  submit,
  row
}: ServicePlaceFormProps) {
  const firstGovernorateId = row?.governorateId ?? governorates[0]?.id ?? "";

  const [governorateId, setGovernorateId] = useState(firstGovernorateId);

  const filteredAreas = useMemo(() => {
    return areas.filter((area) => area.governorateId === governorateId);
  }, [areas, governorateId]);

  const firstAreaId =
    row?.areaId ??
    areas.find((area) => area.governorateId === firstGovernorateId)?.id ??
    "";

  const [areaId, setAreaId] = useState(firstAreaId);

  useEffect(() => {
    const currentAreaIsValid = filteredAreas.some((area) => area.id === areaId);

    if (!currentAreaIsValid) {
      setAreaId(filteredAreas[0]?.id ?? "");
    }
  }, [filteredAreas, areaId]);

  const isEdit = Boolean(row);
  const canSubmit = Boolean(governorateId && areaId);
  const isLab = kind === "lab";

  return (
    <form action={action} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {isEdit ? (
        <input type="hidden" name="id" value={row?.id} />
      ) : (
        <input type="hidden" name="status" value="ACTIVE" />
      )}

      <Field label={isLab ? "اسم المختبر" : "اسم الصيدلية"}>
        <Input
          name="name"
          required
          defaultValue={row?.name ?? ""}
          placeholder={isLab ? "مختبر الشفاء" : "صيدلية الشفاء"}
        />
      </Field>

      {isEdit ? (
        <Field label="Slug">
          <Input
            name="slug"
            className="ltr"
            defaultValue={row?.slug ?? ""}
            placeholder={isLab ? "lab-name" : "pharmacy-name"}
          />
        </Field>
      ) : null}

      <Field label="المحافظة">
        <Select
          name="governorateId"
          value={governorateId}
          onChange={(event) => setGovernorateId(event.target.value)}
          required
        >
          {governorates.map((governorate) => (
            <option key={governorate.id} value={governorate.id}>
              {governorate.name}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="المنطقة">
        <Select
          name="areaId"
          value={areaId}
          onChange={(event) => setAreaId(event.target.value)}
          required
          disabled={!filteredAreas.length}
        >
          {filteredAreas.map((area) => (
            <option key={area.id} value={area.id}>
              {area.name}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="واتساب">
        <Input
          name="whatsapp"
          defaultValue={row?.whatsapp ?? ""}
          placeholder="0770xxxxxxx"
        />
      </Field>

      <Field label="الهاتف">
        <Input
          name="phone"
          defaultValue={row?.phone ?? ""}
          placeholder="اختياري"
        />
      </Field>

      <div className="rounded-2xl border border-borderSoft bg-surface p-4 text-sm font-bold leading-7 text-slate-600 md:col-span-2 xl:col-span-3">
        {filteredAreas.length ? (
          <p>
            المناطق المعروضة مرتبطة بالمحافظة المختارة فقط. إذا اخترت بغداد، تظهر مناطق بغداد فقط.
          </p>
        ) : (
          <p className="text-red-700">
            لا توجد مناطق مرتبطة بهذه المحافظة. أضف منطقة لهذه المحافظة أولاً.
          </p>
        )}

        {!isEdit ? (
          <p className="mt-1">
            {isLab ? "المختبر" : "الصيدلية"} الجديد راح ينضاف بحالة Active تلقائياً.
          </p>
        ) : null}
      </div>

      {isEdit ? (
        <>
          <Field label="الصورة URL">
            <Input
              name="imageUrl"
              defaultValue={row?.imageUrl ?? ""}
              placeholder={isLab ? "/uploads/lab.webp" : "/uploads/pharmacy.webp"}
              className="ltr"
            />
          </Field>

          <Field label="الحالة">
            <Select name="status" defaultValue={row?.status ?? "ACTIVE"}>
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </Select>
          </Field>

          <label className="flex h-11 items-center gap-2 text-sm font-bold">
            <input
              name="isFeatured"
              type="checkbox"
              defaultChecked={row?.isFeatured ?? false}
            />
            مميز
          </label>

          <Field label="العنوان">
            <Textarea
              name="address"
              defaultValue={row?.address ?? ""}
              placeholder={isLab ? "العنوان التفصيلي للمختبر" : "العنوان التفصيلي للصيدلية"}
            />
          </Field>

          <Field label="ساعات العمل">
            <Textarea
              name="workingHours"
              defaultValue={row?.workingHours ?? ""}
              placeholder="مثلاً: يومياً من 9 صباحاً إلى 11 مساءً"
            />
          </Field>

          {isLab ? (
            <Field label="الخدمات">
              <Textarea
                name="services"
                defaultValue={row?.services ?? ""}
                placeholder="تحاليل دم، PCR، أشعة، فحوصات هرمونات..."
              />
            </Field>
          ) : null}
        </>
      ) : null}

      <Button
        type="submit"
        disabled={!canSubmit}
        variant={isEdit ? "secondary" : undefined}
        className="md:col-span-2 xl:col-span-3"
      >
        {submit}
      </Button>
    </form>
  );
}