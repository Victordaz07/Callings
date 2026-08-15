"use client";

import { useState, type ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import type { Lang } from "@/lib/secretario/types";
import { fmtDate } from "@/lib/secretario/format";

export function ListHeader({
  title,
  subtitle,
  trashCount,
  trashOpen,
  onToggleTrash,
}: {
  title: string;
  subtitle: string;
  trashCount: number;
  trashOpen: boolean;
  onToggleTrash: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-2.5">
      <div>
        <h2 className="font-display text-lg font-semibold text-deep-water">{title}</h2>
        <p className="mt-0.5 text-[13px] text-muted-2">{subtitle}</p>
      </div>
      <button
        type="button"
        onClick={onToggleTrash}
        className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] border border-line-card text-base ${
          trashOpen ? "bg-linen" : "bg-white"
        }`}
      >
        🗑️
        {trashCount > 0 ? (
          <span className="absolute -top-1.5 -right-1.5 rounded-full bg-rojo px-[5px] py-px text-[10px] font-bold text-white">
            {trashCount}
          </span>
        ) : null}
      </button>
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="py-2.5 text-sm text-muted italic">{children}</div>;
}

export function TrashCard({
  open,
  title,
  emptyText,
  children,
}: {
  open: boolean;
  title: string;
  emptyText: string;
  children: ReactNode;
  hasItems?: boolean;
}) {
  if (!open) return null;
  return (
    <Card className="mt-3 p-4">
      <h2 className="text-sm font-semibold text-deep-water">🗑️ {title}</h2>
      {children || <EmptyState>{emptyText}</EmptyState>}
    </Card>
  );
}

export function HistoryToggle<T extends { at: string }>({
  count,
  label,
  versionOfLabel,
  lang,
  entries,
  render,
  forceShow = false,
  emptyLabel,
}: {
  count: number;
  label: string;
  versionOfLabel: string;
  lang: Lang;
  entries: T[];
  render: (entry: T) => ReactNode;
  forceShow?: boolean;
  emptyLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  if (count === 0 && !forceShow) return null;
  return (
    <div className="mt-1.5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-xs font-bold text-water-mid"
      >
        {label} ({count})
      </button>
      {open ? (
        <div className="mt-1.5">
          {entries.length === 0 && emptyLabel ? (
            <div className="py-1.5 text-[13px] text-muted italic">{emptyLabel}</div>
          ) : null}
          {entries
            .slice()
            .reverse()
            .map((v, idx) => (
              <div key={idx} className="border-t border-dashed border-line-card py-1.5 text-[13px]">
                {versionOfLabel && v.at ? (
                  <div className="mb-0.5 text-[11px] text-muted">
                    {versionOfLabel} {fmtDate(v.at, lang)}
                  </div>
                ) : null}
                <div className="text-muted-2">{render(v)}</div>
              </div>
            ))}
        </div>
      ) : null}
    </div>
  );
}

export function RowActionButtons({
  deleted,
  onEdit,
  onDelete,
  onRestore,
  editLabel,
  deleteLabel,
  restoreLabel,
}: {
  deleted: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onRestore?: () => void;
  editLabel: string;
  deleteLabel: string;
  restoreLabel: string;
}) {
  if (deleted) {
    return (
      <button
        type="button"
        title={restoreLabel}
        onClick={onRestore}
        className="flex h-9 w-9 items-center justify-center rounded-[9px] border border-line-card bg-white text-water-mid"
      >
        ↺
      </button>
    );
  }
  return (
    <div className="flex gap-1.5">
      <button
        type="button"
        title={editLabel}
        onClick={onEdit}
        className="flex h-9 w-9 items-center justify-center rounded-[9px] border border-line-card bg-white text-water-mid"
      >
        ✏️
      </button>
      <button
        type="button"
        title={deleteLabel}
        onClick={onDelete}
        className="flex h-9 w-9 items-center justify-center rounded-[9px] border border-line-card bg-white text-rojo"
      >
        🗑️
      </button>
    </div>
  );
}

export function MetaLine({ bits }: { bits: string[] }) {
  if (bits.length === 0) return null;
  return <div className="mt-1.5 text-[11px] text-muted">{bits.join(" · ")}</div>;
}

export function Badge({
  tone,
  onClick,
  children,
}: {
  tone: "done" | "pending" | "overdue" | "progress" | "draft";
  onClick?: () => void;
  children: ReactNode;
}) {
  const toneClasses: Record<typeof tone, string> = {
    done: "bg-badge-done-bg text-badge-done-text",
    pending: "bg-badge-pending-bg text-badge-pending-text",
    overdue: "bg-badge-overdue-bg text-badge-overdue-text",
    progress: "bg-badge-progress-bg text-badge-progress-text",
    draft: "bg-badge-draft-bg text-badge-draft-text",
  };
  return (
    <span
      onClick={onClick}
      className={`whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[11.5px] font-bold tracking-[0.06em] uppercase ${toneClasses[tone]} ${onClick ? "cursor-pointer" : ""}`}
    >
      {children}
    </span>
  );
}

export function FieldRow({ children }: { children: ReactNode }) {
  return <div className="mt-3 flex flex-wrap gap-2">{children}</div>;
}

export function TextInput(
  props: React.InputHTMLAttributes<HTMLInputElement>
) {
  return (
    <input
      {...props}
      className={`min-w-[120px] flex-1 rounded-[7px] border border-line-card bg-linen px-2.5 py-2.5 text-sm text-ink placeholder:text-muted focus:border-living-teal focus:bg-white focus:outline-none ${props.className ?? ""}`}
    />
  );
}

export function ListRow({
  title,
  strikeTitle,
  subtitle,
  meta,
  right,
  faded,
}: {
  title: string;
  strikeTitle?: boolean;
  subtitle: string;
  meta?: ReactNode;
  right?: ReactNode;
  faded?: boolean;
}) {
  return (
    <div
      className={`mb-2 rounded-[6px] border-l-[3px] border-dawn-coral bg-linen px-[11px] py-[9px] text-sm ${faded ? "opacity-55" : ""}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className={`font-bold text-deep-water ${strikeTitle ? "line-through" : ""}`}>
            {title}
          </div>
          <div className="mt-0.5 text-water-mid">{subtitle}</div>
          {meta}
        </div>
        {right}
      </div>
    </div>
  );
}
