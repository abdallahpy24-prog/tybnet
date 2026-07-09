"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

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
  mapurl?: string | null;
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

type AdminSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

function AdminSection({ title, description, children }: AdminSectionProps) {
  return (
    <section className="rounded-3xl border border-borderSoft bg-white p-4 shadow-sm md:col-span-2 xl:col-span-3">
      <div className="mb-4 border-b border-borderSoft pb-3">
        <h3 className="text-base font-extrabold text-slate-900">{title}</h3>

        {description ? (
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
            {description}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{children}</div>
    </section>
  );
}

type ImageUploadFieldProps = {
  value: string;
  label: string;
  placeholder: string;
  onChange: (value: string) => void;
  onUploadingChange: (value: boolean) => void;
};

function ImageUploadField({
  value,
  label,
  placeholder,
  onChange,
  onUploadingChange
}: ImageUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("اختار ملف صورة فقط.");
      event.target.value = "";
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setError("حجم الصورة لازم يكون أقل من 3MB.");
      event.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    onUploadingChange(true);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });

      const data = (await response.json().catch(() => null)) as
        | {
            ok?: boolean;
            url?: string;
            imageUrl?: string;
            path?: string;
            message?: string;
            error?: string;
          }
        | null;

      if (!response.ok) {
        throw new Error(
          data?.message || data?.error || "صار خطأ أثناء رفع الصورة."
        );
      }

      const uploadedUrl = data?.url || data?.imageUrl || data?.path;

      if (!uploadedUrl) {
        throw new Error("تم الرفع لكن السيرفر ما رجّع رابط الصورة.");
      }

      onChange(uploadedUrl);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "صار خطأ أثناء رفع الصورة."
      );
    } finally {
      setIsUploading(false);
      onUploadingChange(false);
      event.target.value = "";
    }
  }

  return (
    <div className="space-y-3 md:col-span-2 xl:col-span-3">
      <Field label={label}>
        <Input
          name="imageUrl"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="ltr"
        />
      </Field>

      <div className="rounded-2xl border border-dashed border-borderSoft bg-slate-50 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-extrabold text-slate-800">
              رفع صورة من الجهاز
            </p>
            <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
              يفضل صورة واضحة بصيغة JPG أو PNG أو WebP، والحجم أقل من 3MB.
            </p>
          </div>

          <label className="inline-flex h-11 cursor-pointer items-center justify-center rounded-2xl bg-primary px-5 text-sm font-extrabold text-white transition hover:opacity-90">
            {isUploading ? "جاري الرفع..." : "اختيار صورة"}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={isUploading}
              onChange={handleImageChange}
            />
          </label>
        </div>

        {error ? (
          <p className="mt-3 rounded-2xl bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
            {error}
          </p>
        ) : null}

        {value ? (
          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
            <div className="h-28 w-full overflow-hidden rounded-2xl border border-borderSoft bg-white md:w-44">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value}
                alt="معاينة الصورة"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="break-all text-xs font-semibold leading-6 text-slate-500">
                {value}
              </p>

              <Button
                type="button"
                variant="secondary"
                className="mt-2"
                onClick={() => onChange("")}
                disabled={isUploading}
              >
                حذف الصورة
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function ServicePlaceForm({
  kind,
  action,
  governorates,
  areas,
  submit,
  row
}: ServicePlaceFormProps) {
  const isEdit = Boolean(row);
  const isLab = kind === "lab";

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
  const [imageUrl, setImageUrl] = useState(row?.imageUrl ?? "");
  const [isImageUploading, setIsImageUploading] = useState(false);

  useEffect(() => {
    if (!governorateId && governorates[0]?.id) {
      setGovernorateId(governorates[0].id);
    }
  }, [governorateId, governorates]);

  useEffect(() => {
    const currentAreaIsValid = filteredAreas.some((area) => area.id === areaId);

    if (!currentAreaIsValid) {
      setAreaId(filteredAreas[0]?.id ?? "");
    }
  }, [filteredAreas, areaId]);

  const canSubmit = Boolean(governorateId && areaId && !isImageUploading);

  const placeNameLabel = isLab ? "اسم المختبر" : "اسم الصيدلية";
  const placeNamePlaceholder = isLab ? "مختبر الشفاء" : "صيدلية الشفاء";
  const imagePlaceholder = isLab
    ? "/uploads/lab.webp"
    : "/uploads/pharmacy.webp";

  return (
    <form action={action} className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {isEdit ? <input type="hidden" name="id" value={row?.id} /> : null}

      <AdminSection
        title="البيانات الأساسية"
        description="هذه المعلومات تظهر في القوائم وبطاقات العرض داخل الموقع والتطبيق."
      >
        <Field label={placeNameLabel}>
          <Input
            name="name"
            required
            defaultValue={row?.name ?? ""}
            placeholder={placeNamePlaceholder}
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

        <Field label="الحالة">
          <Select name="status" defaultValue={row?.status ?? "ACTIVE"}>
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </Select>
        </Field>

        <label className="flex h-11 items-center gap-2 rounded-2xl border border-borderSoft bg-slate-50 px-3 text-sm font-bold text-slate-700">
          <input
            name="isFeatured"
            type="checkbox"
            defaultChecked={row?.isFeatured ?? false}
          />
          مميز
        </label>
      </AdminSection>

      <AdminSection
        title="الموقع"
        description="العنوان شيء، ورابط اللوكيشن شيء ثاني. لا تخلي رابط الخريطة داخل العنوان."
      >
        <Field label="المحافظة">
          <Select
            name="governorateId"
            value={governorateId}
            onChange={(event) => setGovernorateId(event.target.value)}
            required
            disabled={!governorates.length}
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

        <Field label="رابط اللوكيشن">
          <Input
            name="mapurl"
            className="ltr"
            defaultValue={row?.mapurl ?? ""}
            placeholder="https://maps.app.goo.gl/..."
          />
        </Field>

        <div className="md:col-span-2 xl:col-span-3">
          <Field label="العنوان التفصيلي">
            <Textarea
              name="address"
              defaultValue={row?.address ?? ""}
              placeholder={
                isLab
                  ? "مثلاً: بغداد، المنصور، قرب ..."
                  : "مثلاً: بغداد، الكرادة، قرب ..."
              }
            />
          </Field>
        </div>

        <div className="rounded-2xl border border-borderSoft bg-slate-50 p-4 text-sm font-bold leading-7 text-slate-600 md:col-span-2 xl:col-span-3">
          {filteredAreas.length ? (
            <p>
              المناطق المعروضة مرتبطة بالمحافظة المختارة فقط. إذا اخترت بغداد،
              تظهر مناطق بغداد فقط.
            </p>
          ) : (
            <p className="text-red-700">
              لا توجد مناطق مرتبطة بهذه المحافظة. أضف منطقة لهذه المحافظة أولاً.
            </p>
          )}
        </div>
      </AdminSection>

      <AdminSection
        title="التواصل"
        description="الواتساب يستخدم للزر الأساسي، والهاتف يستخدم للاتصال المباشر."
      >
        <Field label="واتساب">
          <Input
            name="whatsapp"
            defaultValue={row?.whatsapp ?? ""}
            placeholder="0770xxxxxxx"
            className="ltr"
          />
        </Field>

        <Field label="الهاتف">
          <Input
            name="phone"
            defaultValue={row?.phone ?? ""}
            placeholder="اختياري"
            className="ltr"
          />
        </Field>
      </AdminSection>

      <AdminSection
        title="الصورة"
        description="ارفع الصورة من الجهاز أو ضع رابط صورة جاهز."
      >
        <ImageUploadField
          label={isLab ? "صورة المختبر" : "صورة الصيدلية"}
          value={imageUrl}
          placeholder={imagePlaceholder}
          onChange={setImageUrl}
          onUploadingChange={setIsImageUploading}
        />
      </AdminSection>

      <AdminSection
        title="التفاصيل"
        description="هذه التفاصيل تظهر داخل صفحة الصيدلية أو المختبر."
      >
        <div className="md:col-span-2 xl:col-span-3">
          <Field label="ساعات العمل">
            <Textarea
              name="workingHours"
              defaultValue={row?.workingHours ?? ""}
              placeholder="مثلاً: يومياً من 9 صباحاً إلى 11 مساءً"
            />
          </Field>
        </div>

        {isLab ? (
          <div className="md:col-span-2 xl:col-span-3">
            <Field label="الخدمات">
              <Textarea
                name="services"
                defaultValue={row?.services ?? ""}
                placeholder="تحاليل دم، PCR، فحوصات هرمونات..."
              />
            </Field>
          </div>
        ) : null}
      </AdminSection>

      <Button
        type="submit"
        disabled={!canSubmit}
        variant={isEdit ? "secondary" : undefined}
        className="md:col-span-2 xl:col-span-3"
      >
        {isImageUploading ? "انتظر حتى يكتمل رفع الصورة..." : submit}
      </Button>
    </form>
  );
}