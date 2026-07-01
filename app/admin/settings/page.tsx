import { updateSettings } from "@/lib/actions/admin";
import { getSettingsMap } from "@/lib/settings";
import { PageHeader } from "@/components/admin/page-header";
import { FormShell } from "@/components/admin/form-shell";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";

export default async function SettingsPage() {
  const settings = await getSettingsMap();
  return (
    <>
      <PageHeader title="إعدادات الموقع" description="تغيير اسم الموقع، الشعار، نص Hero، وروابط التواصل بدون فتح الكود." />
      <FormShell title="إعدادات عامة">
        <form action={updateSettings} className="grid gap-4 md:grid-cols-2">
          <Field label="اسم الموقع عربي"><Input name="siteNameAr" defaultValue={settings.siteNameAr ?? "طب نت"} /></Field>
          <Field label="اسم الموقع إنكليزي"><Input name="siteNameEn" defaultValue={settings.siteNameEn ?? "TibNet"} /></Field>
          <Field label="عنوان Hero"><Input name="heroTitle" defaultValue={settings.heroTitle ?? "مرحباً بك في طب نت"} /></Field>
          <Field label="رابط الشعار"><Input name="logoUrl" defaultValue={settings.logoUrl ?? "/assets/logo.png"} className="ltr" /></Field>
          <Field label="واتساب الدعم"><Input name="supportWhatsapp" defaultValue={settings.supportWhatsapp ?? ""} /></Field>
          <Field label="فيسبوك"><Input name="facebookUrl" defaultValue={settings.facebookUrl ?? ""} className="ltr" /></Field>
          <Field label="إنستغرام"><Input name="instagramUrl" defaultValue={settings.instagramUrl ?? ""} className="ltr" /></Field>
          <Field label="وصف Hero"><Textarea name="heroDescription" defaultValue={settings.heroDescription ?? ""} /></Field>
          <Button type="submit" className="md:col-span-2">حفظ الإعدادات</Button>
        </form>
      </FormShell>
    </>
  );
}
