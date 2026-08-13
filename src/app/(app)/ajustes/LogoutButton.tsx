"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { useEncryptionKey } from "@/components/EncryptionKeyProvider";

export function LogoutButton() {
  const { lock } = useEncryptionKey();
  const [isPending, setIsPending] = useState(false);

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={async () => {
        setIsPending(true);
        // Borra la clave local antes de cerrar sesión — sin esto, la
        // CryptoKey persistida en IndexedDB seguiría "desbloqueada" para
        // quien abra el navegador después, aunque la sesión ya no exista.
        await lock();
        await signOut({ redirectTo: "/login" });
      }}
      className="w-full py-3 text-center text-sm font-bold text-rojo disabled:opacity-60"
    >
      {isPending ? "Cerrando sesión…" : "Cerrar sesión"}
    </button>
  );
}
