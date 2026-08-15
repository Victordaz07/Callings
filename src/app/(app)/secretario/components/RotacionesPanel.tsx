"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { useSecretarioStore } from "@/lib/secretario/store";
import { useT, useLang } from "@/lib/secretario/useT";
import { fmtDate } from "@/lib/secretario/format";
import * as actions from "@/lib/secretario/actions";
import type { Rotacion } from "@/lib/secretario/types";
import {
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

export function RotacionesPanel() {
  const t = useT();
  const lang = useLang();
  const data = useSecretarioStore((s) => s.data);
  const apply = useSecretarioStore((s) => s.apply);
  const showToast = useSecretarioStore((s) => s.showToast);
  const [tarea, setTarea] = useState("");
  const [personas, setPersonas] = useState("");
  const [showTrash, setShowTrash] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const deletedCount = data.rotaciones.filter((r) => r.deleted).length;
  const entries = data.rotaciones.map((r, i) => ({ r, i })).reverse();
  const active = entries.filter(({ r }) => !r.deleted);
  const trashed = entries.filter(({ r }) => r.deleted);

  return (
    <Card className="p-4">
      <ListHeader
        title={t("rotacionesTitle")}
        subtitle={t("rotacionesSub")}
        trashCount={deletedCount}
        trashOpen={showTrash}
        onToggleTrash={() => setShowTrash((v) => !v)}
      />

      {active.length === 0 ? (
        <EmptyState>{t("noRotaciones")}</EmptyState>
      ) : (
        active.map(({ r, i }) => (
          <RotacionRow
            key={i}
            r={r}
            lang={lang}
            t={t}
            editing={editingIndex === i}
            onStartEdit={() => setEditingIndex(i)}
            onCancelEdit={() => setEditingIndex(null)}
            onSaveEdit={(tar, per) => {
              apply((d) => actions.saveEditRotacion(d, i, tar, per));
              setEditingIndex(null);
              showToast(t("saved"));
            }}
            onAvanzar={() => {
              apply((d) => actions.avanzarTurno(d, i));
              showToast(t("turnAdvanced"));
            }}
            onDelete={() => {
              apply((d) => actions.deleteRotacion(d, i));
              showToast(t("movedToTrash"));
            }}
            onRestore={() => {}}
          />
        ))
      )}

      <FieldRow>
        <TextInput value={tarea} onChange={(e) => setTarea(e.target.value)} placeholder={t("tareaRotPh")} />
        <TextInput value={personas} onChange={(e) => setPersonas(e.target.value)} placeholder={t("personasRotPh")} />
      </FieldRow>
      <button
        type="button"
        onClick={() => {
          apply((d) => actions.addRotacion(d, tarea, personas));
          setTarea("");
          setPersonas("");
          showToast(t("rotacionAdded"));
        }}
        className="mt-3 w-full rounded-lg bg-dawn-coral py-3 text-sm font-bold text-white"
      >
        {t("addRotacion")}
      </button>

      <TrashCard open={showTrash} title={t("trash")} emptyText={t("noTrash")}>
        {trashed.map(({ r, i }) => (
          <RotacionRow
            key={i}
            r={r}
            lang={lang}
            t={t}
            editing={false}
            onStartEdit={() => {}}
            onCancelEdit={() => {}}
            onSaveEdit={() => {}}
            onAvanzar={() => {}}
            onDelete={() => {}}
            onRestore={() => {
              apply((d) => actions.restoreRotacion(d, i));
              showToast(t("restored"));
            }}
          />
        ))}
      </TrashCard>
    </Card>
  );
}

function RotacionRow({
  r,
  lang,
  t,
  editing,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onAvanzar,
  onDelete,
  onRestore,
}: {
  r: Rotacion;
  lang: ReturnType<typeof useLang>;
  t: ReturnType<typeof useT>;
  editing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: (tarea: string, personas: string) => void;
  onAvanzar: () => void;
  onDelete: () => void;
  onRestore: () => void;
}) {
  const [tarea, setTarea] = useState(r.tarea);
  const [personas, setPersonas] = useState(r.personas.join(", "));

  if (editing) {
    return (
      <div className="mb-2 rounded-[6px] border-l-[3px] border-dawn-coral bg-linen px-[11px] py-[9px]">
        <FieldRow>
          <TextInput value={tarea} onChange={(e) => setTarea(e.target.value)} className="!mt-0" />
          <TextInput value={personas} onChange={(e) => setPersonas(e.target.value)} className="!mt-0" />
        </FieldRow>
        <div className="mt-2 flex gap-2">
          <button type="button" onClick={() => onSaveEdit(tarea, personas)} className="rounded-md bg-living-teal px-3.5 py-2 text-xs font-bold text-white">
            {t("saveEdit")}
          </button>
          <button type="button" onClick={onCancelEdit} className="rounded-md bg-[#9c8f6c] px-3.5 py-2 text-xs font-bold text-white">
            {t("cancelEdit")}
          </button>
        </div>
      </div>
    );
  }

  const actual = r.personas.length ? r.personas[r.turnoActual] : "—";
  const metaBits: string[] = [];
  if (r.createdAt) metaBits.push(`${t("createdOn")} ${fmtDate(r.createdAt, lang)}`);
  if (r.editedAt) metaBits.push(`${t("editedOn")} ${fmtDate(r.editedAt, lang)}`);
  if (r.deleted && r.deletedAt) metaBits.push(`${t("deletedOn")} ${fmtDate(r.deletedAt, lang)}`);

  return (
    <ListRow
      title={r.tarea}
      strikeTitle={r.deleted}
      subtitle={`${t("turnoActualLabel")} ${actual}`}
      faded={r.deleted}
      meta={
        <>
          <div className="mt-0.5 text-[12px] text-muted">
            {t("ordenLabel")} {r.personas.join(", ")}
          </div>
          <MetaLine bits={metaBits} />
          <HistoryToggle
            count={r.history.length}
            label={t("viewChanges")}
            versionOfLabel={t("versionOf")}
            lang={lang}
            entries={r.history}
            render={(v) => (
              <>
                <b>{v.tarea}</b>: {v.personas.join(", ")}
              </>
            )}
          />
          {!r.deleted ? (
            <HistoryToggle
              count={r.turnHistory.length}
              forceShow
              emptyLabel={t("noTurnHistory")}
              label={t("viewTurnHistory")}
              versionOfLabel=""
              lang={lang}
              entries={r.turnHistory.map((v) => ({ at: v.fecha, persona: v.persona }))}
              render={(v) => (
                <>
                  {fmtDate(v.at, lang)} — <b>{v.persona}</b>
                </>
              )}
            />
          ) : null}
        </>
      }
      right={
        <div className="flex flex-col items-end gap-2">
          {!r.deleted ? (
            <button type="button" onClick={onAvanzar} className="rounded-md border border-line-card bg-white px-2.5 py-1.5 text-[11px] font-bold text-water-mid">
              ↻ {t("avanzarTurno")}
            </button>
          ) : null}
          <RowActionButtons
            deleted={r.deleted}
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
