"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useSecretarioStore } from "@/lib/secretario/store";
import { useT, useLang } from "@/lib/secretario/useT";
import { fmtDateOnly } from "@/lib/secretario/format";
import * as actions from "@/lib/secretario/actions";
import { EmptyState } from "./shared";

export function ConsejoPanel() {
  const t = useT();
  const lang = useLang();
  const data = useSecretarioStore((s) => s.data);
  const apply = useSecretarioStore((s) => s.apply);
  const showToast = useSecretarioStore((s) => s.showToast);
  const [newItem, setNewItem] = useState("");
  const [notas, setNotas] = useState(data.consejo.current.notas);

  const cur = data.consejo.current;

  return (
    <div className="flex flex-col gap-3">
      <Card className="p-4">
        <h2 className="font-display text-lg font-semibold text-deep-water">{t("consejoTitle")}</h2>
        <p className="mt-0.5 text-[13px] text-muted-2">{t("consejoSub")}</p>

        <div className="mt-3 flex flex-wrap gap-2">
          <label className="flex-1 min-w-[140px]">
            <span className="mb-1 block text-[11px] font-bold text-muted-2 uppercase">{t("meetingDate")}</span>
            <input
              type="date"
              value={cur.date}
              onChange={(e) => apply((d) => actions.updateConsejoDate(d, e.target.value))}
              className="w-full rounded-[7px] border border-line-card bg-linen px-2.5 py-2.5 text-sm"
            />
          </label>
          <label className="flex-1 min-w-[110px]">
            <span className="mb-1 block text-[11px] font-bold text-muted-2 uppercase">{t("meetingTime")}</span>
            <input
              type="time"
              value={cur.time}
              onChange={(e) => apply((d) => actions.updateConsejoTime(d, e.target.value))}
              className="w-full rounded-[7px] border border-line-card bg-linen px-2.5 py-2.5 text-sm"
            />
          </label>
        </div>

        <div className="mt-3.5">
          {cur.items.length === 0 ? (
            <EmptyState>—</EmptyState>
          ) : (
            cur.items.map((it, i) => (
              <div key={i} className={`grid grid-cols-[22px_1fr_auto] items-center gap-2 border-b border-dashed border-line-card py-2.5 text-[15px] last:border-b-0 ${it.done ? "opacity-70" : ""}`}>
                <input
                  type="checkbox"
                  checked={it.done}
                  onChange={() => apply((d) => actions.toggleConsejoItem(d, i))}
                  className="h-[19px] w-[19px] accent-sage"
                />
                <span className={it.done ? "text-muted line-through" : ""}>{it.text}</span>
                <span
                  onClick={() => apply((d) => actions.removeConsejoItem(d, i))}
                  className="cursor-pointer justify-self-end text-sm font-bold text-rojo opacity-60 hover:opacity-100"
                >
                  ✕
                </span>
              </div>
            ))
          )}
        </div>

        <div className="mt-2.5 flex gap-1.5">
          <input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newItem.trim()) {
                apply((d) => actions.addConsejoItem(d, newItem));
                setNewItem("");
              }
            }}
            placeholder={t("consejoAddItem")}
            className="min-w-[120px] flex-1 rounded-[7px] border border-line-card bg-linen px-2.5 py-2.5 text-sm"
          />
          <button
            type="button"
            onClick={() => {
              if (!newItem.trim()) return;
              apply((d) => actions.addConsejoItem(d, newItem));
              setNewItem("");
            }}
            className="rounded-[7px] bg-living-teal px-4 text-lg text-white"
          >
            +
          </button>
        </div>

        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          onBlur={() => apply((d) => actions.updateConsejoNotas(d, notas))}
          placeholder={t("consejoNotasPh")}
          className="mt-3 min-h-[80px] w-full rounded-lg border border-line-card bg-linen p-3 text-sm text-ink focus:border-living-teal focus:bg-white focus:outline-none"
        />

        <Button
          variant="accent"
          className="mt-3 w-full"
          onClick={() => {
            apply((d) => actions.archiveConsejo(d));
            setNotas("");
            showToast(t("consejoArchived"));
          }}
        >
          {t("archiveConsejo")}
        </Button>
      </Card>

      <Card className="p-4">
        <h2 className="text-sm font-semibold text-deep-water">{t("consejoHistoryTitle")}</h2>
        {data.consejo.history.length === 0 ? (
          <EmptyState>{t("noConsejoHistory")}</EmptyState>
        ) : (
          data.consejo.history
            .slice()
            .reverse()
            .map((h, idx) => {
              const presentCount = h.items.filter((it) => it.done).length;
              return (
                <div key={idx} className="flex gap-3 border-t border-dashed border-line-card py-3 first:border-t-0">
                  <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-dawn-coral text-center text-[10px] font-bold text-dawn-coral">
                    {fmtDateOnly(h.date, lang)}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-deep-water">
                      {fmtDateOnly(h.date, lang)}
                      {h.time ? ` · ${h.time}` : ""}
                    </div>
                    <div className="my-0.5 text-[13px] text-muted-2">
                      {presentCount}/{h.items.length} {t("presentesOf")}
                    </div>
                    {h.notas ? <div className="whitespace-pre-wrap text-sm text-ink">{h.notas}</div> : null}
                  </div>
                </div>
              );
            })
        )}
      </Card>
    </div>
  );
}
