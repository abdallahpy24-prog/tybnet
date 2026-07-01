"use client";

import { useActionState } from "react";
import Link from "next/link";
import { CalendarPlus } from "lucide-react";
import { createAppointment } from "@/lib/actions/appointment";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";

export function AppointmentForm({ providerId }: { providerId: string }) {
  const [state, formAction, pending] = useActionState(createAppointment, null);

  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="providerId" value={providerId} />

      <Field label="اسم المراجع">
        <Input name="patientName" required placeholder="اكتب الاسم الكامل" />
      </Field>

      <Field label="رقم الهاتف">
        <Input name="patientPhone" required placeholder="مثال: 07xxxxxxxxx" />
      </Field>

      <Field label="الموعد المفضل">
        <Input name="preferredDate" type="datetime-local" />
      </Field>

      <Field label="ملاحظة اختيارية">
        <Textarea
          name="note"
          placeholder="اكتب ملاحظة مختصرة تساعد على متابعة الطلب، بدون تفاصيل طبية حساسة"
        />
      </Field>

      <label className="flex gap-3 rounded-2xl border border-borderSoft bg-surface p-4 text-sm leading-7 text-slate-600">
        <input
          type="checkbox"
          name="privacyConsent"
          value="yes"
          required
          className="mt-1 h-4 w-4 shrink-0 accent-primary"
        />
        <span>
          أوافق على استخدام بياناتي لغرض متابعة طلب الموعد والتواصل معي، وأؤكد
          أنني قرأت{" "}
          <Link
            href="/privacy"
            className="font-black text-primary-dark hover:text-primary"
            target="_blank"
          >
            سياسة الخصوصية
          </Link>
          .
        </span>
      </label>

      <p className="rounded-2xl bg-primary-soft p-3 text-xs leading-6 text-slate-600">
        ملاحظة: إرسال الطلب لا يعني تأكيد الموعد نهائياً إلا بعد التواصل معك.
        للحالات الطارئة، يرجى مراجعة أقرب طوارئ فوراً.
      </p>

      {state?.message ? (
        <p
          className={
            state.ok
              ? "text-sm font-bold text-primary-dark"
              : "text-sm font-bold text-red-600"
          }
        >
          {state.message}
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        <CalendarPlus className="h-4 w-4" aria-hidden="true" />
        {pending ? "جاري إرسال الطلب" : "إرسال طلب الموعد"}
      </Button>
    </form>
  );
}