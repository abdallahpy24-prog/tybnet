import { cn } from "@/lib/utils";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-borderSoft bg-white p-5 shadow-card",
        className
      )}
      {...props}
    />
  );
}

type HeadingLevel = "h1" | "h2" | "h3";

export function SectionTitle({
  eyebrow,
  title,
  description,
  as = "h2"
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  as?: HeadingLevel;
}) {
  const Heading = as;

  return (
    <div className="mb-6">
      {eyebrow ? (
        <p className="mb-2 text-sm font-bold text-primary-dark">
          {eyebrow}
        </p>
      ) : null}
      <Heading className="text-2xl font-black text-navy md:text-3xl">
        {title}
      </Heading>
      {description ? (
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
          {description}
        </p>
      ) : null}
    </div>
  );
}
