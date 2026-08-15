"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { useSecretarioStore } from "@/lib/secretario/store";
import { useT, useLang } from "@/lib/secretario/useT";
import { fmtDate } from "@/lib/secretario/format";
import * as actions from "@/lib/secretario/actions";
import type { Tarea } from "@/lib/secretario/types";
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

export function TareasPanel() {
  const t = useT();
  const lang = useLang();
  const data = useSecretarioStore((s) => s.data);
  const apply = useSecretarioStore((s) => s.apply);
  const showToast = useSecretarioStore((s) => s.showToast);
  const [who, setWho] = useState("");
  const [what, setWhat] = useState("");
  const [showTrash, setShowTrash] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const deletedCount = data.tareas.filter((x) => x.deleted).length;
  const entries = data.tareas.map((task, i) => ({ task, i })).reverse();
  const active = entries.filter(({ task }) => !task.deleted);
  const trashed = entries.filter(({ task }) => task.deleted);

  return (
    <Card className="p-4">
      <ListHeader
        title={t("tareasTitle")}
        subtitle={t("tareasSub")}
        trashCount={deletedCount}
        trashOpen={showTrash}
        onToggleTrash={() => setShowTrash((v) => !v)}
      />

      {active.length === 0 ? (
        <EmptyState>{t("noTasks")}</EmptyState>
      ) : (
        active.map(({ task, i }) => (
          <TareaRow
            key={i}
            task={task}
            i={i}
            lang={lang}
            t={t}
            editing={editingIndex === i}
            onStartEdit={() => setEditingIndex(i)}
            onCancelEdit={() => setEditingIndex(null)}
            onSaveEdit={(w, wh) => {
              apply((d) => actions.saveEditTask(d, i, w, wh));
              setEditingIndex(null);
              showToast(t("saved"));
            }}
            onToggle={() => apply((d) => actions.toggleTask(d, i))}
            onDelete={() => {
              apply((d) => actions.deleteTask(d, i));
              showToast(t("movedToTrash"));
            }}
            onRestore={() => {}}
          />
        ))
      )}

      <FieldRow>
        <TextInput value={who} onChange={(e) => setWho(e.target.value)} placeholder={t("whoPh")} />
        <TextInput value={what} onChange={(e) => setWhat(e.target.value)} placeholder={t("whatPh")} />
      </FieldRow>
      <button
        type="button"
        onClick={() => {
          if (!who.trim() || !what.trim()) return;
          apply((d) => actions.addTask(d, who, what));
          setWho("");
          setWhat("");
          showToast(t("taskAdded"));
        }}
        className="mt-3 w-full rounded-lg bg-dawn-coral py-3 text-sm font-bold text-white"
      >
        {t("addTask")}
      </button>

      <TrashCard open={showTrash} title={t("trash")} emptyText={t("noTrash")}>
        {trashed.map(({ task, i }) => (
          <TareaRow
            key={i}
            task={task}
            i={i}
            lang={lang}
            t={t}
            editing={false}
            onStartEdit={() => {}}
            onCancelEdit={() => {}}
            onSaveEdit={() => {}}
            onToggle={() => {}}
            onDelete={() => {}}
            onRestore={() => {
              apply((d) => actions.restoreTask(d, i));
              showToast(t("restored"));
            }}
          />
        ))}
      </TrashCard>
    </Card>
  );
}

function TareaRow({
  task,
  lang,
  t,
  editing,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onToggle,
  onDelete,
  onRestore,
}: {
  task: Tarea;
  i: number;
  lang: ReturnType<typeof useLang>;
  t: ReturnType<typeof useT>;
  editing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: (who: string, what: string) => void;
  onToggle: () => void;
  onDelete: () => void;
  onRestore: () => void;
}) {
  const [who, setWho] = useState(task.who);
  const [what, setWhat] = useState(task.what);

  if (editing) {
    return (
      <div className="mb-2 rounded-[6px] border-l-[3px] border-dawn-coral bg-linen px-[11px] py-[9px]">
        <FieldRow>
          <TextInput value={who} onChange={(e) => setWho(e.target.value)} className="!mt-0" />
          <TextInput value={what} onChange={(e) => setWhat(e.target.value)} className="!mt-0" />
        </FieldRow>
        <div className="mt-2 flex gap-2">
          <button type="button" onClick={() => onSaveEdit(who, what)} className="rounded-md bg-living-teal px-3.5 py-2 text-xs font-bold text-white">
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
  if (task.createdAt) metaBits.push(`${t("createdOn")} ${fmtDate(task.createdAt, lang)}`);
  if (task.editedAt) metaBits.push(`${t("editedOn")} ${fmtDate(task.editedAt, lang)}`);
  if (task.deleted && task.deletedAt) metaBits.push(`${t("deletedOn")} ${fmtDate(task.deletedAt, lang)}`);

  return (
    <ListRow
      title={task.who}
      strikeTitle={task.deleted}
      subtitle={task.what}
      faded={task.deleted}
      meta={
        <>
          <MetaLine bits={metaBits} />
          <HistoryToggle
            count={task.history.length}
            label={t("viewChanges")}
            versionOfLabel={t("versionOf")}
            lang={lang}
            entries={task.history}
            render={(v) => (
              <>
                <b>{v.who}</b>: {v.what}
              </>
            )}
          />
        </>
      }
      right={
        <div className="flex flex-col items-end gap-2">
          {!task.deleted ? (
            <Badge tone={task.done ? "done" : "pending"} onClick={onToggle}>
              {task.done ? t("done") : t("pending")}
            </Badge>
          ) : null}
          <RowActionButtons
            deleted={task.deleted}
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
