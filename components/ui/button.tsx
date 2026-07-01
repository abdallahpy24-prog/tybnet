import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  const variants = {
    primary: "bg-gradient-to-l from-primary to-primary-dark text-white shadow-sm hover:brightness-105",
    secondary: "border border-borderSoft bg-white text-navy hover:bg-primary-soft",
    ghost: "bg-transparent text-navy hover:bg-primary-soft",
    danger: "bg-red-50 text-red-700 hover:bg-red-100"
  };
  return (
    <button
      className={cn(
        "focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
