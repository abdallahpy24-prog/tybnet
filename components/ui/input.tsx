import { cn } from "@/lib/utils";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "focus-ring h-11 w-full rounded-xl border border-borderSoft bg-white px-3.5 text-sm text-navy shadow-[inset_0_1px_0_rgba(15,35,64,0.02)] transition placeholder:text-slate-500 hover:border-slate-300",
        props.className
      )}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "focus-ring h-11 w-full rounded-xl border border-borderSoft bg-white px-3.5 text-sm text-navy transition hover:border-slate-300 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400",
        props.className
      )}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "focus-ring min-h-24 w-full rounded-xl border border-borderSoft bg-white px-3.5 py-3 text-sm text-navy transition placeholder:text-slate-500 hover:border-slate-300",
        props.className
      )}
    />
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-navy">
      <span>{label}</span>
      {children}
    </label>
  );
}
