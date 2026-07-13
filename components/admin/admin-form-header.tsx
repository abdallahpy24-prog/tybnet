import Link from "next/link";
import { ArrowRight } from "lucide-react";

type AdminFormHeaderProps = {
  title: string;
  backHref: string;
  backLabel: string;
};

export function AdminFormHeader({
  title,
  backHref,
  backLabel
}: AdminFormHeaderProps) {
  return (
    <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <Link
          href={backHref}
          className="mb-2 inline-flex items-center gap-1 text-sm font-bold text-primary-dark hover:underline"
        >
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
          {backLabel}
        </Link>

        <h1 className="text-2xl font-black text-navy md:text-3xl">
          {title}
        </h1>
      </div>
    </header>
  );
}
