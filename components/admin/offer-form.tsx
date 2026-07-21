"use client";

import Image from "next/image";
import {
  useState,
  type ChangeEvent,
  type ReactNode
} from "react";

import { Button } from "@/components/ui/button";
import {
  Field,
  Input,
  Select,
  Textarea
} from "@/components/ui/input";

type ProviderType =
  | "DOCTOR"
  | "DENTIST"
  | "COSMETIC_DOCTOR";

type ProviderOption = {
  id: string;
  name: string;
  titlePrefix: string;
  type: ProviderType;
};

type OfferRow = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  discountText: string | null;
  startsAt: Date | string | null;
  endsAt: Date | string | null;
  isActive: boolean;
  providerId: string | null;
};

type FormAction = (
  formData: FormData
) => void | Promise<void>;

type OfferFormProps = {
  mode: "create" | "edit";
  action: FormAction;
  providers: ProviderOption[];
  submit: string;
  row?: OfferRow;
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
        <h3 className="text-base font-extrabold text-slate-900">
          {title}
        </h3>

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

function providerTypeLabel(type: ProviderType) {
  if (type === "DENTIST") {
    return "طبيب أسنان";
  }

  if (type === "COSMETIC_DOCTOR") {
    return "طبيب تجميل";
  }

  return "طبيب";
}

function dateInputValue(
  value: Date | string | null | undefined
) {
  if (!value) return "";

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

type ImageUploadFieldProps = {
  value: string;
  onChange: (value: string) => void;
  onUploadingChange: (value: boolean) => void;
};

function ImageUploadField({
  value,
  onChange,
  onUploadingChange
}: ImageUploadFieldProps) {
  const [uploading, setUploading] =
    useState(false);

  const [message, setMessage] =
    useState<string | null>(null);

  async function uploadImage(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setMessage(null);

    if (!file.type.startsWith("image/")) {
      setMessage("اختَر ملف صورة فقط.");
      event.target.value = "";
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setMessage(
        "حجم الصورة يجب ألا يتجاوز 3MB."
      );
      event.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("mode", "single");
    formData.append("file", file);

    setUploading(true);
    onUploadingChange(true);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });

      const result = (await response
        .json()
        .catch(() => null)) as
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
          result?.message ||
            result?.error ||
            "فشل رفع الصورة."
        );
      }

      const uploadedUrl =
        result?.url ||
        result?.imageUrl ||
        result?.path;

      if (!uploadedUrl) {
        throw new Error(
          "تم الرفع لكن الخادم لم يرجع رابط الصورة."
        );
      }

      onChange(uploadedUrl);
      setMessage("تم رفع الصورة بنجاح.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "فشل رفع الصورة."
      );
    } finally {
      setUploading(false);
      onUploadingChange(false);
      event.target.value = "";
    }
  }

  return (
    <div className="space-y-3 md:col-span-2 xl:col-span-3">
      <Field label="صورة العرض">
        <Input
          name="imageUrl"
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            setMessage(null);
          }}
          placeholder="/uploads/offer.webp"
          className="ltr"
        />
      </Field>

      <div className="grid gap-3 rounded-2xl border border-dashed border-borderSoft bg-slate-50 p-4 md:grid-cols-[180px_1fr]">
        <div className="relative flex aspect-[16/9] w-full items-center justify-center overflow-hidden rounded-2xl border border-borderSoft bg-white md:w-44">
          {value ? (
            <Image
              src={value}
              alt="صورة العرض"
              fill
              unoptimized
              sizes="180px"
              className="object-cover"
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
              يفضل صورة أفقية واضحة للعرض، بصيغة JPG
              أو PNG أو WebP، والحجم أقل من 3MB.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <label className="focus-ring inline-flex h-10 cursor-pointer items-center justify-center rounded-xl bg-primary px-4 text-sm font-bold text-white transition hover:brightness-105">
              {uploading
                ? "جاري الرفع..."
                : "اختيار صورة"}

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

export function OfferForm({
  mode,
  action,
  providers,
  submit,
  row
}: OfferFormProps) {
  const isEdit = mode === "edit";

  const [imageUrl, setImageUrl] = useState(
    row?.imageUrl ?? ""
  );

  const [
    isImageUploading,
    setIsImageUploading
  ] = useState(false);

  return (
    <form
      action={action}
      className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
    >
      {isEdit ? (
        <input
          type="hidden"
          name="id"
          value={row?.id}
        />
      ) : null}

      <AdminSection
        title="بيانات العرض"
        description="هذه البيانات تظهر في صفحة العروض وفي تطبيق الموبايل."
      >
        <Field label="عنوان العرض">
          <Input
            name="title"
            required
            defaultValue={row?.title ?? ""}
            placeholder="خصم على الكشف أو الفحص"
          />
        </Field>

        <Field label="Slug">
          <Input
            name="slug"
            defaultValue={row?.slug ?? ""}
            placeholder="offer-title"
            className="ltr"
          />
        </Field>

        <Field label="نص الخصم">
          <Input
            name="discountText"
            defaultValue={
              row?.discountText ?? ""
            }
            placeholder="خصم 20%"
          />
        </Field>

        <Field label="مقدم الخدمة">
          <Select
            name="providerId"
            defaultValue={
              row?.providerId ?? ""
            }
          >
            <option value="">بدون ربط</option>

            {providers.map((provider) => (
              <option
                key={provider.id}
                value={provider.id}
              >
                {provider.titlePrefix}{" "}
                {provider.name} -{" "}
                {providerTypeLabel(
                  provider.type
                )}
              </option>
            ))}
          </Select>
        </Field>

        <label className="flex h-11 items-center gap-2 rounded-2xl border border-borderSoft bg-slate-50 px-3 text-sm font-bold text-slate-700">
          <input
            name="isActive"
            type="checkbox"
            defaultChecked={
              row?.isActive ?? true
            }
          />
          نشط
        </label>
      </AdminSection>

      <AdminSection
        title="مدة العرض"
        description="اترك التاريخ فارغاً إذا تريد العرض يبقى مفتوحاً بدون بداية أو نهاية محددة."
      >
        <Field label="تاريخ البداية">
          <Input
            name="startsAt"
            type="date"
            defaultValue={dateInputValue(
              row?.startsAt
            )}
          />
        </Field>

        <Field label="تاريخ النهاية">
          <Input
            name="endsAt"
            type="date"
            defaultValue={dateInputValue(
              row?.endsAt
            )}
          />
        </Field>
      </AdminSection>

      <AdminSection
        title="الصورة"
        description="ارفع صورة العرض من الجهاز أو ضع رابط صورة جاهز."
      >
        <ImageUploadField
          value={imageUrl}
          onChange={setImageUrl}
          onUploadingChange={
            setIsImageUploading
          }
        />
      </AdminSection>

      <AdminSection
        title="الوصف"
        description="اكتب تفاصيل مختصرة وواضحة عن العرض."
      >
        <div className="md:col-span-2 xl:col-span-3">
          <Field label="الوصف">
            <Textarea
              name="description"
              defaultValue={
                row?.description ?? ""
              }
              placeholder="تفاصيل العرض، الشروط، أو الخدمات المشمولة..."
            />
          </Field>
        </div>
      </AdminSection>

      <Button
        type="submit"
        disabled={isImageUploading}
        variant={
          isEdit ? "secondary" : undefined
        }
        className="md:col-span-2 xl:col-span-3"
      >
        {isImageUploading
          ? "انتظر حتى يكتمل رفع الصورة..."
          : submit}
      </Button>
    </form>
  );
}
