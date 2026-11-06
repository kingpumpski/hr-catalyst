export type Referee = {
  id: string;
  name: string;
  role: string;
  organization: string;
  relationship: string;
  email: string;
  phone: string;
  notes: string;
};

const STORAGE_KEY = "hr-catalyst-referee-vault-v1";
export const refereeVaultStorageKey = (userId?: string) => userId ? `${STORAGE_KEY}:${userId}` : STORAGE_KEY;
const ITERATIONS = 120_000;
const encoder = new TextEncoder();
const decoder = new TextDecoder();

type StoredVault = {
  salt: string;
  iv: string;
  ciphertext: string;
};

const toBase64 = (bytes: Uint8Array) => {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
};

const fromBase64 = (value: string) => {
  const binary = atob(value);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
};

const deriveKey = async (password: string, salt: Uint8Array<ArrayBuffer>) => {
  const material = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
};

export const hasRefereeVault = (userId?: string) => {
  if (typeof window === "undefined") return false;
  return Boolean(localStorage.getItem(refereeVaultStorageKey(userId)));
};

export const saveRefereeVault = async (referees: Referee[], password: string, userId?: string) => {
  if (!password) throw new Error("A vault password is required.");

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const plaintext = encoder.encode(JSON.stringify(referees));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext);

  const stored: StoredVault = {
    salt: toBase64(salt),
    iv: toBase64(iv),
    ciphertext: toBase64(new Uint8Array(ciphertext)),
  };

  localStorage.setItem(refereeVaultStorageKey(userId), JSON.stringify(stored));

};

export const unlockRefereeVault = async (password: string, userId?: string): Promise<Referee[]> => {
  const storageKey = refereeVaultStorageKey(userId);
  // Anonymous legacy vaults cannot be safely attributed to an authenticated owner.
  // Never import them automatically on shared browsers.
  const raw = localStorage.getItem(storageKey);
  if (!raw) return [];

  try {
    const stored = JSON.parse(raw) as StoredVault;
    const salt = fromBase64(stored.salt);
    const iv = fromBase64(stored.iv);
    const ciphertext = fromBase64(stored.ciphertext);
    const cryptoKey = await deriveKey(password, salt);
    const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, cryptoKey, ciphertext);
    const parsed = JSON.parse(decoder.decode(plaintext)) as Referee[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    throw new Error("Unable to unlock the referee vault. Check the password.");
  }
};

export const clearRefereeVault = (userId?: string) => {
  localStorage.removeItem(refereeVaultStorageKey(userId));
  if (!userId) localStorage.removeItem(STORAGE_KEY);
};
