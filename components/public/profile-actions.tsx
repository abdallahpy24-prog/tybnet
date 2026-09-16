"use client";

import { useId, useRef, useState } from "react";
import { Flag, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Select, Textarea } from "@/components/ui/input";

type EntityType = "PROVIDER" | "PHARMACY" | "LAB" | "COSMETIC_CENTER";

type ProfileActionsProps = {
  entityType: EntityType;
  entityId: string;
  entitySlug: string;
  entityName: string;
};

const issueOptions = [
  ["PHONE", "رقم الهاتف"],
  ["ADDRESS", "العنوان"],
  ["WORKING_HOURS", "أوقات الدوام"],
  ["SPECIALTY_SERVICES", "الاختصاص أو الخدمات"],
  ["MAP_LOCATION", "موقع الخريطة"],
  ["CLOSED_OR_UNAVAILABLE", "العيادة أو الجهة مغلقة/غير متاحة"],
  ["OTHER", "معلومة أخرى"]
] as const;

export function ProfileActions({
  entityType,
  entityId,
  entitySlug,
  entityName
}: ProfileActionsProps) {
  const reportId = useId();
  const sendingRef = useRef(false);
  const [issueType, setIssueType] = useState("PHONE");
  const [reportOpen, setReportOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageOk, setMessageOk] = useState(false);

  async function shareProfile() {
    const url = `${window.location.origin}${window.location.pathname}`;

    try {
      if (navigator.share) {
        await navigator.share({ title: entityName, url });
        return;
      }

      await navigator.clipboard.writeText(url);
      setMessageOk(true);
      setMessage("تم نسخ رابط الملف.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setMessageOk(false);
      setMessage("تعذرت المشاركة أو نسخ الرابط. يمكنك نسخه من شريط العنوان.");
    }
  }

  async function submitReport(formData: FormData) {
    if (sendingRef.current) return;
    sendingRef.current = true;
    setPending(true);
    setMessage(null);

    try {
      const issueType = String(formData.get("issueType") || "OTHER");
      const details = String(formData.get("details") || "").trim();

      const response = await fetch("/api/mobile/information-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType,
          entityId,
          entitySlug,
          entityName,
          issueType,
          details: details || null
        })
      });
      const result = (await response.json().catch(() => null)) as
        | { ok?: boolean; message?: string; reportId?: string }
        | null;

      if (!response.ok || !result?.ok) {
        throw new Error(result?.message || "تعذر إرسال البلاغ حالياً.");
      }

      setMessageOk(true);
      setMessage(
        result.reportId
          ? `${result.message} — رقم المتابعة: ${result.reportId}`
          : result.message || "تم استلام البلاغ."
      );
      setReportOpen(false);
    } catch (error) {
      setMessageOk(false);
      setMessage(error instanceof Error ? error.message : "تعذر إرسال البلاغ حالياً.");
    } finally {
      sendingRef.current = false;
      setPending(false);
    }
  }

  return (
    <div className="mt-5 border-t border-borderSoft pt-5">
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" onClick={() => void shareProfile()}>
          <Share2 className="h-4 w-4" aria-hidden="true" />
          مشاركة الملف
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setReportOpen((current) => !current);
            setMessage(null);
          }}
          aria-expanded={reportOpen}
          aria-controls={reportId}
        >
          <Flag className="h-4 w-4" aria-hidden="true" />
          إبلاغ عن معلومة
        </Button>
      </div>

      {reportOpen ? (
        <form id={reportId} aria-busy={pending} action={submitReport} className="mt-4 grid gap-3 rounded-2xl border border-borderSoft bg-slate-50 p-4">
          <label className="grid gap-2 text-sm font-bold text-navy">
            ما المعلومة التي تحتاج مراجعة؟
            <Select name="issueType" value={issueType} disabled={pending} onChange={(event) => setIssueType(event.target.value)}>
              {issueOptions.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </label>

          <label className="grid gap-2 text-sm font-bold text-navy">
            التفاصيل (اختيارية إلا عند اختيار «معلومة أخرى»)
            <Textarea
              name="details"
              required={issueType === "OTHER"}
              disabled={pending}
              maxLength={700}
              placeholder="اكتب التصحيح أو المعلومة التي تريد من فريق طب نت مراجعتها"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={pending}>
              {pending ? "جاري الإرسال..." : "إرسال البلاغ"}
            </Button>
            <Button type="button" variant="ghost" disabled={pending} onClick={() => setReportOpen(false)}>
              إلغاء
            </Button>
          </div>
        </form>
      ) : null}

      {message ? (
        <p
          className={
            messageOk
              ? "mt-3 text-sm font-bold text-emerald-800"
              : "mt-3 text-sm font-bold text-red-700"
          }
          role={messageOk ? "status" : "alert"}
          aria-live="polite"
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
