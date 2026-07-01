"use client";

import { useActionState } from "react";
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
      {state?.message ? <p className={state.ok ? "text-sm font-bold text-primary-dark" : "text-sm font-bold text-red-600"}>{state.message}</p> : null}
      <Button type="submit" disabled={pending}>
        <CalendarPlus className="h-4 w-4" aria-hidden="true" />
        {pending ? "جاري الإرسال" : "إرسال طلب موعد"}
      </Button>
    </form>
  );
}
