const PBKDF2_ITERATIONS = 120_000;

export class DecryptionError extends Error {
  constructor(message = "No se pudo descifrar el registro. La contraseña podría ser incorrecta.") {
    super(message);
    this.name = "DecryptionError";
  }
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array<ArrayBuffer> {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/**
 * Deriva una CryptoKey AES-GCM no-extraíble a partir del password del
 * usuario + su salt. No-extraíble: el material de la clave nunca puede
 * salir como bytes hacia JS, incluso si el objeto CryptoKey se persiste
 * en IndexedDB (ver lib/keyStore.ts).
 */
export async function deriveKey(
  password: string,
  saltBase64: string
): Promise<CryptoKey> {
  const baseKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: base64ToBytes(saltBase64),
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptRecord(
  data: object,
  key: CryptoKey
): Promise<{ ciphertext: string; iv: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = new TextEncoder().encode(JSON.stringify(data));
  const cipherBuf = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    plaintext
  );
  return {
    ciphertext: bytesToBase64(new Uint8Array(cipherBuf)),
    iv: bytesToBase64(iv),
  };
}

export async function decryptRecord(
  ciphertext: string,
  iv: string,
  key: CryptoKey
): Promise<unknown> {
  try {
    const plainBuf = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: base64ToBytes(iv) },
      key,
      base64ToBytes(ciphertext)
    );
    return JSON.parse(new TextDecoder().decode(plainBuf));
  } catch {
    // AES-GCM falla la verificación de tag con password incorrecto o dato
    // dañado — ambos casos se ven iguales desde aquí, así que el mensaje
    // no distingue entre ellos.
    throw new DecryptionError();
  }
}
