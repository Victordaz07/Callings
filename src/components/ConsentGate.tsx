"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { acceptConsent } from "@/app/(app)/consent-actions";

export function ConsentGate({
  initialConsented,
  children,
}: {
  initialConsented: boolean;
  children: ReactNode;
}) {
  const [consented, setConsented] = useState(initialConsented);
  const [checked, setChecked] = useState(false);
  const [isPending, setIsPending] = useState(false);

  if (consented) return <>{children}</>;

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-linen px-6 py-10">
      <div className="w-full max-w-md rounded-[16px] border border-line-card bg-white p-6 shadow-lg">
        <h1 className="font-display text-xl font-semibold text-deep-water">
          Antes de empezar
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink">
          Esta aplicación es un <b>cuaderno de planificación personal</b> para
          líderes de la Iglesia. <b>No</b> es un sistema oficial de registro
          ni reemplaza LCR (Leader and Clerk Resources).
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ink">
          No ingreses información confidencial de membresía, financiera, ni
          de investigadores con nombre completo — usa iniciales o apodos.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ink">
          Tus datos se cifran en tu dispositivo antes de guardarse; ni los
          desarrolladores ni nadie más puede leerlos sin tu contraseña.
        </p>

        <label className="mt-5 flex items-start gap-2.5 text-sm text-ink">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-0.5 h-[19px] w-[19px] shrink-0 accent-living-teal"
          />
          Entiendo y acepto estos términos.
        </label>

        <Button
          type="button"
          variant="accent"
          className="mt-4 w-full"
          disabled={!checked || isPending}
          onClick={async () => {
            setIsPending(true);
            try {
              await acceptConsent();
              setConsented(true);
            } finally {
              setIsPending(false);
            }
          }}
        >
          {isPending ? "Guardando…" : "Aceptar y continuar"}
        </Button>
      </div>
    </div>
  );
}
