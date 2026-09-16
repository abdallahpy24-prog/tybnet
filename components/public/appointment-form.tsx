"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CalendarPlus, Copy, ExternalLink } from "lucide-react";

import { Button, buttonStyles } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import {
  createAppointment,
  type AppointmentActionState
} from "@/lib/actions/appointment";

export function AppointmentForm({ providerId }: { providerId: string }) {
  const [state, formAction, pending] = useActionState<
    AppointmentActionState | null,
    FormData
  >(createAppointment, null);
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState({ patientName: "", patientPhone: "", preferredDate: "", note: "" });
  const [consent, setConsent] = useState(false);
  const [edited, setEdited] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const visibleState = !edited && !pending ? state : null;

  useEffect(() => {
    if (state && !state.ok && !pending) {
      formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    }
  }, [pending, state]);

  function updateField(name: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
    setEdited(true);
    setCopyStatus("");
  }

  async function copyMessage() {
    if (!state?.whatsappMessage) return;

    try {
      await navigator.clipboard.writeText(state.whatsappMessage);
      setCopyStatus("تم نسخ الرسالة.");
    } catch {
      setCopyStatus("تعذر النسخ. يمكنك فتح واتساب لإرسال الرسالة مباشرة.");
    }
  }

  return (
    <form ref={formRef} action={formAction} onSubmit={() => { setEdited(false); setCopyStatus(""); }} className="grid gap-4" noValidate aria-busy={pending}>
      <input type="hidden" name="providerId" value={providerId} />

      <Field label="اسم المراجع">
        <Input
          name="patientName"
          value={values.patientName}
          onChange={(event) => updateField("patientName", event.target.value)}
          maxLength={120}
          disabled={pending}
          required
          autoComplete="name"
          placeholder="اكتب الاسم الكامل"
          aria-invalid={Boolean(visibleState?.fieldErrors?.patientName)}
          aria-describedby={visibleState?.fieldErrors?.patientName ? "patientName-error" : undefined}
        />
        {visibleState?.fieldErrors?.patientName ? (
          <span id="patientName-error" className="text-xs font-bold text-red-700">
            {visibleState.fieldErrors.patientName}
          </span>
        ) : null}
      </Field>

      <Field label="رقم الهاتف">
        <Input
          name="patientPhone"
          value={values.patientPhone}
          onChange={(event) => updateField("patientPhone", event.target.value)}
          maxLength={32}
          disabled={pending}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          dir="ltr"
          required
          placeholder="07xxxxxxxxx"
          aria-invalid={Boolean(visibleState?.fieldErrors?.patientPhone)}
          aria-describedby={visibleState?.fieldErrors?.patientPhone ? "patientPhone-error" : undefined}
        />
        {visibleState?.fieldErrors?.patientPhone ? (
          <span id="patientPhone-error" className="text-xs font-bold text-red-700">
            {visibleState.fieldErrors.patientPhone}
          </span>
        ) : null}
      </Field>

      <Field label="الموعد المفضل (اختياري)">
        <Input
          name="preferredDate"
          value={values.preferredDate}
          onChange={(event) => updateField("preferredDate", event.target.value)}
          maxLength={120}
          disabled={pending}
          type="text"
          placeholder="مثال: الأحد بعد 5 مساءً"
          aria-invalid={Boolean(visibleState?.fieldErrors?.preferredDate)}
          aria-describedby={visibleState?.fieldErrors?.preferredDate ? "preferredDate-error" : undefined}
        />
        {visibleState?.fieldErrors?.preferredDate ? (
          <span id="preferredDate-error" className="text-xs font-bold text-red-700">
            {visibleState.fieldErrors.preferredDate}
          </span>
        ) : null}
      </Field>

      <Field label="ملاحظة اختيارية">
        <Textarea
          name="note"
          value={values.note}
          onChange={(event) => updateField("note", event.target.value)}
          maxLength={1000}
          disabled={pending}
          placeholder="ملاحظة قصيرة تساعد العيادة على متابعة الطلب، بدون معلومات طبية حساسة"
          aria-invalid={Boolean(visibleState?.fieldErrors?.note)}
          aria-describedby={visibleState?.fieldErrors?.note ? "note-error" : undefined}
        />
        {visibleState?.fieldErrors?.note ? (
          <span id="note-error" className="text-xs font-bold text-red-700">
            {visibleState.fieldErrors.note}
          </span>
        ) : null}
      </Field>

      <div>
        <label className="flex gap-3 rounded-2xl border border-borderSoft bg-surface p-4 text-sm leading-7 text-slate-600">
          <input
            type="checkbox"
            name="privacyConsent"
            value="yes"
            checked={consent}
            disabled={pending}
            onChange={(event) => { setConsent(event.target.checked); setEdited(true); }}
            required
            className="mt-1 h-4 w-4 shrink-0 accent-primary"
            aria-invalid={Boolean(visibleState?.fieldErrors?.privacyConsent)}
            aria-describedby={visibleState?.fieldErrors?.privacyConsent ? "privacyConsent-error" : undefined}
          />
          <span>
            أوافق على حفظ بيانات الطلب داخل طب نت لأغراض المتابعة وتجهيزها في رسالة تُفتح عبر واتساب،
            وقرأت{" "}
            <Link
              href="/privacy"
              className="font-black text-primary-dark hover:text-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              سياسة الخصوصية
            </Link>
            .
          </span>
        </label>
        {visibleState?.fieldErrors?.privacyConsent ? (
          <p id="privacyConsent-error" className="mt-2 text-xs font-bold text-red-700">
            {visibleState.fieldErrors.privacyConsent}
          </p>
        ) : null}
      </div>

      <p className="rounded-2xl bg-primary-soft p-3 text-xs leading-6 text-slate-700">
        طلب الموعد عبر واتساب لا يعني تأكيد الموعد. يصبح الموعد مؤكداً فقط بعد رد العيادة عليك.
        للحالات الطارئة راجع أقرب قسم طوارئ.
      </p>

      {visibleState?.message ? (
        <div
          role={visibleState.ok ? "status" : "alert"}
          aria-live="polite"
          className={
            visibleState.ok
              ? "rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold leading-7 text-emerald-900"
              : "rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold leading-7 text-red-800"
          }
        >
          {visibleState.message}
        </div>
      ) : null}

      {visibleState?.ok && visibleState.whatsappUrl ? (
        <div className="grid gap-2 sm:grid-cols-2">
          <a
            href={visibleState.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonStyles({ className: "w-full" })}
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            افتح واتساب
          </a>
          <Button type="button" variant="secondary" onClick={() => void copyMessage()}>
            <Copy className="h-4 w-4" aria-hidden="true" />
            نسخ الرسالة
          </Button>
        </div>
      ) : (
        <Button type="submit" disabled={pending}>
          <CalendarPlus className="h-4 w-4" aria-hidden="true" />
          {pending ? "جاري تجهيز طلب الموعد..." : "جهّز طلب الموعد عبر واتساب"}
        </Button>
      )}
      {copyStatus ? <p role="status" className="text-sm text-slate-600">{copyStatus}</p> : null}
    </form>
  );
}
