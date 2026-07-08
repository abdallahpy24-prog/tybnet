"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";

type ProviderType = "DOCTOR" | "DENTIST";
type SpecialtyFor = "DOCTOR" | "DENTIST" | "BOTH";
type ProviderStatus = "DRAFT" | "ACTIVE" | "INACTIVE";

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

type SpecialtyOption = {
  id: string;
  name: string;
  forType: SpecialtyFor;
};

type ProviderRow = {
  id: string;
  type: ProviderType;
  name: string;
  titlePrefix: string | null;
  specialtyId: string | null;
  governorateId: string;
  areaId: string;
  slug: string;
  whatsapp: string | null;
  phone: string | null;
  instagramUrl: string | null;
  imageUrl: string | null;
  status: ProviderStatus;
  sortOrder: number;
  bookingPoints: number;
  isFeatured: boolean;
  address: string | null;
  workingHours: string | null;
  bio: string | null;
};

type FormAction = (formData: FormData) => void | Promise<void>;

type ProviderFormProps = {
  mode: "create" | "edit";
  action: FormAction;
  governorates: GovernorateOption[];
  areas: AreaOption[];
  specialties: SpecialtyOption[];
  row?: ProviderRow;
};

function isSpecialtyAllowed(specialty: SpecialtyOption, type: ProviderType) {
  return specialty.forType === "BOTH" || specialty.forType === type;
}

export function ProviderForm({
  mode,
  action,
  governorates,
  areas,
  specialties,
  row,
}: ProviderFormProps) {
  const [providerType, setProviderType] = useState<ProviderType>(
    row?.type ?? "DOCTOR"
  );

  const [governorateId, setGovernorateId] = useState(
    row?.governorateId ?? governorates[0]?.id ?? ""
  );

  const filteredAreas = useMemo(() => {
    return areas.filter((area) => area.governorateId === governorateId);
  }, [areas, governorateId]);

  const [areaId, setAreaId] = useState(row?.areaId ?? "");

  useEffect(() => {
    const currentAreaIsValid = filteredAreas.some((area) => area.id === areaId);

    if (!currentAreaIsValid) {
      setAreaId(filteredAreas[0]?.id ?? "");
    }
  }, [filteredAreas, areaId]);

  const filteredSpecialties = useMemo(() => {
    return specialties.filter((specialty) =>
      isSpecialtyAllowed(specialty, providerType)
    );
  }, [specialties, providerType]);

  const [specialtyId, setSpecialtyId] = useState(row?.specialtyId ?? "");
  const [imageUrl, setImageUrl] = useState(row?.imageUrl ?? "");

  useEffect(() => {
    const currentSpecialtyIsValid = filteredSpecialties.some(
      (specialty) => specialty.id === specialtyId
    );

    if (!currentSpecialtyIsValid) {
      setSpecialtyId(filteredSpecialties[0]?.id ?? "");
    }
  }, [filteredSpecialties, specialtyId]);

  const isCreate = mode === "create";
  const canSubmit = Boolean(governorateId && areaId && specialtyId);

  return (
    <form action={action} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {isCreate ? (
        <>
          <input type="hidden" name="status" value="ACTIVE" />
          <input type="hidden" name="titlePrefix" value="د." />
          <input type="hidden" name="sortOrder" value="0" />
          <input type="hidden" name="bookingPoints" value="0" />
        </>
      ) : (
        <input type="hidden" name="id" value={row?.id} />
      )}

      <Field label="النوع">
        <Select
          name="type"
          value={providerType}
          onChange={(event) => setProviderType(event.target.value as ProviderType)}
          required
        >
          <option value="DOCTOR">طبيب</option>
          <option value="DENTIST">طبيب أسنان</option>
        </Select>
      </Field>

      <Field label="الاسم">
        <Input
          name="name"
          required
          defaultValue={row?.name ?? ""}
          placeholder="أحمد الخفاجي"
        />
      </Field>

      <Field label="الاختصاص">
        <Select
          name="specialtyId"
          value={specialtyId}
          onChange={(event) => setSpecialtyId(event.target.value)}
          required
          disabled={!filteredSpecialties.length}
        >
          {filteredSpecialties.map((specialty) => (
            <option key={specialty.id} value={specialty.id}>
              {specialty.name}
              {specialty.forType === "BOTH" ? " - عام" : ""}
            </option>
          ))}
        </Select>
      </Field>

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

      <ImageUploadField value={imageUrl} onChange={setImageUrl} />

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

        {!filteredSpecialties.length ? (
          <p className="mt-1 text-red-700">
            لا توجد اختصاصات مناسبة لهذا النوع. أضف اختصاص مناسب للطبيب أو طبيب الأسنان أولاً.
          </p>
        ) : null}
      </div>

      {!isCreate ? (
        <>
          <Field label="اللقب">
            <Input name="titlePrefix" defaultValue={row?.titlePrefix ?? "د."} />
          </Field>

          <Field label="Slug">
            <Input name="slug" defaultValue={row?.slug ?? ""} className="ltr" />
          </Field>

          <Field label="الهاتف">
            <Input name="phone" defaultValue={row?.phone ?? ""} placeholder="اختياري" />
          </Field>

          <Field label="إنستغرام">
            <Input
              name="instagramUrl"
              defaultValue={row?.instagramUrl ?? ""}
              placeholder="@dr.name"
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

          <Field label="الترتيب اليدوي">
            <Input name="sortOrder" type="number" defaultValue={row?.sortOrder ?? 0} />
          </Field>

          <Field label="عدد النقاط">
            <Input
              name="bookingPoints"
              type="number"
              min={0}
              defaultValue={row?.bookingPoints ?? 0}
            />
          </Field>

          <label className="flex h-11 items-center gap-2 text-sm font-bold">
            <input name="isFeatured" type="checkbox" defaultChecked={row?.isFeatured ?? false} />
            مميز
          </label>

          <Field label="العنوان">
            <Textarea name="address" defaultValue={row?.address ?? ""} />
          </Field>

          <Field label="أوقات الدوام">
            <Textarea name="workingHours" defaultValue={row?.workingHours ?? ""} />
          </Field>

          <Field label="نبذة">
            <Textarea name="bio" defaultValue={row?.bio ?? ""} />
          </Field>
        </>
      ) : null}

      <Button
        type="submit"
        disabled={!canSubmit}
        variant={isCreate ? undefined : "secondary"}
        className="md:col-span-2 xl:col-span-3"
      >
        {isCreate ? "إضافة مقدم خدمة" : "حفظ التعديل"}
      </Button>
    </form>
  );
}

function ImageUploadField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function uploadImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setMessage(null);

    if (!file.type.startsWith("image/")) {
      setMessage("اختَر ملف صورة فقط.");
      event.target.value = "";
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setMessage("حجم الصورة يجب ألا يتجاوز 3MB.");
      event.target.value = "";
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.error || "فشل رفع الصورة");
      }

      if (!result?.url || typeof result.url !== "string") {
        throw new Error("لم يرجع رابط الصورة من الخادم");
      }

      onChange(result.url);
      setMessage("تم رفع الصورة بنجاح.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "فشل رفع الصورة");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div className="grid gap-2 md:col-span-2 xl:col-span-3">
      <span className="text-sm font-semibold text-navy">صورة الطبيب</span>

      <div className="grid gap-3 rounded-2xl border border-borderSoft bg-surface p-4 md:grid-cols-[120px_1fr]">
        <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl border border-borderSoft bg-white">
          {value ? (
            <Image
              src={value}
              alt="صورة الطبيب"
              width={112}
              height={112}
              unoptimized
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-center text-xs font-bold text-slate-400">
              لا توجد صورة
            </span>
          )}
        </div>

        <div className="grid gap-2">
          <Input
            name="imageUrl"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="/uploads/image.webp"
            className="ltr"
          />

          <div className="flex flex-wrap gap-2">
            <label className="focus-ring inline-flex h-10 cursor-pointer items-center justify-center rounded-xl bg-primary px-4 text-sm font-bold text-white transition hover:brightness-105">
              {uploading ? "جاري الرفع..." : "اختيار صورة من الجهاز"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={uploadImage}
                disabled={uploading}
              />
            </label>

            {value ? (
              <button
                type="button"
                className="h-10 rounded-xl border border-borderSoft bg-white px-4 text-sm font-bold text-navy"
                onClick={() => {
                  onChange("");
                  setMessage(null);
                }}
              >
                حذف الصورة
              </button>
            ) : null}
          </div>

          <p className="text-xs font-bold text-slate-500">
            الصيغ المدعومة: JPG / PNG / WebP — الحد الأعلى 3MB.
          </p>

          {message ? (
            <p
              className={
                message.includes("تم رفع")
                  ? "text-sm font-bold text-emerald-700"
                  : "text-sm font-bold text-red-700"
              }
            >
              {message}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}