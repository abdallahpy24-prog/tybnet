import type { ReactNode } from "react";
import {
  Globe2,
  ImageIcon,
  LayoutTemplate,
  MessageCircle,
  Save,
  Share2
} from "lucide-react";

import { updateSettings } from "@/lib/actions/admin";
import { getSettingsMap } from "@/lib/settings";
import { FormShell } from "@/components/admin/form-shell";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import {
  Field,
  Input,
  Textarea
} from "@/components/ui/input";

type SettingsSectionProps = {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
};

function SettingsSection({
  icon,
  title,
  description,
  children
}: SettingsSectionProps) {
  return (
    <section className="rounded-2xl border border-borderSoft bg-slate-50 p-4 md:p-5">
      <div className="mb-4 flex items-start gap-3 border-b border-borderSoft pb-4">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary-dark">
          {icon}
        </div>

        <div>
          <h2 className="text-base font-black text-navy">
            {title}
          </h2>
          <p className="mt-1 text-xs font-bold leading-5 text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {children}
      </div>
    </section>
  );
}

export default async function SettingsPage() {
  const settings = await getSettingsMap();

  return (
    <div className="space-y-6">
      <PageHeader
        title="إعدادات الموقع"
        description="إدارة هوية طب نت وواجهة البداية وروابط التواصل من صفحة واحدة."
      />

      <FormShell title="الإعدادات العامة">
        <form action={updateSettings} className="space-y-5">
          <SettingsSection
            icon={<Globe2 className="h-5 w-5" aria-hidden="true" />}
            title="هوية الموقع"
            description="اسم المنصة والشعار المستخدمان في واجهات الموقع."
          >
            <Field label="اسم الموقع بالعربي">
              <Input
                name="siteNameAr"
                required
                maxLength={80}
                defaultValue={settings.siteNameAr ?? "طب نت"}
              />
            </Field>

            <Field label="اسم الموقع بالإنكليزي">
              <Input
                name="siteNameEn"
                required
                maxLength={80}
                defaultValue={settings.siteNameEn ?? "TybNet"}
                className="ltr"
              />
            </Field>

            <div className="md:col-span-2">
              <Field label="رابط الشعار">
                <div className="relative">
                  <ImageIcon
                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <Input
                    name="logoUrl"
                    required
                    maxLength={2048}
                    defaultValue={
                      settings.logoUrl ?? "/assets/logo.png"
                    }
                    placeholder="/assets/logo.png"
                    className="ltr pr-10"
                  />
                </div>
              </Field>

              <p className="mt-2 text-xs font-bold leading-5 text-slate-500">
                يقبل مساراً داخلياً مثل /assets/logo.png أو رابط صورة كاملاً.
              </p>
            </div>
          </SettingsSection>

          <SettingsSection
            icon={
              <LayoutTemplate className="h-5 w-5" aria-hidden="true" />
            }
            title="واجهة البداية"
            description="العنوان والوصف الظاهران في الجزء الرئيسي من الصفحة."
          >
            <div className="md:col-span-2">
              <Field label="عنوان الواجهة الرئيسية">
                <Input
                  name="heroTitle"
                  required
                  maxLength={160}
                  defaultValue={
                    settings.heroTitle ?? "مرحباً بك في طب نت"
                  }
                />
              </Field>
            </div>

            <div className="md:col-span-2">
              <Field label="وصف الواجهة الرئيسية">
                <Textarea
                  name="heroDescription"
                  maxLength={600}
                  defaultValue={settings.heroDescription ?? ""}
                  placeholder="اكتب وصفاً مختصراً وواضحاً عن خدمات طب نت..."
                />
              </Field>
            </div>
          </SettingsSection>

          <SettingsSection
            icon={<Share2 className="h-5 w-5" aria-hidden="true" />}
            title="التواصل"
            description="روابط التواصل العامة التي تظهر للزوار. اترك أي رابط فارغاً إذا لم تستخدمه."
          >
            <Field label="واتساب الدعم">
              <div className="relative">
                <MessageCircle
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <Input
                  name="supportWhatsapp"
                  type="tel"
                  maxLength={32}
                  defaultValue={settings.supportWhatsapp ?? ""}
                  placeholder="9647XXXXXXXXX"
                  className="ltr pr-10"
                />
              </div>
            </Field>

            <Field label="رابط فيسبوك">
              <Input
                name="facebookUrl"
                type="url"
                maxLength={2048}
                defaultValue={settings.facebookUrl ?? ""}
                placeholder="https://facebook.com/..."
                className="ltr"
              />
            </Field>

            <div className="md:col-span-2">
              <Field label="رابط إنستغرام">
                <Input
                  name="instagramUrl"
                  type="url"
                  maxLength={2048}
                  defaultValue={settings.instagramUrl ?? ""}
                  placeholder="https://instagram.com/..."
                  className="ltr"
                />
              </Field>
            </div>
          </SettingsSection>

          <Button type="submit" className="w-full">
            <Save className="h-4 w-4" aria-hidden="true" />
            حفظ جميع الإعدادات
          </Button>
        </form>
      </FormShell>
    </div>
  );
}
