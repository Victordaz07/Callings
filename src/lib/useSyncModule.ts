"use client";

import { useCallback, useEffect, useState } from "react";
import { useEncryptionKey } from "@/components/EncryptionKeyProvider";
import {
  getLocalRecords,
  saveLocalRecord,
  softDeleteLocalRecord,
  updateLocalRecord,
  type LocalRecord,
} from "@/lib/localRecords";
import { pushPendingRecords, syncPull, syncPush } from "@/lib/sync";

/**
 * Hook que un módulo de datos (eq_ministracion, y los que sigan) usa para
 * leer/escribir sus registros: IndexedDB es la fuente de verdad para la
 * UI (se ve al instante, sin esperar red), y cada escritura dispara un
 * push en segundo plano. Al montar y al reconectar, hace un pull.
 */
export function useSyncModule<T>(moduleId: string) {
  const { key, status } = useEncryptionKey();
  const [records, setRecords] = useState<LocalRecord<T>[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const reloadFromLocal = useCallback(async () => {
    const local = (await getLocalRecords(moduleId)) as LocalRecord<T>[];
    setRecords(local);
  }, [moduleId]);

  const pull = useCallback(async () => {
    if (!key) return;
    setSyncing(true);
    try {
      await syncPull(moduleId, key);
      await reloadFromLocal();
    } finally {
      setSyncing(false);
    }
  }, [key, moduleId, reloadFromLocal]);

  // Carga inicial: IndexedDB primero (instantáneo), luego pull en segundo plano.
  useEffect(() => {
    if (status !== "unlocked" || !key) return;
    let cancelled = false;
    (async () => {
      await reloadFromLocal();
      if (cancelled) return;
      setLoaded(true);
      await pull();
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, key, moduleId]);

  // Al reconectar: reintenta lo pendiente de este y otros módulos, y vuelve a pull.
  useEffect(() => {
    if (!key) return;
    const onOnline = () => {
      pushPendingRecords(key)
        .then(() => pull())
        .catch(() => {});
    };
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [key, pull]);

  const save = useCallback(
    async (recordKey: string, data: T) => {
      const record = await saveLocalRecord(moduleId, recordKey, data);
      await reloadFromLocal();
      if (key && navigator.onLine) {
        void syncPush(key, record)
          .then(() => reloadFromLocal())
          .catch(() => {
            // queda pendingSync:true en IndexedDB; se reintenta al reconectar.
          });
      }
      return record;
    },
    [key, moduleId, reloadFromLocal]
  );

  /**
   * Aplica un patch parcial a un registro existente. A diferencia de
   * `save` (que espera el objeto completo), esto es seguro para llamadas
   * rápidas y solapadas a distintos campos del mismo registro: el merge
   * ocurre dentro de una transacción IDB atómica sobre el valor más
   * reciente en disco, no sobre un `record.data` capturado en un cierre de
   * React que podría estar desactualizado.
   */
  const update = useCallback(
    async (recordKey: string, patch: Partial<T>) => {
      const record = await updateLocalRecord<T>(moduleId, recordKey, patch);
      await reloadFromLocal();
      if (key && navigator.onLine) {
        void syncPush(key, record)
          .then(() => reloadFromLocal())
          .catch(() => {
            // queda pendingSync:true en IndexedDB; se reintenta al reconectar.
          });
      }
      return record;
    },
    [key, moduleId, reloadFromLocal]
  );

  const remove = useCallback(
    async (recordKey: string) => {
      await softDeleteLocalRecord(moduleId, recordKey);
      await reloadFromLocal();
      const record = records.find((r) => r.recordKey === recordKey);
      if (key && record && navigator.onLine) {
        void syncPush(key, { ...record, deleted: true })
          .then(() => reloadFromLocal())
          .catch(() => {});
      }
    },
    [key, moduleId, records, reloadFromLocal]
  );

  return {
    records: records.filter((r) => !r.deleted),
    allRecords: records,
    loaded,
    syncing,
    save,
    update,
    remove,
    refresh: pull,
  };
}
