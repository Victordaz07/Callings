"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { deriveKey } from "@/lib/crypto";
import { clearStoredKey, loadStoredKey, storeKey } from "@/lib/keyStore";

type Status = "loading" | "locked" | "unlocked";

type EncryptionKeyContextValue = {
  status: Status;
  key: CryptoKey | null;
  unlock: (password: string) => Promise<void>;
  lock: () => Promise<void>;
};

const EncryptionKeyContext = createContext<EncryptionKeyContextValue | null>(
  null
);

export function EncryptionKeyProvider({
  kdfSalt,
  children,
}: {
  kdfSalt: string;
  children: ReactNode;
}) {
  const [status, setStatus] = useState<Status>("loading");
  const [key, setKey] = useState<CryptoKey | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadStoredKey().then((stored) => {
      if (cancelled) return;
      if (stored) {
        setKey(stored);
        setStatus("unlocked");
      } else {
        setStatus("locked");
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const unlock = useCallback(
    async (password: string) => {
      const derived = await deriveKey(password, kdfSalt);
      await storeKey(derived);
      setKey(derived);
      setStatus("unlocked");
    },
    [kdfSalt]
  );

  const lock = useCallback(async () => {
    await clearStoredKey();
    setKey(null);
    setStatus("locked");
  }, []);

  return (
    <EncryptionKeyContext.Provider value={{ status, key, unlock, lock }}>
      {children}
    </EncryptionKeyContext.Provider>
  );
}

export function useEncryptionKey() {
  const ctx = useContext(EncryptionKeyContext);
  if (!ctx) {
    throw new Error(
      "useEncryptionKey debe usarse dentro de <EncryptionKeyProvider>"
    );
  }
  return ctx;
}
