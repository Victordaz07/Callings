import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[20px] border border-line-card bg-white ${className}`}
    >
      {children}
    </div>
  );
}

export function CardRows({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`divide-y divide-divider px-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardRow({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex min-h-11 items-center gap-3 py-3 ${className}`}>
      {children}
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span className="px-0.5 text-xs font-bold tracking-[0.14em] text-muted-2 uppercase">
      {children}
    </span>
  );
}
