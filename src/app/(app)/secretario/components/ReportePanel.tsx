"use client";

import { Card } from "@/components/ui/Card";
import { useSecretarioStore } from "@/lib/secretario/store";
import { useT } from "@/lib/secretario/useT";
import { buildReportText } from "@/lib/secretario/report";

export function ReportePanel() {
  const t = useT();
  const data = useSecretarioStore((s) => s.data);
  const showToast = useSecretarioStore((s) => s.showToast);
  const text = buildReportText(data);

  return (
    <Card className="p-4">
      <h2 className="font-display text-lg font-semibold text-deep-water">{t("reportTitle")}</h2>
      <p className="mt-0.5 text-[13px] text-muted-2">{t("reportSub")}</p>
      <pre className="mt-3.5 whitespace-pre-wrap rounded-[10px] border border-dashed border-line-card bg-linen-dim p-3.5 font-sans text-[13px] leading-relaxed text-ink">
        {text}
      </pre>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard.writeText(text).then(() => showToast(t("copied")));
        }}
        className="mt-2.5 rounded-lg bg-amber px-4 py-2.5 text-[13px] font-bold text-white"
      >
        {t("copyReport")}
      </button>
    </Card>
  );
}
