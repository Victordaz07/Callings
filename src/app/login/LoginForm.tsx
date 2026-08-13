"use client";

import { useActionState } from "react";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { authenticate } from "./actions";

export function LoginForm() {
  const [error, formAction, isPending] = useActionState(
    authenticate,
    undefined
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <TextField
        label="Correo"
        name="email"
        type="email"
        autoComplete="email"
        required
        placeholder="tucorreo@ejemplo.com"
      />
      <TextField
        label="Código de acceso"
        name="passcode"
        type="password"
        autoComplete="current-password"
        required
        error={error}
      />
      <Button type="submit" variant="accent" disabled={isPending}>
        {isPending ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
