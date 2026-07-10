"use client";

import Image from "next/image";
import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type ReactNode
} from "react";

import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";

type ProviderType = "DOCTOR" | "DENTIST" | "COSMETIC_DOCTOR";

type SpecialtyFor =
  | "DOCTOR"
  | "DENTIST"
  | "COSMETIC_DOCTOR"
  | "BOTH";

type ProviderStatus = "DRAFT" | "ACTIVE" | "INACTIVE";
type ProviderCategory = "GENERAL" | "COSMETIC";

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
  mapurl: string | null;
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
  category?: ProviderCategory;
  row?: ProviderRow;
};

type AdminSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

function AdminSection({
  title,
  description,
  children
}: AdminSectionProps) {
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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {children}
      </div>
    </section>
  );
}

function isSpecialtyAllowed(
  specialty: SpecialtyOption,
  type: ProviderType
) {
  if (type === "COSMETIC_DOCTOR") {
    return specialty.forType === "COSMETIC_DOCTOR";
  }

  return specialty.forType === "BOTH" || specialty.forType === type;
}

function providerTypeLabel(type: ProviderType) {
  if (type === "DENTIST") {
    return "طبيب أسنان";
  }

  if (type === "COSMETIC_DOCTOR") {
    return "طبيب تجميل";
  }

  return "طبيب";
}

type ImageUploadFieldProps = {
  value: string;
  providerType: ProviderType;
  onChange: (value: string) => void;
  onUploadingChange: (value: boolean) => void;
};

function ImageUploadField({
  value,
  providerType,
  onChange,
  onUploadingChange
}: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const label =
    providerType === "DENTIST"
      ? "صورة طبيب الأسنان"
      : providerType === "COSMETIC_DOCTOR"
        ? "صورة طبيب التجميل"
        : "صورة الطبيب";

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

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    onUploadingChange(true);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });

      const result = (await response.json().catch(() => null)) as
        | {
            ok?: boolean;
            url?: string;
            imageUrl?: string;
            path?: string;
            error?: string;
            message?: string;
          }
        | null;

      if (!response.ok) {
        throw new Error(
          result?.message || result?.error || "فشل رفع الصورة."
        );
      }

      const uploadedUrl =
        result?.url || result?.imageUrl || result?.path;

      if (!uploadedUrl) {
        throw new Error("تم الرفع لكن الخادم لم يرجع رابط الصورة.");
      }

      onChange(uploadedUrl);
      setMessage("تم رفع الصورة بنجاح.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "فشل رفع الصورة."
      );
    } finally {
      setUploading(false);
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
          onChange={(event) => {
            onChange(event.target.value);
            setMessage(null);
          }}
          placeholder="/uploads/provider.webp"
          className="ltr"
        />
      </Field>

      <div className="grid gap-3 rounded-2xl border border-dashed border-borderSoft bg-slate-50 p-4 md:grid-cols-[132px_1fr]">
        <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-2xl border border-borderSoft bg-white">
          {value ? (
            <Image
              src={value}
              alt={label}
              width={128}
              height={128}
              unoptimized
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="px-3 text-center text-xs font-bold leading-5 text-slate-400">
              لا توجد صورة
            </span>
          )}
        </div>

        <div className="flex flex-col justify-center gap-3">
          <div>
            <p className="text-sm font-extrabold text-slate-800">
              رفع صورة من الجهاز
            </p>

            <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
              يفضل صورة واضحة بصيغة JPG أو PNG أو WebP، والحجم أقل من
              3MB.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <label className="focus-ring inline-flex h-10 cursor-pointer items-center justify-center rounded-xl bg-primary px-4 text-sm font-bold text-white transition hover:brightness-105">
              {uploading ? "جاري الرفع..." : "اختيار صورة"}

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/*"
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
                disabled={uploading}
              >
                حذف الصورة
              </button>
            ) : null}
          </div>

          {value ? (
            <p className="break-all text-xs font-semibold leading-5 text-slate-500">
              {value}
            </p>
          ) : null}

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

export function ProviderForm({
  mode,
  action,
  governorates,
  areas,
  specialties,
  category = "GENERAL",
  row
}: ProviderFormProps) {
  const isCreate = mode === "create";
  const isCosmetic = category === "COSMETIC";

  const [providerType, setProviderType] = useState<ProviderType>(
    row?.type ?? (isCosmetic ? "COSMETIC_DOCTOR" : "DOCTOR")
  );

  const firstGovernorateId =
    row?.governorateId ?? governorates[0]?.id ?? "";

  const [governorateId, setGovernorateId] =
    useState(firstGovernorateId);

  const filteredAreas = useMemo(() => {
    return areas.filter(
      (area) => area.governorateId === governorateId
    );
  }, [areas, governorateId]);

  const firstAreaId =
    row?.areaId ??
    areas.find(
      (area) => area.governorateId === firstGovernorateId
    )?.id ??
    "";

  const [areaId, setAreaId] = useState(firstAreaId);

  const filteredSpecialties = useMemo(() => {
    return specialties.filter((specialty) =>
      isSpecialtyAllowed(specialty, providerType)
    );
  }, [specialties, providerType]);

  const [specialtyId, setSpecialtyId] = useState(
    row?.specialtyId ?? ""
  );

  const [imageUrl, setImageUrl] = useState(row?.imageUrl ?? "");
  const [isImageUploading, setIsImageUploading] = useState(false);

  useEffect(() => {
    if (!governorateId && governorates[0]?.id) {
      setGovernorateId(governorates[0].id);
    }
  }, [governorateId, governorates]);

  useEffect(() => {
    const currentAreaIsValid = filteredAreas.some(
      (area) => area.id === areaId
    );

    if (!currentAreaIsValid) {
      setAreaId(filteredAreas[0]?.id ?? "");
    }
  }, [filteredAreas, areaId]);

  useEffect(() => {
    const currentSpecialtyIsValid = filteredSpecialties.some(
      (specialty) => specialty.id === specialtyId
    );

    if (!currentSpecialtyIsValid) {
      setSpecialtyId(filteredSpecialties[0]?.id ?? "");
    }
  }, [filteredSpecialties, specialtyId]);

  const canSubmit = Boolean(
    governorateId &&
      areaId &&
      specialtyId &&
      !isImageUploading
  );

  return (
    <form
      action={action}
      className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
    >
      {!isCreate ? (
        <input type="hidden" name="id" value={row?.id} />
      ) : null}

      <AdminSection
        title="البيانات الأساسية"
        description={
          isCosmetic
            ? "هذه البيانات تظهر في قوائم وبطاقات أطباء التجميل."
            : "هذه البيانات تظهر في القوائم وبطاقات الأطباء وأطباء الأسنان."
        }
      >
        <Field label="النوع">
          {isCosmetic ? (
            <>
              <input
                type="hidden"
                name="type"
                value="COSMETIC_DOCTOR"
              />

              <Select
                value="COSMETIC_DOCTOR"
                disabled
                aria-label="نوع مقدم الخدمة"
              >
                <option value="COSMETIC_DOCTOR">طبيب تجميل</option>
              </Select>
            </>
          ) : (
            <Select
              name="type"
              value={providerType}
              onChange={(event) =>
                setProviderType(
                  event.target.value as ProviderType
                )
              }
              required
            >
              <option value="DOCTOR">طبيب</option>
              <option value="DENTIST">طبيب أسنان</option>
            </Select>
          )}
        </Field>

        <Field label="اللقب">
          <Input
            name="titlePrefix"
            defaultValue={row?.titlePrefix ?? "د."}
            placeholder="د."
          />
        </Field>

        <Field label="الاسم">
          <Input
            name="name"
            required
            defaultValue={row?.name ?? ""}
            placeholder={
              isCosmetic ? "اسم طبيب التجميل" : "أحمد الخفاجي"
            }
          />
        </Field>

        <Field label="الاختصاص">
          <Select
            name="specialtyId"
            value={specialtyId}
            onChange={(event) =>
              setSpecialtyId(event.target.value)
            }
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

        <Field label="Slug">
          <Input
            name="slug"
            defaultValue={row?.slug ?? ""}
            placeholder={
              isCosmetic
                ? "cosmetic-doctor-name"
                : "doctor-name"
            }
            className="ltr"
          />
        </Field>

        <Field label="الحالة">
          <Select
            name="status"
            defaultValue={row?.status ?? "ACTIVE"}
          >
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
        description="العنوان النصي شيء، ورابط اللوكيشن شيء ثاني. خلي رابط الخريطة داخل حقل رابط الموقع فقط."
      >
        <Field label="المحافظة">
          <Select
            name="governorateId"
            value={governorateId}
            onChange={(event) =>
              setGovernorateId(event.target.value)
            }
            required
            disabled={!governorates.length}
          >
            {governorates.map((governorate) => (
              <option
                key={governorate.id}
                value={governorate.id}
              >
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

        <Field label="رابط الموقع">
          <Input
            name="mapurl"
            defaultValue={row?.mapurl ?? ""}
            placeholder="https://maps.app.goo.gl/..."
            className="ltr"
          />
        </Field>

        <div className="md:col-span-2 xl:col-span-3">
          <Field label="العنوان التفصيلي">
            <Textarea
              name="address"
              defaultValue={row?.address ?? ""}
              placeholder="مثلاً: بغداد، المنصور، قرب ..."
            />
          </Field>
        </div>

        <div className="rounded-2xl border border-borderSoft bg-slate-50 p-4 text-sm font-bold leading-7 text-slate-600 md:col-span-2 xl:col-span-3">
          {filteredAreas.length ? (
            <p>
              المناطق المعروضة مرتبطة بالمحافظة المختارة فقط. إذا اخترت
              بغداد، تظهر مناطق بغداد فقط.
            </p>
          ) : (
            <p className="text-red-700">
              لا توجد مناطق مرتبطة بهذه المحافظة. أضف منطقة لهذه
              المحافظة أولاً.
            </p>
          )}

          {!filteredSpecialties.length ? (
            <p className="mt-1 text-red-700">
              {isCosmetic
                ? "لا توجد اختصاصات لأطباء التجميل. أضف اختصاصاً خاصاً بأطباء التجميل أولاً."
                : "لا توجد اختصاصات مناسبة لهذا النوع. أضف اختصاصاً مناسباً للطبيب أو طبيب الأسنان أولاً."}
            </p>
          ) : null}
        </div>
      </AdminSection>

      <AdminSection
        title="التواصل"
        description="الواتساب يستخدم للزر الأساسي، والهاتف يستخدم للاتصال المباشر، والإنستغرام يظهر كرابط خارجي."
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

        <Field label="إنستغرام">
          <Input
            name="instagramUrl"
            defaultValue={row?.instagramUrl ?? ""}
            placeholder="@dr.name"
            className="ltr"
          />
        </Field>
      </AdminSection>

      <AdminSection
        title="الصورة"
        description={`ارفع صورة ${providerTypeLabel(providerType)} من الجهاز أو ضع رابط صورة جاهز.`}
      >
        <ImageUploadField
          value={imageUrl}
          providerType={providerType}
          onChange={setImageUrl}
          onUploadingChange={setIsImageUploading}
        />
      </AdminSection>

      <AdminSection
        title="التفاصيل والظهور"
        description={
          isCosmetic
            ? "النقاط والترتيب تساعدك تتحكم بمن يظهر أولاً، والنبذة وساعات الدوام تظهر داخل صفحة طبيب التجميل."
            : "النقاط والترتيب تساعدك تتحكم بمن يظهر أولاً، والنبذة وساعات الدوام تظهر داخل صفحة الطبيب."
        }
      >
        <Field label="الترتيب اليدوي">
          <Input
            name="sortOrder"
            type="number"
            defaultValue={row?.sortOrder ?? 0}
          />
        </Field>

        <Field label="عدد النقاط">
          <Input
            name="bookingPoints"
            type="number"
            min={0}
            defaultValue={row?.bookingPoints ?? 0}
          />
        </Field>

        <div className="md:col-span-2 xl:col-span-3">
          <Field label="أوقات الدوام">
            <Textarea
              name="workingHours"
              defaultValue={row?.workingHours ?? ""}
              placeholder="مثلاً: السبت إلى الخميس من 4 عصراً إلى 9 مساءً"
            />
          </Field>
        </div>

        <div className="md:col-span-2 xl:col-span-3">
          <Field label="نبذة">
            <Textarea
              name="bio"
              defaultValue={row?.bio ?? ""}
              placeholder={
                isCosmetic
                  ? "نبذة عن طبيب التجميل وخبرته وخدماته..."
                  : "نبذة مختصرة عن الطبيب أو الخبرة أو الخدمات..."
              }
            />
          </Field>
        </div>
      </AdminSection>

      <Button
        type="submit"
        disabled={!canSubmit}
        variant={isCreate ? undefined : "secondary"}
        className="md:col-span-2 xl:col-span-3"
      >
        {isImageUploading
          ? "انتظر حتى يكتمل رفع الصورة..."
          : isCreate
            ? isCosmetic
              ? "إضافة طبيب تجميل"
              : "إضافة مقدم خدمة"
            : "حفظ التعديل"}
      </Button>
    </form>
  );
}