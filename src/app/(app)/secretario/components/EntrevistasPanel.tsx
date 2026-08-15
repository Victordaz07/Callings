"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { useSecretarioStore } from "@/lib/secretario/store";
import { useT, useLang } from "@/lib/secretario/useT";
import { fmtDate, fmtDateOnly } from "@/lib/secretario/format";
import * as actions from "@/lib/secretario/actions";
import type { Entrevista, EntrevistaEstado } from "@/lib/secretario/types";
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

const ESTADO_TONE: Record<EntrevistaEstado, "pending" | "progress" | "done"> = {
  pendiente: "pending",
  agendada: "progress",
  hecha: "done",
};
const ESTADO_KEY: Record<EntrevistaEstado, "estPendiente" | "estAgendada" | "estHecha"> = {
  pendiente: "estPendiente",
  agendada: "estAgendada",
  hecha: "estHecha",
};

export function EntrevistasPanel() {
  const t = useT();
  const lang = useLang();
  const data = useSecretarioStore((s) => s.data);
  const apply = useSecretarioStore((s) => s.apply);
  const showToast = useSecretarioStore((s) => s.showToast);
  const [nombre, setNombre] = useState("");
  const [motivo, setMotivo] = useState("");
  const [fecha, setFecha] = useState("");
  const [showTrash, setShowTrash] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const deletedCount = data.entrevistas.filter((x) => x.deleted).length;
  const entries = data.entrevistas.map((x, i) => ({ x, i })).reverse();
  const active = entries.filter(({ x }) => !x.deleted);
  const trashed = entries.filter(({ x }) => x.deleted);

  return (
    <Card className="p-4">
      <ListHeader
        title={t("entrevistasTitle")}
        subtitle={t("entrevistasSub")}
        trashCount={deletedCount}
        trashOpen={showTrash}
        onToggleTrash={() => setShowTrash((v) => !v)}
      />

      {active.length === 0 ? (
        <EmptyState>{t("noEntrevistas")}</EmptyState>
      ) : (
        active.map(({ x, i }) => (
          <EntrevistaRow
            key={i}
            x={x}
            lang={lang}
            t={t}
            editing={editingIndex === i}
            onStartEdit={() => setEditingIndex(i)}
            onCancelEdit={() => setEditingIndex(null)}
            onSaveEdit={(n, m, f) => {
              apply((d) => actions.saveEditEntrevista(d, i, n, m, f));
              setEditingIndex(null);
              showToast(t("saved"));
            }}
            onCycle={() => apply((d) => actions.cycleEstadoEntrevista(d, i))}
            onDelete={() => {
              apply((d) => actions.deleteEntrevista(d, i));
              showToast(t("movedToTrash"));
            }}
            onRestore={() => {}}
          />
        ))
      )}

      <FieldRow>
        <TextInput value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder={t("nombrePh")} />
        <TextInput value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder={t("motivoPh")} />
      </FieldRow>
      <FieldRow>
        <TextInput type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} title={t("fechaPh")} />
      </FieldRow>
      <button
        type="button"
        onClick={() => {
          if (!nombre.trim() || !motivo.trim()) return;
          apply((d) => actions.addEntrevista(d, nombre, motivo, fecha));
          setNombre("");
          setMotivo("");
          setFecha("");
          showToast(t("entrevistaAdded"));
        }}
        className="mt-3 w-full rounded-lg bg-dawn-coral py-3 text-sm font-bold text-white"
      >
        {t("addEntrevista")}
      </button>

      <TrashCard open={showTrash} title={t("trash")} emptyText={t("noTrash")}>
        {trashed.map(({ x, i }) => (
          <EntrevistaRow
            key={i}
            x={x}
            lang={lang}
            t={t}
            editing={false}
            onStartEdit={() => {}}
            onCancelEdit={() => {}}
            onSaveEdit={() => {}}
            onCycle={() => {}}
            onDelete={() => {}}
            onRestore={() => {
              apply((d) => actions.restoreEntrevista(d, i));
              showToast(t("restored"));
            }}
          />
        ))}
      </TrashCard>
    </Card>
  );
}

function EntrevistaRow({
  x,
  lang,
  t,
  editing,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onCycle,
  onDelete,
  onRestore,
}: {
  x: Entrevista;
  lang: ReturnType<typeof useLang>;
  t: ReturnType<typeof useT>;
  editing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: (nombre: string, motivo: string, fecha: string) => void;
  onCycle: () => void;
  onDelete: () => void;
  onRestore: () => void;
}) {
  const [nombre, setNombre] = useState(x.nombre);
  const [motivo, setMotivo] = useState(x.motivo);
  const [fecha, setFecha] = useState(x.fecha);

  if (editing) {
    return (
      <div className="mb-2 rounded-[6px] border-l-[3px] border-dawn-coral bg-linen px-[11px] py-[9px]">
        <FieldRow>
          <TextInput value={nombre} onChange={(e) => setNombre(e.target.value)} className="!mt-0" />
          <TextInput value={motivo} onChange={(e) => setMotivo(e.target.value)} className="!mt-0" />
        </FieldRow>
        <FieldRow>
          <TextInput type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="!mt-0" />
        </FieldRow>
        <div className="mt-2 flex gap-2">
          <button type="button" onClick={() => onSaveEdit(nombre, motivo, fecha)} className="rounded-md bg-living-teal px-3.5 py-2 text-xs font-bold text-white">
            {t("saveEdit")}
          </button>
          <button type="button" onClick={onCancelEdit} className="rounded-md bg-[#9c8f6c] px-3.5 py-2 text-xs font-bold text-white">
            {t("cancelEdit")}
          </button>
        </div>
      </div>
    );
  }

  const metaBits: string[] = [];
  if (x.fecha) metaBits.push(fmtDateOnly(x.fecha, lang));
  if (x.createdAt) metaBits.push(`${t("createdOn")} ${fmtDate(x.createdAt, lang)}`);
  if (x.editedAt) metaBits.push(`${t("editedOn")} ${fmtDate(x.editedAt, lang)}`);
  if (x.deleted && x.deletedAt) metaBits.push(`${t("deletedOn")} ${fmtDate(x.deletedAt, lang)}`);

  return (
    <ListRow
      title={x.nombre}
      strikeTitle={x.deleted}
      subtitle={x.motivo}
      faded={x.deleted}
      meta={
        <>
          <MetaLine bits={metaBits} />
          <HistoryToggle
            count={x.history.length}
            label={t("viewChanges")}
            versionOfLabel={t("versionOf")}
            lang={lang}
            entries={x.history}
            render={(v) => (
              <>
                <b>{v.nombre}</b>: {v.motivo}
              </>
            )}
          />
        </>
      }
      right={
        <div className="flex flex-col items-end gap-2">
          {!x.deleted ? (
            <Badge tone={ESTADO_TONE[x.estado]} onClick={onCycle}>
              {t(ESTADO_KEY[x.estado])}
            </Badge>
          ) : null}
          <RowActionButtons
            deleted={x.deleted}
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
