import Fastify, { FastifyInstance } from "fastify";

import { canonicalize, parseDid, sha256Hex, verifyHex } from "./crypto.js";
import { FleetStore } from "./store.js";

export interface AppOptions {
  store?: FleetStore;
  logger?: boolean;
}

export function buildApp(opts: AppOptions = {}): FastifyInstance {
  const store = opts.store ?? new FleetStore();
  const app = Fastify({ logger: opts.logger ?? false });

  app.get("/healthz", async () => ({ status: "ok" }));

  app.get("/version", async () => ({ version: "0.1.0" }));

  app.post<{
    Body: { did: string; public_key_hex: string; metadata?: Record<string, unknown> };
  }>("/v1/devices", async (req, reply) => {
    const { did, public_key_hex, metadata } = req.body ?? ({} as Record<string, never>);
    if (!did || !public_key_hex) {
      return reply.code(400).send({ error: "did and public_key_hex required" });
    }
    try {
      parseDid(did);
    } catch (err) {
      return reply.code(400).send({ error: (err as Error).message });
    }
    if (!/^[0-9a-f]{64}$/i.test(public_key_hex)) {
      return reply.code(400).send({ error: "public_key_hex must be 64 hex chars" });
    }
    const rec = store.registerDevice({ did, public_key_hex, metadata });
    return reply.code(201).send({ did: rec.did, registered_at: rec.registered_at });
  });

  app.get<{ Params: { did: string } }>("/v1/devices/:did", async (req, reply) => {
    const rec = store.getDevice(req.params.did);
    if (!rec) return reply.code(404).send({ error: "device not found" });
    return rec;
  });

  app.get<{ Params: { did: string } }>("/v1/devices/:did/trust", async (req, reply) => {
    const score = store.computeTrust(req.params.did);
    if (!score) return reply.code(404).send({ error: "device not found" });
    return score;
  });

  app.post<{
    Body: {
      body: {
        kind: string;
        subject: string;
        issued_at: string;
        nonce: string;
        payload: unknown;
      };
      signature_hex: string;
      public_key_hex: string;
    };
  }>("/v1/attestations", async (req, reply) => {
    const claim = req.body;
    if (!claim?.body || !claim.signature_hex || !claim.public_key_hex) {
      return reply.code(400).send({ error: "malformed claim" });
    }
    const device = store.getDevice(claim.body.subject);
    if (!device) return reply.code(404).send({ error: "subject device not registered" });
    if (device.public_key_hex.toLowerCase() !== claim.public_key_hex.toLowerCase()) {
      return reply.code(400).send({ error: "public key does not match registered device" });
    }
    const preimage = new TextEncoder().encode(canonicalize(claim.body));
    const ok = await verifyHex(claim.public_key_hex, preimage, claim.signature_hex);
    if (!ok) return reply.code(400).send({ error: "signature verification failed" });
    const digest = sha256Hex(preimage);
    if (claim.body.kind === "firmware_hash") store.markFirmwareVerified(device.did);
    // record into audit
    const ts = new Date().toISOString();
    const id = crypto.randomUUID();
    const previousHash = store.tailHash(device.did);
    const hash = sha256Hex(
      `${id}|${device.did}|attest|${JSON.stringify({ digest, kind: claim.body.kind })}|${ts}|${previousHash ?? ""}`,
    );
    store.appendAudit({
      id,
      robot_id: device.did,
      action: "attest",
      details: { digest, kind: claim.body.kind },
      timestamp: ts,
      previous_hash: previousHash,
      hash,
      signature_hex: null,
      public_key_hex: null,
    });
    return reply.code(202).send({ accepted: true, digest });
  });

  app.post<{ Params: { did: string }; Body: { anomaly_detected?: boolean } }>(
    "/v1/devices/:did/telemetry",
    async (req, reply) => {
      const device = store.getDevice(req.params.did);
      if (!device) return reply.code(404).send({ error: "device not found" });
      store.recordHeartbeat(device.did);
      store.bumpTelemetry(device.did);
      if (typeof req.body?.anomaly_detected === "boolean") {
        store.setAnomaly(device.did, req.body.anomaly_detected);
      }
      return reply.code(202).send({ accepted: true });
    },
  );

  app.get<{ Params: { robotId: string } }>("/v1/audit/:robotId", async (req) => {
    return { entries: store.getAudit(req.params.robotId) };
  });

  return app;
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const port = Number(process.env.PORT ?? 8787);
  const host = process.env.HOST ?? "0.0.0.0";
  const app = buildApp({ logger: true });
  app.listen({ port, host }).catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
}
