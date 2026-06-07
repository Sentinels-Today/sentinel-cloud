import { computeTrust, TrustScore } from "./trust.js";

export interface DeviceRecord {
  did: string;
  public_key_hex: string;
  registered_at: string;
  metadata: Record<string, unknown>;
  firmware_verified: boolean;
  key_rotated_at: string | null;
  verified_telemetry_events: number;
  anomaly_detected: boolean;
  heartbeat_count: number;
}

export interface AuditEntry {
  id: string;
  robot_id: string;
  action: string;
  details: unknown;
  timestamp: string;
  previous_hash: string | null;
  hash: string;
  signature_hex: string | null;
  public_key_hex: string | null;
}

const DAY_MS = 86_400_000;

/** In-memory fleet store. Production deployments replace this with Postgres. */
export class FleetStore {
  private readonly devices = new Map<string, DeviceRecord>();
  private readonly audit = new Map<string, AuditEntry[]>();

  registerDevice(input: {
    did: string;
    public_key_hex: string;
    metadata?: Record<string, unknown>;
  }): DeviceRecord {
    const existing = this.devices.get(input.did);
    if (existing) return existing;
    const rec: DeviceRecord = {
      did: input.did,
      public_key_hex: input.public_key_hex,
      registered_at: new Date().toISOString(),
      metadata: input.metadata ?? {},
      firmware_verified: false,
      key_rotated_at: new Date().toISOString(),
      verified_telemetry_events: 0,
      anomaly_detected: false,
      heartbeat_count: 0,
    };
    this.devices.set(input.did, rec);
    return rec;
  }

  getDevice(did: string): DeviceRecord | undefined {
    return this.devices.get(did);
  }

  markFirmwareVerified(did: string): void {
    const d = this.devices.get(did);
    if (d) d.firmware_verified = true;
  }

  bumpTelemetry(did: string): void {
    const d = this.devices.get(did);
    if (d) d.verified_telemetry_events += 1;
  }

  setAnomaly(did: string, anomalyDetected: boolean): void {
    const d = this.devices.get(did);
    if (d) d.anomaly_detected = anomalyDetected;
  }

  recordHeartbeat(did: string): void {
    const d = this.devices.get(did);
    if (d) d.heartbeat_count += 1;
  }

  computeTrust(did: string): TrustScore | undefined {
    const d = this.devices.get(did);
    if (!d) return undefined;
    const keyRotatedWithin7Days =
      d.key_rotated_at !== null && Date.now() - Date.parse(d.key_rotated_at) <= 7 * DAY_MS;
    return computeTrust({
      firmwareVerified: d.firmware_verified,
      verifiedTelemetryEvents: d.verified_telemetry_events,
      anomalyDetected: d.anomaly_detected,
      keyRotatedWithin7Days,
      heartbeatCount: d.heartbeat_count,
    });
  }

  appendAudit(entry: AuditEntry): void {
    const list = this.audit.get(entry.robot_id) ?? [];
    list.push(entry);
    this.audit.set(entry.robot_id, list);
  }

  getAudit(robotId: string): AuditEntry[] {
    return this.audit.get(robotId) ?? [];
  }

  tailHash(robotId: string): string | null {
    const list = this.audit.get(robotId);
    if (!list || list.length === 0) return null;
    return list[list.length - 1]!.hash;
  }
}
