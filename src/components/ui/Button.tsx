import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "accent" | "secondary";

const variantClasses: Record<Variant, string> = {
  primary: "bg-deep-water text-linen",
  accent: "bg-dawn-coral text-white",
  secondary: "border-[1.5px] border-line-card bg-white text-deep-water",
};

export function Button({
  variant = "primary",
  className = "",
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      {...props}
      disabled={disabled}
      className={`h-12 rounded-xl px-6 text-[15px] font-bold transition-opacity active:opacity-80 disabled:cursor-not-allowed disabled:bg-mist disabled:text-muted ${
        disabled ? "" : variantClasses[variant]
      } ${className}`}
    />
  );
}
