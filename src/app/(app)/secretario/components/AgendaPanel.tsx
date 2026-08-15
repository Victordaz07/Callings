"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useSecretarioStore } from "@/lib/secretario/store";
import { useT, useLang } from "@/lib/secretario/useT";
import { fmtDateOnly } from "@/lib/secretario/format";
import { buildAgendaText } from "@/lib/secretario/report";
import * as actions from "@/lib/secretario/actions";
import { EmptyState } from "./shared";
import type { AgendaItem, AgendaMeta } from "@/lib/secretario/types";

function respWidth(v: string) {
  return Math.min(220, Math.max(92, v.length * 7 + 28));
}

function share(text: string, channel: "wa" | "mail" | "copy", subject: string, onCopied: () => void) {
  if (channel === "wa") {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  } else if (channel === "mail") {
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
  } else {
    navigator.clipboard.writeText(text).then(onCopied);
  }
}

export function AgendaPanel() {
  const t = useT();
  const lang = useLang();
  const data = useSecretarioStore((s) => s.data);
  const apply = useSecretarioStore((s) => s.apply);
  const showToast = useSecretarioStore((s) => s.showToast);
  const [newItem, setNewItem] = useState("");
  const [newResp, setNewResp] = useState("");

  const addItem = () => {
    if (!newItem.trim()) return;
    apply((d) => actions.addAgendaItem(d, newItem, newResp));
    setNewItem("");
    setNewResp("");
  };

  const shareCurrent = (channel: "wa" | "mail" | "copy") => {
    const text = buildAgendaText(data.agendaMeta, data.agenda, lang);
    share(text, channel, t("agendaShareHeader"), () => showToast(t("copied")));
  };

  return (
    <div className="flex flex-col gap-3">
      <Card className="p-4">
        <h2 className="font-display text-lg font-semibold text-deep-water">
          {t("agendaTitle")}
        </h2>
        <p className="mt-0.5 text-[13px] text-muted-2">{t("agendaSub")}</p>

        <div className="mt-3 flex flex-wrap gap-2">
          <label className="flex-1 min-w-[140px]">
            <span className="mb-1 block text-[11px] font-bold text-muted-2 uppercase">
              {t("meetingDate")}
            </span>
            <input
              type="date"
              value={data.agendaMeta.date}
              onChange={(e) => apply((d) => actions.updateAgendaDate(d, e.target.value))}
              className="w-full rounded-[7px] border border-line-card bg-linen px-2.5 py-2.5 text-sm"
            />
          </label>
          <label className="flex-1 min-w-[110px]">
            <span className="mb-1 block text-[11px] font-bold text-muted-2 uppercase">
              {t("meetingTime")}
            </span>
            <input
              type="time"
              value={data.agendaMeta.time}
              onChange={(e) => apply((d) => actions.updateAgendaTime(d, e.target.value))}
              className="w-full rounded-[7px] border border-line-card bg-linen px-2.5 py-2.5 text-sm"
            />
          </label>
        </div>

        <div className="mt-3.5">
          {data.agenda.length === 0 ? (
            <EmptyState>—</EmptyState>
          ) : (
            data.agenda.map((it, i) => (
              <AgendaRow
                key={i}
                item={it}
                onToggle={() => apply((d) => actions.toggleAgendaItem(d, i))}
                onRemove={() => apply((d) => actions.removeAgendaItem(d, i))}
                onRespChange={(v) => apply((d) => actions.updateAgendaResp(d, i, v))}
                respPh={t("respPh")}
              />
            ))
          )}
        </div>

        <div className="mt-2.5 flex flex-wrap gap-1.5">
          <input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addItem()}
            placeholder={t("addItem")}
            className="min-w-[120px] flex-1 rounded-[7px] border border-line-card bg-linen px-2.5 py-2.5 text-sm"
          />
          <input
            value={newResp}
            onChange={(e) => setNewResp(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addItem()}
            placeholder={t("respPh")}
            style={{ width: respWidth(newResp) }}
            className="rounded-[6px] border border-line-card bg-linen px-2 py-1.5 text-xs"
          />
          <button
            type="button"
            onClick={addItem}
            className="rounded-[7px] bg-living-teal px-4 text-lg text-white"
          >
            +
          </button>
        </div>

        <div className="mt-3.5 flex flex-wrap gap-2">
          <button type="button" onClick={() => shareCurrent("wa")} className="flex-1 min-w-[96px] rounded-lg bg-sage px-2.5 py-2.5 text-[13px] font-bold text-white">
            {t("shareWA")}
          </button>
          <button type="button" onClick={() => shareCurrent("mail")} className="flex-1 min-w-[96px] rounded-lg bg-water-mid px-2.5 py-2.5 text-[13px] font-bold text-white">
            {t("shareEmail")}
          </button>
          <button type="button" onClick={() => shareCurrent("copy")} className="flex-1 min-w-[96px] rounded-lg bg-amber px-2.5 py-2.5 text-[13px] font-bold text-white">
            {t("shareCopy")}
          </button>
        </div>

        <Button
          variant="accent"
          className="mt-3 w-full"
          onClick={() => {
            apply((d) => actions.newMeeting(d));
            showToast(t("archived"));
          }}
        >
          {t("newMeeting")}
        </Button>
      </Card>

      <Card className="p-4">
        <h2 className="text-sm font-semibold text-deep-water">{t("historyAgendaTitle")}</h2>
        {data.agendaHistory.length === 0 ? (
          <EmptyState>{t("noHistoryAgenda")}</EmptyState>
        ) : (
          data.agendaHistory
            .slice()
            .reverse()
            .map((h, idx) => (
              <AgendaHistoryRow
                key={idx}
                meta={{ date: h.date, time: h.time }}
                items={h.items}
                itemsDoneOfLabel={t("itemsDoneOf")}
                lang={lang}
                onShare={(channel) => {
                  const text = buildAgendaText({ date: h.date, time: h.time }, h.items, lang);
                  share(text, channel, t("agendaShareHeader"), () => showToast(t("copied")));
                }}
                shareWA={t("shareWA")}
                shareEmail={t("shareEmail")}
                shareCopy={t("shareCopy")}
              />
            ))
        )}
      </Card>
    </div>
  );
}

function AgendaRow({
  item,
  onToggle,
  onRemove,
  onRespChange,
  respPh,
}: {
  item: AgendaItem;
  onToggle: () => void;
  onRemove: () => void;
  onRespChange: (v: string) => void;
  respPh: string;
}) {
  const [resp, setResp] = useState(item.resp);
  return (
    <div className="grid grid-cols-[22px_1fr_auto] items-center gap-2 border-b border-dashed border-line-card py-2.5 text-[15px] last:border-b-0">
      <input type="checkbox" checked={item.done} onChange={onToggle} className="h-[19px] w-[19px] accent-sage" />
      <span className={`min-w-0 overflow-hidden text-ellipsis whitespace-nowrap ${item.done ? "text-muted line-through" : ""}`}>
        {item.text}
      </span>
      <div className="flex items-center gap-1.5 justify-self-end">
        <input
          value={resp}
          onChange={(e) => setResp(e.target.value)}
          onBlur={() => onRespChange(resp)}
          placeholder={respPh}
          style={{ width: respWidth(resp) }}
          className="rounded-[6px] border border-line-card bg-linen px-2 py-1.5 text-xs text-water-mid focus:border-living-teal focus:bg-white focus:outline-none"
        />
        <span onClick={onRemove} className="cursor-pointer text-sm font-bold text-rojo opacity-60 hover:opacity-100">
          ✕
        </span>
      </div>
    </div>
  );
}

function AgendaHistoryRow({
  meta,
  items,
  itemsDoneOfLabel,
  lang,
  onShare,
  shareWA,
  shareEmail,
  shareCopy,
}: {
  meta: AgendaMeta;
  items: AgendaItem[];
  itemsDoneOfLabel: string;
  lang: ReturnType<typeof useLang>;
  onShare: (channel: "wa" | "mail" | "copy") => void;
  shareWA: string;
  shareEmail: string;
  shareCopy: string;
}) {
  const [open, setOpen] = useState(false);
  const doneCount = items.filter((x) => x.done).length;
  return (
    <div className="flex gap-3 border-t border-dashed border-line-card py-3 first:border-t-0">
      <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-dawn-coral text-center text-[10px] font-bold text-dawn-coral">
        {fmtDateOnly(meta.date, lang)}
      </div>
      <div className="flex-1">
        <div className="font-bold text-deep-water">
          {fmtDateOnly(meta.date, lang)}
          {meta.time ? ` · ${meta.time}` : ""}
        </div>
        <div className="text-[13px] text-muted-2">
          {doneCount}/{items.length} {itemsDoneOfLabel}
        </div>
        <button type="button" onClick={() => setOpen((v) => !v)} className="mt-1 text-xs font-bold text-water-mid">
          {open ? "▲" : "▼"} {shareWA} / {shareEmail} / {shareCopy}
        </button>
        {open ? (
          <div className="mt-1.5 flex gap-2">
            <button type="button" onClick={() => onShare("wa")} className="rounded-md bg-sage px-2.5 py-1.5 text-xs font-bold text-white">
              {shareWA}
            </button>
            <button type="button" onClick={() => onShare("mail")} className="rounded-md bg-water-mid px-2.5 py-1.5 text-xs font-bold text-white">
              {shareEmail}
            </button>
            <button type="button" onClick={() => onShare("copy")} className="rounded-md bg-amber px-2.5 py-1.5 text-xs font-bold text-white">
              {shareCopy}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
