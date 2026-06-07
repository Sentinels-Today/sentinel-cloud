# Roadmap

This document outlines the high-level development roadmap for Sentinels. Timelines are approximate and subject to change based on community feedback and resource availability.

---

## Q2 2025 -- Foundation

**Theme: Ship the core**

| Milestone | Repositories | Status |
|---|---|---|
| sentinel-core v1.0 | sentinel-core | Released |
| sentinel-agent v1.0 | sentinel-agent | Released |
| Identity registry API | sentinel-cloud | Released |
| Attestation verification | sentinel-core | Released |
| Trust score engine | sentinel-core | Released |
| Hash-chain audit trail | sentinel-core | Released |
| Dashboard fleet overview | sentinel-dashboard | Released |
| TypeScript SDK | sentinel-sdk | Released |
| Solana attestation program | sentinel-chain | Released |
| CLI tool (basic ops) | sentinel-cli | Released |

## Q3 2025 -- Scale

**Theme: Fleet operations at scale**

| Milestone | Repositories | Status |
|---|---|---|
| ClickHouse telemetry pipeline | sentinel-cloud | In progress |
| NATS event streaming | sentinel-cloud | In progress |
| Anomaly detection engine | sentinel-core | In progress |
| RBAC and multi-tenant orgs | sentinel-cloud | Planned |
| Webhook system | sentinel-cloud | Planned |
| Audit export (CSV, JSON, PDF) | sentinel-cloud | Planned |
| Real-time dashboard | sentinel-dashboard | In progress |
| Mobile notifications | sentinel-mobile | Planned |
| Rust SDK | sentinel-sdk | Planned |
| Python SDK | sentinel-sdk | Planned |

## Q4 2025 -- Integrate

**Theme: Ecosystem and developer experience**

| Milestone | Repositories | Status |
|---|---|---|
| Fumadocs documentation portal | sentinel-docs | Planned |
| API reference docs | sentinel-docs | Planned |
| Interactive API playground | sentinel-docs | Planned |
| SDK guides and examples | sentinel-docs | Planned |
| Helm charts for Kubernetes | sentinel-cloud | Planned |
| Docker Compose reference | sentinel-cloud | Planned |
| Terraform provider | sentinel-sdk | Planned |
| VS Code extension | sentinel-sdk | Planned |
| GitHub Actions for CI | Various | Planned |
| Reference firmware (TPM) | sentinel-firmware | Planned |

## Q1 2026 -- Enterprise

**Theme: Production readiness**

| Milestone | Repositories | Status |
|---|---|---|
| SSO/SAML integration | sentinel-cloud | Planned |
| Audit compliance (SOC 2) | sentinel-cloud | Planned |
| Multi-region deployment | sentinel-cloud | Planned |
| Disaster recovery | sentinel-cloud | Planned |
| Enterprise BSL license | All | Planned |
| 24/7 commercial support | -- | Planned |
| On-premise deployment | sentinel-cloud | Planned |
| Air-gapped deployment | sentinel-agent | Planned |

## Q2 2026 -- Intelligence

**Theme: ML-driven operations**

| Milestone | Repositories | Status |
|---|---|---|
| ML-based anomaly detection | sentinel-core | Research |
| Predictive trust scoring | sentinel-core | Research |
| Fleet behavior profiling | sentinel-core | Research |
| Automated incident response | sentinel-cloud | Research |
| Natural language fleet queries | sentinel-dashboard | Research |
| Fleet-wide policy engine | sentinel-core | Research |

## Long-term Vision

### 2026-2027

- Cross-organizational trust mesh
- Decentralized identity network (DID / Web5)
- IoT and embedded systems support
- Regulatory compliance frameworks (NIST, ISO 27001)
- Edge-native deployment (no cloud dependency)
- Federated trust scoring

### 2027+

- Autonomous trust governance
- Zero-touch fleet operations
- Industry-specific compliance templates
- Global trust network with third-party verification
- Open standard for machine identity

---

## Legend

| Status | Meaning |
|---|---|
| Released | Available in the latest stable release |
| In progress | Active development, available in pre-release |
| Planned | Design phase, not yet implemented |
| Research | Exploratory, no commitment to ship |
