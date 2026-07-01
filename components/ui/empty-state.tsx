import { SearchX } from "lucide-react";
import { Card } from "@/components/ui/card";

export function EmptyState({ title = "لا توجد نتائج مطابقة حالياً", description }: { title?: string; description?: string }) {
  return (
    <Card className="flex min-h-52 flex-col items-center justify-center text-center">
      <SearchX className="mb-4 h-10 w-10 text-primary" aria-hidden="true" />
      <h3 className="text-lg font-black text-navy">{title}</h3>
      {description ? <p className="mt-2 max-w-md text-sm leading-7 text-slate-600">{description}</p> : null}
    </Card>
  );
}
