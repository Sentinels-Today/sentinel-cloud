import { etc as edEtc, verifyAsync } from "@noble/ed25519";
import { sha256, sha512 } from "@noble/hashes/sha2";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils";

edEtc.sha512Sync = (...messages: Uint8Array[]) => {
  const h = sha512.create();
  for (const m of messages) h.update(m);
  return h.digest();
};

export const DID_PREFIX = "did:sentinel:";

export function didFromPublicKeyHex(publicKeyHex: string): string {
  return DID_PREFIX + bytesToHex(sha256(hexToBytes(publicKeyHex)));
}

export function parseDid(did: string): string {
  if (!did.startsWith(DID_PREFIX)) throw new Error(`bad DID: missing prefix`);
  const body = did.slice(DID_PREFIX.length);
  if (body.length !== 64) throw new Error(`bad DID: expected 64-hex body`);
  hexToBytes(body);
  return did;
}

export async function verifyHex(
  publicKeyHex: string,
  payload: Uint8Array,
  signatureHex: string,
): Promise<boolean> {
  const pk = hexToBytes(publicKeyHex);
  if (pk.length !== 32) return false;
  const sig = hexToBytes(signatureHex);
  if (sig.length !== 64) return false;
  try {
    return await verifyAsync(sig, payload, pk);
  } catch {
    return false;
  }
}

export function canonicalize(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalize(obj[k])}`).join(",")}}`;
}

export function sha256Hex(data: Uint8Array | string): string {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data;
  return bytesToHex(sha256(bytes));
}
