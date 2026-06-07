# Sentinels Architecture

## Overview

Sentinels builds trust infrastructure for autonomous systems. The architecture is organized around a layered model that separates concerns between on-device software, cloud services, blockchain anchoring, and developer tooling.

```
+------------------------------------------------------------------+
|                        Developer Tools                            |
|  sentinel-sdk (TS, Rust, Python)  |  sentinel-cli  |  sentinel-docs |
+------------------------------------------------------------------+
|                         Cloud Platform                             |
|  sentinel-cloud (API, Auth, Fleet)  |  sentinel-dashboard (Web UI) |
|  sentinel-mobile (iOS/Android)      |                              |
+------------------------------------------------------------------+
|                         Trust Engine                               |
|  sentinel-core (Identity, Attestation, Trust Scoring, Audit)       |
+------------------------------------------------------------------+
|                       Communication Layer                           |
|  gRPC  |  MQTT  |  NATS  |  WebSocket                             |
+------------------------------------------------------------------+
|                        On-Device Software                           |
|  sentinel-agent (Daemon)  |  sentinel-firmware (TPM/SE)            |
+------------------------------------------------------------------+
|                        Hardware                                     |
|  Robot Controller  |  Secure Enclave  |  TPM 2.0                   |
+------------------------------------------------------------------+
|                        Blockchain Layer (Optional)                  |
|  sentinel-chain (Solana Anchor Programs)                           |
+------------------------------------------------------------------+
```

## Layer Description

### Hardware Layer

The hardware layer consists of the physical robot controller and its secure element. Sentinels supports TPM 2.0 and ARM TrustZone as secure enclave options. The secure element stores the device's private key and performs attestation operations.

### On-Device Layer

#### sentinel-agent

The agent is a Rust daemon that runs on the robot controller. It manages:

- Device identity (key generation, certificate signing request)
- Telemetry collection and signing
- Firmware update verification
- Command execution and audit logging
- Secure channel establishment with cloud

#### sentinel-firmware

Reference firmware for TPM 2.0 and secure enclave integration. Provides:

- Secure key storage
- Hardware-backed attestation
- Measured boot support
- Secure firmware update

### Communication Layer

Devices communicate with the cloud using:

- **gRPC** -- primary API protocol for command and control
- **MQTT** -- lightweight telemetry publishing
- **NATS** -- high-throughput event streaming for large fleets
- **WebSocket** -- real-time dashboard and monitoring connections

All communication is encrypted with TLS 1.3 and signed with Ed25519.

### Trust Engine

#### sentinel-core

The core trust engine is written in Rust and provides:

- **Identity Registry** -- manages device identities, public keys, and DIDs
- **Attestation Verifier** -- validates hardware and software attestation claims
- **Trust Scoring** -- computes real-time trust scores based on telemetry, attestation history, and behavioral analysis
- **Audit Trail** -- tamper-evident, hash-chained audit logging
- **Anomaly Detection** -- rule-based and ML-based anomaly detection

### Cloud Platform

#### sentinel-cloud

A TypeScript-based API server that provides:

- Fleet management (registration, grouping, configuration)
- User authentication and RBAC
- Webhook dispatch
- Aggregated telemetry querying
- Audit export (CSV, JSON, PDF)
- Payment and billing management

#### sentinel-dashboard

A web UI for fleet operations:

- Real-time telemetry monitoring
- Fleet health overview
- Audit log browsing and export
- Trust score visualization
- Command execution interface

#### sentinel-mobile

iOS and Android companion apps for operators:

- Push notifications for critical events
- Quick command execution
- Trust score monitoring
- On-call alert management

### Blockchain Layer (Optional)

#### sentinel-chain

Solana Anchor programs for optional on-chain attestation anchoring:

- Attestation root hash publishing
- Trust score anchoring
- Cross-organizational verification
- Decentralized identity resolution

This layer is optional and used when cross-organizational trust is required without a central authority.

### Developer Tools

#### sentinel-sdk

Multi-language SDK for integrating Sentinels into custom applications:

- TypeScript SDK (primary)
- Rust SDK
- Python SDK

#### sentinel-cli

A Rust CLI for fleet management operations:

- Key generation and management
- Fleet registration
- Telemetry querying
- Audit export
- Configuration management

## Data Flow

### Device Registration

```
Device                  Cloud                      Registry
  |                       |                           |
  |--- generate keypair -->|                           |
  |--- CSR + attestation ->|                           |
  |                       |--- verify attestation ---->|
  |                       |<-- issue identity ---------|
  |<-- signed certificate--|                           |
  |--- store cert -------->|                           |
```

### Telemetry

```
Device                          Cloud
  |                               |
  |--- signed telemetry event ---->|
  |                               |--- verify signature
  |                               |--- compute trust delta
  |                               |--- append to audit trail
  |                               |--- detect anomalies
  |<-- ack (or intervention) ------|
```

### Command Execution

```
Dashboard          Cloud          Device
   |                 |              |
   |--- command ---->|              |
   |                 |--- verify -->|
   |                 |<-- ack ------|
   |                 |--- append ---|
   |                 |              |--- execute
   |                 |              |--- sign result
   |                 |<-- result ---|
   |<-- status ------|              |
```

## Trust Score Computation

```
Inputs:
  - firmware verification status
  - telemetry signature validity
  - heartbeat regularity
  - anomaly detection results
  - key age and rotation history
  - command execution success rate

Algorithm:
  base_score = 50
  if firmware_verified: score += 10
  if telemetry_valid: score += 5 per verified event (max 20)
  if anomaly_detected: score -= 20
  if key_rotated_recently (< 7 days): score += 5
  heartbeat_count > 168: score += 10
  heartbeat_count > 24: score += 5
  score = clamp(0, 100, score)

Levels:
  0-20: critical
  21-40: low
  41-60: medium
  61-80: high
  81-100: verified
```

## Audit Trail

The audit trail is a hash chain where each entry contains:

```
{
  id: string,
  robotId: string,
  action: string,
  details: string (JSON),
  hash: string (SHA-256),
  previousHash: string | null,
  signature: string (Ed25519),
  timestamp: string (ISO 8601)
}
```

The hash chain ensures tamper evidence: any modification to a previous entry would invalidate all subsequent hashes.

## Deployment Architecture

### Minimum Viable Deployment

```
[Device] --- WAN --- [Cloud (single instance)]
                         |
                    [PostgreSQL]
                    [ClickHouse (optional)]
```

### Production Deployment

```
[Device Fleet] --- WAN --- [Load Balancer]
                                |
                    [API Server Cluster]
                         |           |
                    [PostgreSQL]  [Redis]
                    [ClickHouse]  [NATS]
                         |           |
                    [Monitoring]  [Alerting]
```

### Enterprise Deployment

```
[Device Fleet] --- WAN --- [CDN / Edge]
                                |
                    [Regional API Cluster]
                         |           |
                    [Primary Region]
                         |
                    [Secondary Region (DR)]
                         |
                    [Global Audit Archive]
```

## Technology Stack

| Component | Technology | Rationale |
|---|---|---|
| Core engine | Rust | Performance, safety, cross-compilation |
| Cloud API | TypeScript / Node | Developer productivity, ecosystem |
| Dashboard | Next.js / React | SSR, static optimization |
| Database | PostgreSQL | ACID, JSON support, replication |
| Time-series | ClickHouse | High-ingestion telemetry |
| Cache | Redis | Session, rate limiting |
| Messaging | NATS | High-throughput, at-least-once delivery |
| Blockchain | Solana (Anchor) | Low cost, high throughput, SMT support |
| Device comms | gRPC, MQTT, NATS | Protocol flexibility |
| Auth | Ed25519, TPM 2.0 | Hardware-backed security |
| Container | Docker | Standard deployment unit |
| Orchestration | Kubernetes (optional) | Large-scale deployments |
