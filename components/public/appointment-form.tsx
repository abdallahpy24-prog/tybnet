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

      <Field label="اسم المريض">
        <Input name="patientName" required placeholder="الاسم الكامل" />
      </Field>

      <Field label="رقم الهاتف">
        <Input name="patientPhone" required placeholder="07xxxxxxxxx" />
      </Field>

      <Field label="التاريخ المفضل">
        <Input name="preferredDate" type="datetime-local" />
      </Field>

      <Field label="ملاحظة">
        <Textarea name="note" placeholder="اكتب ملاحظة قصيرة إن وجدت" />
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
          أوافق على استخدام بياناتي لغرض التواصل وترتيب طلب الموعد، وأؤكد أنني
          قرأت{" "}
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
        تنبيه: لا ترسل معلومات طبية حساسة أو تفاصيل طارئة من خلال هذا النموذج.
        في الحالات الطارئة، راجع أقرب طوارئ فوراً.
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
        {pending ? "جاري الإرسال" : "إرسال طلب موعد"}
      </Button>
    </form>
  );
}