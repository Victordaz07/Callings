import type { InputHTMLAttributes } from "react";

export function TextField({
  label,
  error,
  className = "",
  wrapperClassName = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  wrapperClassName?: string;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${wrapperClassName}`}>
      <span
        className={`text-xs font-bold ${error ? "text-rojo" : "text-muted-2"}`}
      >
        {label}
      </span>
      <input
        {...props}
        className={`h-[52px] rounded-xl border-[1.5px] bg-white px-3.5 text-base text-ink placeholder:text-muted focus:outline-none focus:ring-[3px] ${
          error
            ? "border-rojo focus:ring-rojo/15"
            : "border-line-card focus:border-living-teal focus:ring-living-teal/15"
        } ${className}`}
      />
      {error ? <span className="text-xs font-semibold text-rojo">{error}</span> : null}
    </label>
  );
}
