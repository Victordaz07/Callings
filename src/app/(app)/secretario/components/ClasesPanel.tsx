"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { useSecretarioStore } from "@/lib/secretario/store";
import { useT, useLang } from "@/lib/secretario/useT";
import { fmtDate } from "@/lib/secretario/format";
import * as actions from "@/lib/secretario/actions";
import type { Clase } from "@/lib/secretario/types";
import {
  Badge,
  EmptyState,
  FieldRow,
  HistoryToggle,
  ListHeader,
  ListRow,
  MetaLine,
  RowActionButtons,
  TextInput,
  TrashCard,
} from "./shared";

export function ClasesPanel() {
  const t = useT();
  const lang = useLang();
  const data = useSecretarioStore((s) => s.data);
  const apply = useSecretarioStore((s) => s.apply);
  const showToast = useSecretarioStore((s) => s.showToast);
  const [clase, setClase] = useState("");
  const [maestro, setMaestro] = useState("");
  const [showTrash, setShowTrash] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const deletedCount = data.clases.filter((c) => c.deleted).length;
  const entries = data.clases.map((c, i) => ({ c, i })).reverse();
  const active = entries.filter(({ c }) => !c.deleted);
  const trashed = entries.filter(({ c }) => c.deleted);

  return (
    <Card className="p-4">
      <ListHeader
        title={t("clasesTitle")}
        subtitle={t("clasesSub")}
        trashCount={deletedCount}
        trashOpen={showTrash}
        onToggleTrash={() => setShowTrash((v) => !v)}
      />

      {active.length === 0 ? (
        <EmptyState>{t("noClases")}</EmptyState>
      ) : (
        active.map(({ c, i }) => (
          <ClaseRow
            key={i}
            c={c}
            lang={lang}
            t={t}
            editing={editingIndex === i}
            onStartEdit={() => setEditingIndex(i)}
            onCancelEdit={() => setEditingIndex(null)}
            onSaveEdit={(cl, m) => {
              apply((d) => actions.saveEditClase(d, i, cl, m));
              setEditingIndex(null);
              showToast(t("saved"));
            }}
            onDelete={() => {
              apply((d) => actions.deleteClase(d, i));
              showToast(t("movedToTrash"));
            }}
            onRestore={() => {}}
          />
        ))
      )}

      <FieldRow>
        <TextInput value={clase} onChange={(e) => setClase(e.target.value)} placeholder={t("clasePh")} />
        <TextInput value={maestro} onChange={(e) => setMaestro(e.target.value)} placeholder={t("maestroPh")} />
      </FieldRow>
      <button
        type="button"
        onClick={() => {
          if (!clase.trim()) return;
          apply((d) => actions.addClase(d, clase, maestro));
          setClase("");
          setMaestro("");
          showToast(t("claseAdded"));
        }}
        className="mt-3 w-full rounded-lg bg-dawn-coral py-3 text-sm font-bold text-white"
      >
        {t("addClase")}
      </button>

      <TrashCard open={showTrash} title={t("trash")} emptyText={t("noTrash")}>
        {trashed.map(({ c, i }) => (
          <ClaseRow
            key={i}
            c={c}
            lang={lang}
            t={t}
            editing={false}
            onStartEdit={() => {}}
            onCancelEdit={() => {}}
            onSaveEdit={() => {}}
            onDelete={() => {}}
            onRestore={() => {
              apply((d) => actions.restoreClase(d, i));
              showToast(t("restored"));
            }}
          />
        ))}
      </TrashCard>
    </Card>
  );
}

function ClaseRow({
  c,
  lang,
  t,
  editing,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onRestore,
}: {
  c: Clase;
  lang: ReturnType<typeof useLang>;
  t: ReturnType<typeof useT>;
  editing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: (clase: string, maestro: string) => void;
  onDelete: () => void;
  onRestore: () => void;
}) {
  const [clase, setClase] = useState(c.clase);
  const [maestro, setMaestro] = useState(c.maestro);

  if (editing) {
    return (
      <div className="mb-2 rounded-[6px] border-l-[3px] border-dawn-coral bg-linen px-[11px] py-[9px]">
        <FieldRow>
          <TextInput value={clase} onChange={(e) => setClase(e.target.value)} className="!mt-0" />
          <TextInput value={maestro} onChange={(e) => setMaestro(e.target.value)} className="!mt-0" />
        </FieldRow>
        <div className="mt-2 flex gap-2">
          <button type="button" onClick={() => onSaveEdit(clase, maestro)} className="rounded-md bg-living-teal px-3.5 py-2 text-xs font-bold text-white">
            {t("saveEdit")}
          </button>
          <button type="button" onClick={onCancelEdit} className="rounded-md bg-[#9c8f6c] px-3.5 py-2 text-xs font-bold text-white">
            {t("cancelEdit")}
          </button>
        </div>
      </div>
    );
  }

  const hasMaestro = !!(c.maestro && c.maestro.trim());
  const metaBits: string[] = [];
  if (c.createdAt) metaBits.push(`${t("createdOn")} ${fmtDate(c.createdAt, lang)}`);
  if (c.editedAt) metaBits.push(`${t("editedOn")} ${fmtDate(c.editedAt, lang)}`);
  if (c.deleted && c.deletedAt) metaBits.push(`${t("deletedOn")} ${fmtDate(c.deletedAt, lang)}`);

  return (
    <ListRow
      title={c.clase}
      strikeTitle={c.deleted}
      subtitle={c.maestro || t("sinMaestro")}
      faded={c.deleted}
      meta={
        <>
          <MetaLine bits={metaBits} />
          <HistoryToggle
            count={c.history.length}
            label={t("viewChanges")}
            versionOfLabel={t("versionOf")}
            lang={lang}
            entries={c.history}
            render={(v) => (
              <>
                <b>{v.clase}</b>: {v.maestro || t("sinMaestro")}
              </>
            )}
          />
        </>
      }
      right={
        <div className="flex flex-col items-end gap-2">
          {!c.deleted ? (
            <Badge tone={hasMaestro ? "done" : "pending"}>
              {hasMaestro ? t("asignado") : t("sinMaestro")}
            </Badge>
          ) : null}
          <RowActionButtons
            deleted={c.deleted}
            onEdit={onStartEdit}
            onDelete={onDelete}
            onRestore={onRestore}
            editLabel={t("editMinuta")}
            deleteLabel={t("deleteMinuta")}
            restoreLabel={t("restoreMinuta")}
          />
        </div>
      }
    />
  );
}
