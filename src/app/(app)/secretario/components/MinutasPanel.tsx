"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useSecretarioStore } from "@/lib/secretario/store";
import { useT, useLang } from "@/lib/secretario/useT";
import { fmtDate } from "@/lib/secretario/format";
import * as actions from "@/lib/secretario/actions";
import type { Minuta } from "@/lib/secretario/types";
import { EmptyState, HistoryToggle, ListHeader, MetaLine, RowActionButtons, TrashCard } from "./shared";

export function MinutasPanel() {
  const t = useT();
  const lang = useLang();
  const data = useSecretarioStore((s) => s.data);
  const apply = useSecretarioStore((s) => s.apply);
  const showToast = useSecretarioStore((s) => s.showToast);
  const [text, setText] = useState("");
  const [showTrash, setShowTrash] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const deletedCount = data.minutas.filter((m) => m.deleted).length;
  const entries = data.minutas.map((m, idx) => ({ m, idx })).reverse();
  const active = entries.filter(({ m }) => !m.deleted);
  const trashed = entries.filter(({ m }) => m.deleted);

  return (
    <div className="flex flex-col gap-3">
      <Card className="p-4">
        <h2 className="font-display text-lg font-semibold text-deep-water">{t("minutasTitle")}</h2>
        <p className="mt-0.5 text-[13px] text-muted-2">{t("minutasSub")}</p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("minutaPh")}
          className="mt-3 min-h-[130px] w-full rounded-lg border border-line-card bg-linen p-3 text-[15px] leading-relaxed text-ink focus:border-living-teal focus:bg-white focus:outline-none"
        />
        <Button
          variant="accent"
          className="mt-3 w-full"
          onClick={() => {
            if (!text.trim()) return;
            apply((d) => actions.saveMinuta(d, text));
            setText("");
            showToast(t("saved"));
          }}
        >
          {t("saveMinuta")}
        </Button>
      </Card>

      <Card className="p-4">
        <ListHeader
          title={t("history")}
          subtitle=""
          trashCount={deletedCount}
          trashOpen={showTrash}
          onToggleTrash={() => setShowTrash((v) => !v)}
        />
      </Card>

      <TrashCard open={showTrash} title={t("trash")} emptyText={t("noTrash")}>
        {trashed.map(({ m, idx }) => (
          <MinutaRow
            key={idx}
            m={m}
            lang={lang}
            editing={false}
            onStartEdit={() => {}}
            onCancelEdit={() => {}}
            onSaveEdit={() => {}}
            onDelete={() => {}}
            onRestore={() => {
              apply((d) => actions.restoreMinuta(d, idx));
              showToast(t("restored"));
            }}
            t={t}
          />
        ))}
      </TrashCard>

      {active.length === 0 ? (
        <Card className="p-4">
          <EmptyState>{t("noMinutas")}</EmptyState>
        </Card>
      ) : (
        active.map(({ m, idx }) => (
          <Card key={idx} className="p-4">
            <MinutaRow
              m={m}
              lang={lang}
              editing={editingIndex === idx}
              onStartEdit={() => setEditingIndex(idx)}
              onCancelEdit={() => setEditingIndex(null)}
              onSaveEdit={(newText) => {
                apply((d) => actions.saveEditMinuta(d, idx, newText));
                setEditingIndex(null);
                showToast(t("saved"));
              }}
              onDelete={() => {
                apply((d) => actions.deleteMinuta(d, idx));
                showToast(t("movedToTrash"));
              }}
              onRestore={() => {}}
              t={t}
            />
          </Card>
        ))
      )}
    </div>
  );
}

function MinutaRow({
  m,
  lang,
  editing,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onRestore,
  t,
}: {
  m: Minuta;
  lang: ReturnType<typeof useLang>;
  editing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: (text: string) => void;
  onDelete: () => void;
  onRestore: () => void;
  t: ReturnType<typeof useT>;
}) {
  const [draft, setDraft] = useState(m.text);

  if (editing) {
    return (
      <div className="flex gap-3">
        <div className="flex-1">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="min-h-[100px] w-full rounded-lg border border-line-card bg-linen p-3 text-sm"
          />
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => onSaveEdit(draft)}
              className="rounded-md bg-living-teal px-3.5 py-2 text-xs font-bold text-white"
            >
              {t("saveEdit")}
            </button>
            <button
              type="button"
              onClick={onCancelEdit}
              className="rounded-md bg-[#9c8f6c] px-3.5 py-2 text-xs font-bold text-white"
            >
              {t("cancelEdit")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const metaBits: string[] = [];
  if (m.editedAt) metaBits.push(`${t("editedOn")} ${fmtDate(m.editedAt, lang)}`);
  if (m.deleted && m.deletedAt) metaBits.push(`${t("deletedOn")} ${fmtDate(m.deletedAt, lang)}`);

  return (
    <div className={`flex gap-3 border-t border-dashed border-line-card py-3 first:border-t-0 first:pt-0 ${m.deleted ? "opacity-55" : ""}`}>
      <div className="w-[60px] shrink-0 pt-1.5 text-[11px] font-bold text-dawn-coral">
        {fmtDate(m.date, lang)}
        {m.deleted ? <div className="mt-0.5 text-rojo">{t("deletedTag")}</div> : null}
      </div>
      <div className="min-w-0 flex-1">
        <div className={`whitespace-pre-wrap text-sm text-ink ${m.deleted ? "line-through" : ""}`}>{m.text}</div>
        <MetaLine bits={metaBits} />
        <HistoryToggle
          count={m.history.length}
          label={t("viewChanges")}
          versionOfLabel={t("versionOf")}
          lang={lang}
          entries={m.history}
          render={(v) => <span className="whitespace-pre-wrap">{v.text}</span>}
        />
      </div>
      <div className="mt-0.5 shrink-0">
        <RowActionButtons
          deleted={m.deleted}
          onEdit={onStartEdit}
          onDelete={onDelete}
          onRestore={onRestore}
          editLabel={t("editMinuta")}
          deleteLabel={t("deleteMinuta")}
          restoreLabel={t("restoreMinuta")}
        />
      </div>
    </div>
  );
}
