# Supported Platforms

## Device Platforms

### Operating Systems

| OS | Architecture | Support Level | Notes |
|---|---|---|---|
| Linux (kernel 5.10+) | amd64, arm64, armv7 | Tier 1 | Primary target for sentinel-agent |
| Linux (kernel 4.14+) | amd64, arm64 | Tier 2 | Limited testing |
| macOS 14+ | amd64, arm64 | Tier 3 | Development only |
| Windows 10+ | amd64 | Tier 3 | Development only |
| RTOS (FreeRTOS, Zephyr) | arm, riscv | Experimental | Contact us for support |

### Architectures

| Architecture | Support Level | Examples |
|---|---|---|
| x86-64 (amd64) | Tier 1 | Intel, AMD server/edge |
| ARMv8-A (arm64) | Tier 1 | Raspberry Pi 4/5, Jetson, Rockchip |
| ARMv7 (armhf) | Tier 2 | Raspberry Pi 3, BeagleBone |
| RISC-V 64 | Tier 3 | SiFive, StarFive |
| ARM Cortex-M | Experimental | Microcontroller support |

### Secure Elements

| Hardware | Support Level | Notes |
|---|---|---|
| TPM 2.0 (discrete) | Tier 1 | Infineon, Nuvoton, STM |
| TPM 2.0 (firmware) | Tier 2 | Intel PTT, AMD fTPM |
| ARM TrustZone | Tier 2 | OP-TEE, Trusty |
| Apple Secure Enclave | Tier 3 | macOS only |
| Custom HSM | Experimental | Contact us |

## Cloud Platforms

| Platform | Support Level | Notes |
|---|---|---|
| Self-hosted (Linux) | Tier 1 | Docker Compose, systemd |
| Kubernetes | Tier 1 | Helm charts provided |
| AWS | Tier 2 | ECS, EKS, EC2 |
| GCP | Tier 2 | GKE, Compute Engine |
| Azure | Tier 2 | AKS, VMs |
| Edge (balena, k3s) | Tier 2 | Lightweight deployments |

## SDK Platforms

| Language | Version | Platform | Support Level |
|---|---|---|---|
| TypeScript | 5.x | Node 18+, Browser | Tier 1 |
| Rust | 1.75+ | All targets | Tier 1 |
| Python | 3.10+ | Linux, macOS, Windows | Tier 2 |

## Browser Support (Dashboard)

| Browser | Version | Support Level |
|---|---|---|
| Chrome | Latest 2 versions | Tier 1 |
| Firefox | Latest 2 versions | Tier 1 |
| Safari | Latest 2 versions | Tier 2 |
| Edge | Latest 2 versions | Tier 2 |

## Support Level Definitions

### Tier 1

- Fully tested in CI
- Official binaries and packages provided
- Security patches within 7 days
- Priority bug fixes
- Community and commercial support

### Tier 2

- Tested in CI (limited matrix)
- Community-maintained packages
- Security patches within 30 days
- Best-effort bug fixes
- Community support only

### Tier 3

- Community-tested
- No official packages
- No SLA on fixes
- Community support only

### Experimental

- Proof of concept
- No stability guarantees
- No official support
- Community contributions welcome
