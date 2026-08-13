"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { useSecretarioStore } from "@/lib/secretario/store";
import { useT, useLang } from "@/lib/secretario/useT";
import { daysSince, fmtDate } from "@/lib/secretario/format";
import * as actions from "@/lib/secretario/actions";
import type { Companerismo, Familia } from "@/lib/secretario/types";
import { EmptyState, ListHeader, TrashCard } from "./shared";

export function MinistracionPanel() {
  const t = useT();
  const lang = useLang();
  const data = useSecretarioStore((s) => s.data);
  const apply = useSecretarioStore((s) => s.apply);
  const showToast = useSecretarioStore((s) => s.showToast);
  const [names, setNames] = useState("");
  const [showTrash, setShowTrash] = useState(false);

  const deletedCount = data.ministracion.filter((c) => c.deleted).length;
  const entries = data.ministracion.map((c, i) => ({ c, i })).reverse();
  const active = entries.filter(({ c }) => !c.deleted);
  const trashed = entries.filter(({ c }) => c.deleted);

  return (
    <div className="flex flex-col gap-3">
      <Card className="p-4">
        <ListHeader
          title={t("minTitle")}
          subtitle={t("minSub")}
          trashCount={deletedCount}
          trashOpen={showTrash}
          onToggleTrash={() => setShowTrash((v) => !v)}
        />
        <div className="mt-3 rounded-[10px] border border-[#b9d4d0] bg-mist p-2.5 text-[13px] leading-relaxed text-water-mid">
          <b className="text-deep-water">LCR:</b> {t("minLcrNote")}
        </div>
        <div className="mt-3 flex gap-1.5">
          <input
            value={names}
            onChange={(e) => setNames(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && names.trim()) {
                apply((d) => actions.addComp(d, names));
                setNames("");
                showToast(t("compAdded"));
              }
            }}
            placeholder={t("compPh")}
            className="min-w-[120px] flex-1 rounded-[7px] border border-line-card bg-linen px-2.5 py-2.5 text-sm"
          />
          <button
            type="button"
            onClick={() => {
              if (!names.trim()) return;
              apply((d) => actions.addComp(d, names));
              setNames("");
              showToast(t("compAdded"));
            }}
            className="rounded-[7px] bg-living-teal px-4 text-lg text-white"
          >
            +
          </button>
        </div>
      </Card>

      <TrashCard open={showTrash} title={t("trash")} emptyText={t("noTrash")}>
        {trashed.map(({ c, i }) => (
          <CompCard
            key={i}
            c={c}
            i={i}
            lang={lang}
            t={t}
            onRestoreComp={() => {
              apply((d) => actions.restoreComp(d, i));
              showToast(t("restored"));
            }}
          />
        ))}
      </TrashCard>

      {active.length === 0 ? (
        <Card className="p-4">
          <EmptyState>{t("noComp")}</EmptyState>
        </Card>
      ) : (
        active.map(({ c, i }) => (
          <CompCard
            key={i}
            c={c}
            i={i}
            lang={lang}
            t={t}
            onDeleteComp={() => {
              apply((d) => actions.deleteComp(d, i));
              showToast(t("movedToTrash"));
            }}
            onUpdateNames={(v) => apply((d) => actions.updateCompNames(d, i, v))}
            onAddFamily={(family) => {
              apply((d) => actions.addFamily(d, i, family));
              showToast(t("famAdded"));
            }}
            onUpdateFamily={(fi, v) => apply((d) => actions.updateFamilyName(d, i, fi, v))}
            onVisit={(fi) => {
              apply((d) => actions.markFamilyVisited(d, i, fi));
              showToast(t("saved"));
            }}
            onDeleteFamily={(fi) => {
              apply((d) => actions.deleteFamily(d, i, fi));
              showToast(t("movedToTrash"));
            }}
            onRestoreFamily={(fi) => {
              apply((d) => actions.restoreFamily(d, i, fi));
              showToast(t("restored"));
            }}
          />
        ))
      )}
    </div>
  );
}

function CompCard({
  c,
  lang,
  t,
  onDeleteComp,
  onRestoreComp,
  onUpdateNames,
  onAddFamily,
  onUpdateFamily,
  onVisit,
  onDeleteFamily,
  onRestoreFamily,
}: {
  c: Companerismo;
  i: number;
  lang: ReturnType<typeof useLang>;
  t: ReturnType<typeof useT>;
  onDeleteComp?: () => void;
  onRestoreComp?: () => void;
  onUpdateNames?: (v: string) => void;
  onAddFamily?: (family: string) => void;
  onUpdateFamily?: (fi: number, v: string) => void;
  onVisit?: (fi: number) => void;
  onDeleteFamily?: (fi: number) => void;
  onRestoreFamily?: (fi: number) => void;
}) {
  const [names, setNames] = useState(c.names);
  const [famInput, setFamInput] = useState("");
  const [showFamTrash, setShowFamTrash] = useState(false);
  const activeFam = c.asignaciones.map((f, fi) => ({ f, fi })).filter(({ f }) => !f.deleted);
  const deletedFam = c.asignaciones.map((f, fi) => ({ f, fi })).filter(({ f }) => f.deleted);

  return (
    <Card className={`p-4 ${c.deleted ? "opacity-55" : ""}`}>
      <div className="flex items-start justify-between gap-2.5">
        <input
          value={names}
          disabled={c.deleted}
          onChange={(e) => setNames(e.target.value)}
          onBlur={() => onUpdateNames?.(names)}
          placeholder={t("compPh")}
          className="font-display flex-1 rounded-md bg-transparent py-1 text-base font-semibold text-deep-water focus:bg-linen focus:outline-none disabled:text-muted disabled:line-through"
        />
        {c.deleted ? (
          <button type="button" onClick={onRestoreComp} title={t("restoreMinuta")} className="flex h-9 w-9 items-center justify-center rounded-[9px] border border-line-card bg-white text-water-mid">
            ↺
          </button>
        ) : (
          <button type="button" onClick={onDeleteComp} title={t("deleteMinuta")} className="flex h-9 w-9 items-center justify-center rounded-[9px] border border-line-card bg-white text-rojo">
            🗑️
          </button>
        )}
      </div>
      {c.deleted && c.deletedAt ? (
        <div className="-mt-1 mb-2 text-xs text-rojo">
          {t("deletedTag")} · {fmtDate(c.deletedAt, lang)}
        </div>
      ) : null}

      {activeFam.length === 0 ? (
        <EmptyState>{t("noFamAssigned")}</EmptyState>
      ) : (
        activeFam.map(({ f, fi }) => (
          <FamiliaRow key={fi} f={f} lang={lang} t={t} onUpdate={(v) => onUpdateFamily?.(fi, v)} onVisit={() => onVisit?.(fi)} onDelete={() => onDeleteFamily?.(fi)} />
        ))
      )}

      {!c.deleted ? (
        <div className="mt-2.5 flex gap-1.5">
          <input
            value={famInput}
            onChange={(e) => setFamInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && famInput.trim()) {
                onAddFamily?.(famInput);
                setFamInput("");
              }
            }}
            placeholder={t("famPh")}
            className="min-w-[120px] flex-1 rounded-[7px] border border-line-card bg-linen px-2.5 py-2.5 text-sm"
          />
          <button
            type="button"
            onClick={() => {
              if (!famInput.trim()) return;
              onAddFamily?.(famInput);
              setFamInput("");
            }}
            className="rounded-[7px] bg-living-teal px-4 text-lg text-white"
          >
            +
          </button>
        </div>
      ) : null}

      {deletedFam.length > 0 ? (
        <div className="mt-2">
          <button type="button" onClick={() => setShowFamTrash((v) => !v)} className="text-xs font-bold text-water-mid">
            {t("viewRemovedFamilies")} ({deletedFam.length})
          </button>
          {showFamTrash
            ? deletedFam.map(({ f, fi }) => (
                <FamiliaRow key={fi} f={f} lang={lang} t={t} onRestore={() => onRestoreFamily?.(fi)} />
              ))
            : null}
        </div>
      ) : null}
    </Card>
  );
}

function FamiliaRow({
  f,
  lang,
  t,
  onUpdate,
  onVisit,
  onDelete,
  onRestore,
}: {
  f: Familia;
  lang: ReturnType<typeof useLang>;
  t: ReturnType<typeof useT>;
  onUpdate?: (v: string) => void;
  onVisit?: () => void;
  onDelete?: () => void;
  onRestore?: () => void;
}) {
  const [family, setFamily] = useState(f.family);
  const d = daysSince(f.lastContact);
  const alert = d !== null && d > 30;
  const label = f.lastContact ? `${fmtDate(f.lastContact, lang)} (${d} ${t("days")})` : t("never");

  return (
    <div className={`flex items-center gap-2.5 border-b border-dashed border-line-card py-2.5 last:border-b-0 ${f.deleted ? "opacity-50" : ""}`}>
      <div
        className={`h-2.5 w-2.5 shrink-0 rounded-full ${f.deleted ? "bg-[#e2d8ba]" : alert || d === null ? "bg-rojo" : "bg-sage"}`}
      />
      <div className="min-w-0 flex-1">
        <input
          value={family}
          disabled={f.deleted}
          onChange={(e) => setFamily(e.target.value)}
          onBlur={() => onUpdate?.(family)}
          placeholder={t("famPh")}
          className="w-full max-w-[280px] rounded-[6px] border border-line-card bg-white px-2 py-1.5 text-[13px] font-bold text-deep-water focus:border-living-teal focus:outline-none disabled:border-transparent disabled:bg-transparent"
        />
        {!f.deleted ? (
          <div className={`mt-0.5 text-[11px] ${alert ? "font-bold text-rojo" : "text-muted"}`}>
            {t("lastContact")} {label}
            {alert ? ` — ${t("alertDays")}` : ""}
          </div>
        ) : (
          <div className="mt-0.5 text-[11px] text-rojo">
            {t("deletedTag")} · {f.deletedAt ? fmtDate(f.deletedAt, lang) : ""}
          </div>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        {!f.deleted ? (
          <>
            <button type="button" onClick={onVisit} className="rounded-md border border-line-card bg-white px-2.5 py-1.5 text-[11px] font-bold text-water-mid">
              {t("markVisited")}
            </button>
            <span onClick={onDelete} className="cursor-pointer text-sm font-bold text-rojo opacity-60 hover:opacity-100">
              ✕
            </span>
          </>
        ) : (
          <button type="button" onClick={onRestore} title={t("restoreMinuta")} className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-line-card bg-white text-water-mid">
            ↺
          </button>
        )}
      </div>
    </div>
  );
}
