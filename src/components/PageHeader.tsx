import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  children,
  tone = "deep-water",
}: {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  tone?: "deep-water" | "water-mid";
}) {
  return (
    <header
      className={`px-[22px] pt-3.5 pb-[18px] text-linen ${
        tone === "deep-water" ? "bg-deep-water" : "bg-water-mid"
      }`}
    >
      <h1 className="font-display text-[26px] font-medium">{title}</h1>
      {subtitle ? (
        <p className="mt-1 text-[13.5px] text-mist/90">{subtitle}</p>
      ) : null}
      {children}
    </header>
  );
}
