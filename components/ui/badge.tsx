import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("inline-flex items-center rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary-dark", className)}
      {...props}
    />
  );
}
