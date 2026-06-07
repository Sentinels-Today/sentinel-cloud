export interface TrustInputs {
  firmwareVerified: boolean;
  verifiedTelemetryEvents: number;
  anomalyDetected: boolean;
  keyRotatedWithin7Days: boolean;
  heartbeatCount: number;
}

export type TrustLevel = "critical" | "low" | "medium" | "high" | "verified";

export interface TrustScore {
  score: number;
  level: TrustLevel;
}

export function levelForScore(score: number): TrustLevel {
  if (score <= 20) return "critical";
  if (score <= 40) return "low";
  if (score <= 60) return "medium";
  if (score <= 80) return "high";
  return "verified";
}

export function computeTrust(inputs: TrustInputs): TrustScore {
  let score = 50;
  if (inputs.firmwareVerified) score += 10;
  score += Math.min(20, inputs.verifiedTelemetryEvents * 5);
  if (inputs.anomalyDetected) score -= 20;
  if (inputs.keyRotatedWithin7Days) score += 5;
  if (inputs.heartbeatCount > 168) score += 10;
  else if (inputs.heartbeatCount > 24) score += 5;
  const clamped = Math.max(0, Math.min(100, score));
  return { score: clamped, level: levelForScore(clamped) };
}
