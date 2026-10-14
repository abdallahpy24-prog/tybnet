import { cn } from "@/lib/utils";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-borderSoft bg-white p-5 shadow-card",
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
    <div className="mb-7 rounded-[28px] border border-borderSoft bg-white p-6 shadow-[0_14px_42px_rgba(15,35,64,0.045)] md:p-8">
      {eyebrow ? (
        <p className="mb-2 text-sm font-black text-primary-dark">
          {eyebrow}
        </p>
      ) : null}
      <Heading className="text-balance text-2xl font-black leading-tight text-navy md:text-4xl">
        {title}
      </Heading>
      {description ? (
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 md:text-base md:leading-8">
          {description}
        </p>
      ) : null}
    </div>
  );
}
