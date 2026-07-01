import { Badge } from "@/components/ui/badge";

export function StatusPill({ value }: { value: string | boolean }) {
  const label = typeof value === "boolean" ? (value ? "نشط" : "معطل") : value;
  const active = label === "ACTIVE" || label === "نشط" || label === "NEW";
  return <Badge className={active ? undefined : "bg-slate-100 text-slate-600"}>{label}</Badge>;
}
