# sentinel-cloud

**Fleet management API for Sentinels.** Fastify + TypeScript reference implementation that registers devices, verifies signed attestation claims, tracks telemetry, computes trust scores, and emits a hash-chained audit log.

[![ci](https://github.com/Sentinels-Today/sentinel-cloud/actions/workflows/ci.yml/badge.svg)](https://github.com/Sentinels-Today/sentinel-cloud/actions/workflows/ci.yml)
![license](https://img.shields.io/badge/license-Apache--2.0-blue)
![node](https://img.shields.io/badge/node-%E2%89%A520-green)

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/healthz` | Liveness probe |
| GET | `/version` | Server version |
| POST | `/v1/devices` | Register a device (DID + Ed25519 public key) |
| GET | `/v1/devices/:did` | Device record |
| GET | `/v1/devices/:did/trust` | Trust score + level |
| POST | `/v1/devices/:did/telemetry` | Record heartbeat + telemetry event |
| POST | `/v1/attestations` | Submit a signed attestation claim |
| GET | `/v1/audit/:robotId` | Hash-chained audit entries |

Wire-compatible with the [`@sentinels/sdk`](https://github.com/Sentinels-Today/sentinel-sdk) client and shares the deterministic trust formula and canonical-JSON digesting with the Rust [`sentinel-core`](https://github.com/Sentinels-Today/sentinel-core) crates.

## Run

```sh
npm install
npm run dev       # hot-reload on src/**/*.ts
# or
npm run build && npm start
```

Server defaults: `0.0.0.0:8787`. Override with `PORT` / `HOST` env vars (see `.env.example`).

```sh
curl -s http://localhost:8787/healthz
# {"status":"ok"}
```

## Develop

```sh
npm install
npm run lint
npm run typecheck
npm test
npm run build
```

## Storage

The reference build uses an in-memory `FleetStore`. Production deployments should replace `src/store.ts` with a Postgres-backed implementation (planned). The HTTP surface and verification logic stay unchanged.

## License

Apache-2.0 — see [LICENSE](./LICENSE).
