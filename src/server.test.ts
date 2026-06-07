import { describe, expect, it } from "vitest";
import * as ed25519 from "@noble/ed25519";
import { etc as edEtc, getPublicKeyAsync, signAsync, utils as edUtils } from "@noble/ed25519";
import { sha256, sha512 } from "@noble/hashes/sha2";
import { bytesToHex } from "@noble/hashes/utils";

import { buildApp } from "./server.js";
import { canonicalize } from "./crypto.js";

edEtc.sha512Sync = (...messages: Uint8Array[]) => {
  const h = sha512.create();
  for (const m of messages) h.update(m);
  return h.digest();
};

async function makeDevice() {
  const secret = edUtils.randomPrivateKey();
  const pk = await getPublicKeyAsync(secret);
  const did = `did:sentinel:${bytesToHex(sha256(pk))}`;
  return { secret, publicKeyHex: bytesToHex(pk), did };
}

describe("sentinel-cloud server", () => {
  it("healthz responds", async () => {
    const app = buildApp();
    const res = await app.inject({ method: "GET", url: "/healthz" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: "ok" });
    await app.close();
  });

  it("rejects malformed device registration", async () => {
    const app = buildApp();
    const res = await app.inject({
      method: "POST",
      url: "/v1/devices",
      payload: { did: "nope", public_key_hex: "zz" },
    });
    expect(res.statusCode).toBe(400);
    await app.close();
  });

  it("registers a device and reports trust", async () => {
    const app = buildApp();
    const device = await makeDevice();
    const reg = await app.inject({
      method: "POST",
      url: "/v1/devices",
      payload: { did: device.did, public_key_hex: device.publicKeyHex },
    });
    expect(reg.statusCode).toBe(201);

    const trust = await app.inject({
      method: "GET",
      url: `/v1/devices/${encodeURIComponent(device.did)}/trust`,
    });
    expect(trust.statusCode).toBe(200);
    const body = trust.json();
    expect(body.level).toBe("medium");
    expect(body.score).toBeGreaterThanOrEqual(50);
    await app.close();
  });

  it("verifies a signed attestation end-to-end", async () => {
    const app = buildApp();
    const device = await makeDevice();
    await app.inject({
      method: "POST",
      url: "/v1/devices",
      payload: { did: device.did, public_key_hex: device.publicKeyHex },
    });

    const claimBody = {
      kind: "firmware_hash" as const,
      subject: device.did,
      issued_at: new Date().toISOString(),
      nonce: "1",
      payload: { sha256: "abc" },
    };
    const preimage = new TextEncoder().encode(canonicalize(claimBody));
    const sig = await signAsync(preimage, device.secret);

    const res = await app.inject({
      method: "POST",
      url: "/v1/attestations",
      payload: {
        body: claimBody,
        signature_hex: bytesToHex(sig),
        public_key_hex: device.publicKeyHex,
      },
    });
    expect(res.statusCode).toBe(202);
    expect(res.json().accepted).toBe(true);

    const audit = await app.inject({
      method: "GET",
      url: `/v1/audit/${encodeURIComponent(device.did)}`,
    });
    expect(audit.statusCode).toBe(200);
    expect(audit.json().entries.length).toBe(1);
    await app.close();
  });

  it("rejects a tampered claim", async () => {
    const app = buildApp();
    const device = await makeDevice();
    await app.inject({
      method: "POST",
      url: "/v1/devices",
      payload: { did: device.did, public_key_hex: device.publicKeyHex },
    });

    const claimBody = {
      kind: "firmware_hash" as const,
      subject: device.did,
      issued_at: new Date().toISOString(),
      nonce: "1",
      payload: { sha256: "abc" },
    };
    const preimage = new TextEncoder().encode(canonicalize(claimBody));
    const sig = await signAsync(preimage, device.secret);

    const res = await app.inject({
      method: "POST",
      url: "/v1/attestations",
      payload: {
        body: { ...claimBody, payload: { sha256: "tampered" } },
        signature_hex: bytesToHex(sig),
        public_key_hex: device.publicKeyHex,
      },
    });
    expect(res.statusCode).toBe(400);
    await app.close();
  });

  // Silence the unused-import warning that crops up in some environments.
  void ed25519;
});
