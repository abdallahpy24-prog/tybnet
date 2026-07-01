import { Card } from "@/components/ui/card";

export function FormShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="mb-6">
      <h2 className="mb-4 text-lg font-black text-navy">{title}</h2>
      {children}
    </Card>
  );
}
