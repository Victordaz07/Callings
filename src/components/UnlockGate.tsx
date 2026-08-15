"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useEncryptionKey } from "@/components/EncryptionKeyProvider";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";

export function UnlockGate({ children }: { children: ReactNode }) {
  const { status, unlock } = useEncryptionKey();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, setIsPending] = useState(false);

  if (status === "loading") {
    return (
      <div className="flex min-h-svh items-center justify-center text-sm text-muted-2">
        …
      </div>
    );
  }

  if (status === "locked") {
    const onSubmit = async (e: FormEvent) => {
      e.preventDefault();
      setIsPending(true);
      setError(undefined);
      try {
        await unlock(password);
      } catch {
        setError("No se pudo desbloquear. Intenta de nuevo.");
      } finally {
        setIsPending(false);
      }
    };

    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-linen px-6">
        <div className="text-center">
          <h1 className="font-display text-2xl font-semibold text-deep-water">
            Desbloquear
          </h1>
          <p className="mt-1 text-sm text-muted-2">
            Escribe tu contraseña para descifrar tus datos en este
            dispositivo.
          </p>
        </div>
        <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-4">
          <TextField
            label="Contraseña"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error}
            required
          />
          <Button type="submit" variant="accent" disabled={isPending}>
            {isPending ? "Desbloqueando…" : "Desbloquear"}
          </Button>
        </form>
      </div>
    );
  }

  return <>{children}</>;
}
