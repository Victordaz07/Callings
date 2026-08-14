import { openDB, type DBSchema, type IDBPDatabase } from "idb";

/**
 * Caché local offline-first para registros cifrados. Guarda el objeto ya
 * DESCIFRADO (para que la UI lo use de inmediato, sin volver a tocar
 * WebCrypto en cada render) más metadatos de sync — esta capa es la fuente
 * de verdad para la UI; el servidor es solo el respaldo/sync en segundo
 * plano (ver lib/sync.ts, Bloque 6).
 */
export type LocalRecord<T = unknown> = {
  moduleId: string;
  recordKey: string;
  data: T;
  deleted: boolean;
  updatedAt: string; // ISO — se compara con el updatedAt del servidor para last-write-wins
  syncedAt: string | null; // null = nunca se sincronizó con el servidor
  pendingSync: boolean; // true = hay cambios locales que el servidor todavía no tiene
};

// IndexedDB no puede indexar un valor `boolean` de forma portable, así que
// lo que se guarda en disco lleva un espejo numérico solo para ese índice.
// `LocalRecord` (el tipo público de este módulo) nunca expone ese detalle.
type StoredRecord = LocalRecord & { pendingSyncFlag: 0 | 1 };

interface RecordsDB extends DBSchema {
  records: {
    key: [string, string]; // [moduleId, recordKey]
    value: StoredRecord;
    indexes: { moduleId: string; pendingSyncFlag: number };
  };
}

const DB_NAME = "centro-servicio-records";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<RecordsDB>> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<RecordsDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore("records", {
          keyPath: ["moduleId", "recordKey"],
        });
        store.createIndex("moduleId", "moduleId");
        store.createIndex("pendingSyncFlag", "pendingSyncFlag");
      },
    });
  }
  return dbPromise;
}

function toStored(record: LocalRecord): StoredRecord {
  return { ...record, pendingSyncFlag: record.pendingSync ? 1 : 0 };
}

function fromStored(record: StoredRecord): LocalRecord {
  return {
    moduleId: record.moduleId,
    recordKey: record.recordKey,
    data: record.data,
    deleted: record.deleted,
    updatedAt: record.updatedAt,
    syncedAt: record.syncedAt,
    pendingSync: record.pendingSync,
  };
}

export async function getLocalRecords(moduleId: string): Promise<LocalRecord[]> {
  const db = await getDb();
  const rows = await db.getAllFromIndex("records", "moduleId", moduleId);
  return rows.map(fromStored);
}

export async function getLocalRecord(
  moduleId: string,
  recordKey: string
): Promise<LocalRecord | undefined> {
  const db = await getDb();
  const row = await db.get("records", [moduleId, recordKey]);
  return row ? fromStored(row) : undefined;
}

export async function putLocalRecord(record: LocalRecord): Promise<void> {
  const db = await getDb();
  await db.put("records", toStored(record));
}

/** Solo para uso interno del motor de sync tras confirmar borrado con el servidor. */
export async function hardDeleteLocalRecord(
  moduleId: string,
  recordKey: string
): Promise<void> {
  const db = await getDb();
  await db.delete("records", [moduleId, recordKey]);
}

export async function getPendingSyncRecords(): Promise<LocalRecord[]> {
  const db = await getDb();
  const rows = await db.getAllFromIndex("records", "pendingSyncFlag", 1);
  return rows.map(fromStored);
}

/** Crea o actualiza un registro local, marcándolo pendiente de sincronizar. */
export async function saveLocalRecord<T>(
  moduleId: string,
  recordKey: string,
  data: T
): Promise<LocalRecord<T>> {
  const record: LocalRecord<T> = {
    moduleId,
    recordKey,
    data,
    deleted: false,
    updatedAt: new Date().toISOString(),
    syncedAt: null,
    pendingSync: true,
  };
  await putLocalRecord(record);
  return record;
}

/** Soft-delete local — se sincroniza como borrado, nunca se pierde el historial de sync. */
export async function softDeleteLocalRecord(
  moduleId: string,
  recordKey: string
): Promise<void> {
  const existing = await getLocalRecord(moduleId, recordKey);
  if (!existing) return;
  await putLocalRecord({
    ...existing,
    deleted: true,
    updatedAt: new Date().toISOString(),
    pendingSync: true,
  });
}

/** Usado por el motor de sync tras un push/pull exitoso. */
export async function markSynced(
  moduleId: string,
  recordKey: string,
  syncedAt: string
): Promise<void> {
  const existing = await getLocalRecord(moduleId, recordKey);
  if (!existing) return;
  await putLocalRecord({ ...existing, syncedAt, pendingSync: false });
}
