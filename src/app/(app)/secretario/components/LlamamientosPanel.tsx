"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { useSecretarioStore } from "@/lib/secretario/store";
import { useT, useLang } from "@/lib/secretario/useT";
import { fmtDate } from "@/lib/secretario/format";
import * as actions from "@/lib/secretario/actions";
import type { LlamamientoConsideracion, LlamamientoEstado } from "@/lib/secretario/types";
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

const ESTADO_TONE: Record<LlamamientoEstado, "pending" | "progress" | "done"> = {
  orando: "pending",
  propuesto: "progress",
  extendido: "done",
};
const ESTADO_KEY: Record<LlamamientoEstado, "estOrando" | "estPropuesto" | "estExtendido"> = {
  orando: "estOrando",
  propuesto: "estPropuesto",
  extendido: "estExtendido",
};

export function LlamamientosPanel() {
  const t = useT();
  const lang = useLang();
  const data = useSecretarioStore((s) => s.data);
  const apply = useSecretarioStore((s) => s.apply);
  const showToast = useSecretarioStore((s) => s.showToast);
  const [persona, setPersona] = useState("");
  const [llamamiento, setLlamamiento] = useState("");
  const [showTrash, setShowTrash] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const deletedCount = data.llamamientos.filter((x) => x.deleted).length;
  const entries = data.llamamientos.map((x, i) => ({ x, i })).reverse();
  const active = entries.filter(({ x }) => !x.deleted);
  const trashed = entries.filter(({ x }) => x.deleted);

  return (
    <Card className="p-4">
      <ListHeader
        title={t("llamamientosTitle")}
        subtitle={t("llamamientosSub")}
        trashCount={deletedCount}
        trashOpen={showTrash}
        onToggleTrash={() => setShowTrash((v) => !v)}
      />

      <div className="mt-3 rounded-[10px] border border-[#e0bdae] bg-rojo-light p-2.5 text-[13px] leading-relaxed text-[#7a3524]">
        <b className="text-rojo">{lang === "es" ? "Privacidad:" : "Privacy:"}</b> {t("llamamientosWarning")}
      </div>

      {active.length === 0 ? (
        <EmptyState>{t("noLlamamientos")}</EmptyState>
      ) : (
        <div className="mt-3">
          {active.map(({ x, i }) => (
            <LlamamientoRow
              key={i}
              x={x}
              lang={lang}
              t={t}
              editing={editingIndex === i}
              onStartEdit={() => setEditingIndex(i)}
              onCancelEdit={() => setEditingIndex(null)}
              onSaveEdit={(p, l) => {
                apply((d) => actions.saveEditLlamamiento(d, i, p, l));
                setEditingIndex(null);
                showToast(t("saved"));
              }}
              onCycle={() => apply((d) => actions.cycleLlamamientoEstado(d, i))}
              onDelete={() => {
                apply((d) => actions.deleteLlamamiento(d, i));
                showToast(t("movedToTrash"));
              }}
              onRestore={() => {}}
            />
          ))}
        </div>
      )}

      <FieldRow>
        <TextInput value={persona} onChange={(e) => setPersona(e.target.value)} placeholder={t("personaPh")} />
        <TextInput value={llamamiento} onChange={(e) => setLlamamiento(e.target.value)} placeholder={t("llamamientoPh")} />
      </FieldRow>
      <button
        type="button"
        onClick={() => {
          if (!persona.trim() || !llamamiento.trim()) return;
          apply((d) => actions.addLlamamiento(d, persona, llamamiento));
          setPersona("");
          setLlamamiento("");
          showToast(t("llamamientoAdded"));
        }}
        className="mt-3 w-full rounded-lg bg-dawn-coral py-3 text-sm font-bold text-white"
      >
        {t("addLlamamiento")}
      </button>

      <TrashCard open={showTrash} title={t("trash")} emptyText={t("noTrash")}>
        {trashed.map(({ x, i }) => (
          <LlamamientoRow
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
              apply((d) => actions.restoreLlamamiento(d, i));
              showToast(t("restored"));
            }}
          />
        ))}
      </TrashCard>
    </Card>
  );
}

function LlamamientoRow({
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
  x: LlamamientoConsideracion;
  lang: ReturnType<typeof useLang>;
  t: ReturnType<typeof useT>;
  editing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: (persona: string, llamamiento: string) => void;
  onCycle: () => void;
  onDelete: () => void;
  onRestore: () => void;
}) {
  const [persona, setPersona] = useState(x.persona);
  const [llamamiento, setLlamamiento] = useState(x.llamamiento);

  if (editing) {
    return (
      <div className="mb-2 rounded-[6px] border-l-[3px] border-dawn-coral bg-linen px-[11px] py-[9px]">
        <FieldRow>
          <TextInput value={persona} onChange={(e) => setPersona(e.target.value)} className="!mt-0" />
          <TextInput value={llamamiento} onChange={(e) => setLlamamiento(e.target.value)} className="!mt-0" />
        </FieldRow>
        <div className="mt-2 flex gap-2">
          <button type="button" onClick={() => onSaveEdit(persona, llamamiento)} className="rounded-md bg-living-teal px-3.5 py-2 text-xs font-bold text-white">
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
  if (x.createdAt) metaBits.push(`${t("createdOn")} ${fmtDate(x.createdAt, lang)}`);
  if (x.editedAt) metaBits.push(`${t("editedOn")} ${fmtDate(x.editedAt, lang)}`);
  if (x.deleted && x.deletedAt) metaBits.push(`${t("deletedOn")} ${fmtDate(x.deletedAt, lang)}`);

  return (
    <ListRow
      title={x.persona}
      strikeTitle={x.deleted}
      subtitle={x.llamamiento}
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
                <b>{v.persona}</b>: {v.llamamiento}
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
