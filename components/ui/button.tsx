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
      "bg-primary-dark text-white shadow-sm hover:bg-[#066b79] active:bg-[#055d69]",
    secondary:
      "border border-borderSoft bg-white text-navy hover:border-primary/40 hover:bg-primary-soft",
    ghost: "bg-transparent text-navy hover:bg-primary-soft",
    danger: "bg-red-50 text-red-700 hover:bg-red-100"
  };

  return cn(
    "focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50",
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
