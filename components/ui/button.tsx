import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export function buttonStyles({
  variant = "primary",
  className
}: {
  variant?: ButtonVariant;
  className?: string;
} = {}) {
  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-primary-dark text-white shadow-[0_8px_24px_rgba(6,96,110,0.18)] hover:-translate-y-0.5 hover:bg-[#055966] hover:shadow-[0_12px_28px_rgba(6,96,110,0.23)] active:translate-y-0 active:bg-[#044f5a]",
    secondary:
      "border border-borderSoft bg-white text-navy shadow-sm hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary-soft",
    ghost: "bg-transparent text-navy hover:bg-primary-soft",
    danger: "bg-red-50 text-red-700 hover:bg-red-100"
  };

  return cn(
    "focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-bold leading-6 transition duration-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0",
    variants[variant],
    className
  );
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonStyles({ variant, className })}
      {...props}
    />
  );
}
