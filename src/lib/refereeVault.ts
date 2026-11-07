import type { AuthSession } from "@/lib/supabaseAuth";
import { requestSupabase } from "@/lib/supabaseAuth";

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
const ITERATIONS = 600_000;
const encoder = new TextEncoder();
const decoder = new TextDecoder();

type StoredVault = { salt: string; iv: string; ciphertext: string; iterations?: number };
type VaultRow = StoredVault & { user_id: string };

const toBase64 = (bytes: Uint8Array) => {
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
};
const fromBase64 = (value: string) => {
  const binary = atob(value);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
};

const safeLocalGet = (key: string): string | null => {
  try { return typeof localStorage === "undefined" ? null : localStorage.getItem(key); }
  catch { return null; }
};
const safeLocalSet = (key: string, value: string) => {
  try { if (typeof localStorage !== "undefined") localStorage.setItem(key, value); }
  catch { /* Cloud storage remains authoritative when local cache is unavailable. */ }
};
const safeLocalRemove = (key: string) => {
  try { if (typeof localStorage !== "undefined") localStorage.removeItem(key); }
  catch { /* The cloud deletion remains authoritative. */ }
};

const deriveKey = async (password: string, salt: Uint8Array<ArrayBuffer>, iterations = 120_000) => {
  const material = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
};

const encryptVault = async (referees: Referee[], password: string): Promise<StoredVault> => {
  if (password.length < 8) throw new Error("A vault password with at least 8 characters is required.");
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt, ITERATIONS);
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(JSON.stringify(referees)));
  return { salt: toBase64(salt), iv: toBase64(iv), ciphertext: toBase64(new Uint8Array(ciphertext)), iterations: ITERATIONS };
};

const decryptVault = async (stored: StoredVault, password: string): Promise<Referee[]> => {
  const key = await deriveKey(password, fromBase64(stored.salt), stored.iterations ?? 120_000);
  const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromBase64(stored.iv) }, key, fromBase64(stored.ciphertext));
  const parsed: unknown = JSON.parse(decoder.decode(plaintext));
  if (!Array.isArray(parsed)) throw new Error("The encrypted vault has an invalid format.");
  return parsed as Referee[];
};

const cloudVaultPath = (userId: string) =>
  `/rest/v1/private_referee_vaults?select=salt,iv,ciphertext,iterations&user_id=eq.${encodeURIComponent(userId)}&limit=1`;

export const hasRefereeVault = (userId?: string) => {
  if (typeof window === "undefined") return false;
  return Boolean(safeLocalGet(refereeVaultStorageKey(userId)));
};

export const saveRefereeVault = async (referees: Referee[], password: string, userId?: string) => {
  const stored = await encryptVault(referees, password);
  safeLocalSet(refereeVaultStorageKey(userId), JSON.stringify(stored));
};

export const unlockRefereeVault = async (password: string, userId?: string): Promise<Referee[]> => {
  const raw = safeLocalGet(refereeVaultStorageKey(userId));
  if (!raw) return [];
  try { return await decryptVault(JSON.parse(raw) as StoredVault, password); }
  catch { throw new Error("Unable to unlock the referee vault. Check the password."); }
};

export const clearRefereeVault = (userId?: string) => {
  safeLocalRemove(refereeVaultStorageKey(userId));
  if (!userId) safeLocalRemove(STORAGE_KEY);
};

/** Encrypted end-to-end before upload; the server stores ciphertext only. */
export const hasRefereeVaultForSession = async (session: AuthSession): Promise<boolean> => {
  const rows = await requestSupabase<VaultRow[]>(cloudVaultPath(session.user.id), { accessToken: session.access_token });
  if (rows.length) return true;
  return hasRefereeVault(session.user.id);
};

export const saveRefereeVaultForSession = async (referees: Referee[], password: string, session: AuthSession) => {
  const stored = await encryptVault(referees, password);
  await requestSupabase<unknown>(
    "/rest/v1/private_referee_vaults?on_conflict=user_id",
    {
      method: "POST",
      accessToken: session.access_token,
      prefer: "resolution=merge-duplicates,return=minimal",
      body: { user_id: session.user.id, ...stored, updated_at: new Date().toISOString() },
    },
  );
  // Keep an encrypted device cache for resilience; it is never used across user IDs.
  safeLocalSet(refereeVaultStorageKey(session.user.id), JSON.stringify(stored));
};

export const unlockRefereeVaultForSession = async (password: string, session: AuthSession): Promise<Referee[]> => {
  const rows = await requestSupabase<VaultRow[]>(cloudVaultPath(session.user.id), { accessToken: session.access_token });
  const stored = rows[0] ?? (() => {
    const raw = safeLocalGet(refereeVaultStorageKey(session.user.id));
    return raw ? JSON.parse(raw) as StoredVault : null;
  })();
  if (!stored) return [];
  let referees: Referee[];
  try { referees = await decryptVault(stored, password); }
  catch { throw new Error("Unable to unlock the referee vault. Check the password."); }
  // Migrate an older device-only encrypted vault into the authenticated cloud vault.
  if (!rows.length) await saveRefereeVaultForSession(referees, password, session);
  return referees;
};

export const clearRefereeVaultForSession = async (session: AuthSession) => {
  await requestSupabase<unknown>(
    `/rest/v1/private_referee_vaults?user_id=eq.${encodeURIComponent(session.user.id)}`,
    { method: "DELETE", accessToken: session.access_token },
  );
  clearRefereeVault(session.user.id);
};
