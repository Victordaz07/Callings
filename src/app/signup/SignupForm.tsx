"use client";

import { useActionState } from "react";
import Link from "next/link";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { signup } from "./actions";

export function SignupForm() {
  const [error, formAction, isPending] = useActionState(signup, undefined);

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
        label="Contraseña"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
      />
      <TextField
        label="Confirma tu contraseña"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        error={error}
      />
      <Button type="submit" variant="accent" disabled={isPending}>
        {isPending ? "Creando cuenta…" : "Crear cuenta"}
      </Button>
      <p className="text-center text-sm text-muted-2">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-bold text-water-mid">
          Entra aquí
        </Link>
      </p>
    </form>
  );
}
