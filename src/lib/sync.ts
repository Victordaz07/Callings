import { decryptRecord, DecryptionError, encryptRecord } from "./crypto";
import {
  getLocalRecords,
  getPendingSyncRecords,
  markSynced,
  putLocalRecord,
  type LocalRecord,
} from "./localRecords";

type ServerRecord = {
  moduleId: string;
  recordKey: string;
  ciphertext: string;
  iv: string;
  deleted: boolean;
  updatedAt: string;
};

function mostRecentUpdatedAt(records: LocalRecord[]): string | undefined {
  return records
    .map((r) => r.updatedAt)
    .sort()
    .at(-1);
}

/**
 * Trae los cambios del servidor y los aplica a IndexedDB — last-write-wins
 * por `updatedAt`, sin merge de campos. Si el registro local es igual o
 * más nuevo que el del servidor, se ignora el remoto (evita pisar un
 * cambio local con algo más viejo). Incremental: solo pide lo que cambió
 * después del registro local más reciente que ya tenemos.
 */
export async function syncPull(moduleId: string, key: CryptoKey): Promise<number> {
  const local = await getLocalRecords(moduleId);
  const since = mostRecentUpdatedAt(local);

  const url = new URL("/api/records", window.location.origin);
  url.searchParams.set("moduleId", moduleId);
  if (since) url.searchParams.set("since", since);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`syncPull falló (${res.status})`);
  const { records } = (await res.json()) as { records: ServerRecord[] };

  let applied = 0;
  for (const remote of records) {
    const existing = local.find((r) => r.recordKey === remote.recordKey);
    if (existing && new Date(existing.updatedAt) >= new Date(remote.updatedAt)) {
      continue; // lo local ya es igual o más nuevo
    }

    if (remote.deleted) {
      await putLocalRecord({
        moduleId,
        recordKey: remote.recordKey,
        data: existing?.data ?? null,
        deleted: true,
        updatedAt: remote.updatedAt,
        syncedAt: new Date().toISOString(),
        pendingSync: false,
      });
      applied++;
      continue;
    }

    try {
      const data = await decryptRecord(remote.ciphertext, remote.iv, key);
      await putLocalRecord({
        moduleId,
        recordKey: remote.recordKey,
        data,
        deleted: false,
        updatedAt: remote.updatedAt,
        syncedAt: new Date().toISOString(),
        pendingSync: false,
      });
      applied++;
    } catch (err) {
      if (err instanceof DecryptionError) {
        // Registro cifrado con una contraseña/clave distinta (p. ej. la
        // contraseña cambió en otro dispositivo y este todavía no se
        // re-desbloqueó con la nueva) — se salta en vez de tumbar el pull
        // completo; el resto de los registros sí se aplican.
        continue;
      }
      throw err;
    }
  }

  return applied;
}

// El servidor hace upsert ciego (nunca compara `updatedAt` del cliente,
// porque no lo guarda — usa su propio timestamp de escritura). Si dos
// pushes del mismo registro quedan en vuelo a la vez, pueden llegar
// desordenados y el más viejo pisar al más nuevo. Se serializan por
// [moduleId, recordKey] para que el servidor siempre reciba los pushes de
// un mismo registro en el mismo orden en que se generaron localmente.
const pushQueues = new Map<string, Promise<void>>();

/** Envía un registro local al servidor. No bloquea: quien la llama decide si espera o no. */
export function syncPush(key: CryptoKey, record: LocalRecord): Promise<void> {
  const qKey = `${record.moduleId}:${record.recordKey}`;
  const prev = pushQueues.get(qKey) ?? Promise.resolve();
  const run = prev.catch(() => {}).then(() => pushRecord(key, record));
  pushQueues.set(qKey, run);
  run.catch(() => {}).finally(() => {
    if (pushQueues.get(qKey) === run) pushQueues.delete(qKey);
  });
  return run;
}

async function pushRecord(key: CryptoKey, record: LocalRecord): Promise<void> {
  if (record.deleted) {
    const res = await fetch("/api/records", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moduleId: record.moduleId, recordKey: record.recordKey }),
    });
    if (!res.ok && res.status !== 404) {
      throw new Error(`syncPush (delete) falló (${res.status})`);
    }
  } else {
    const { ciphertext, iv } = await encryptRecord(record.data as object, key);
    const res = await fetch("/api/records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        moduleId: record.moduleId,
        recordKey: record.recordKey,
        ciphertext,
        iv,
      }),
    });
    if (!res.ok) throw new Error(`syncPush falló (${res.status})`);
  }

  await markSynced(record.moduleId, record.recordKey, new Date().toISOString());
}

/**
 * Reintenta todo lo que quedó pendiente (se llama al reconectar — ver
 * useSyncModule). Seguir adelante con lo demás si un registro individual
 * falla, en vez de abortar todo el lote.
 */
export async function pushPendingRecords(
  key: CryptoKey
): Promise<{ pushed: number; failed: number }> {
  const pending = await getPendingSyncRecords();
  let pushed = 0;
  let failed = 0;
  for (const record of pending) {
    try {
      await syncPush(key, record);
      pushed++;
    } catch {
      failed++;
    }
  }
  return { pushed, failed };
}

