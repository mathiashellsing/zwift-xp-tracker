export const TRON_TARGET = 50000;

export interface TronCheckpoint {
  meters: number;
  lifetimeClimbed: number;
}

export function isTronCheckpoint(value: unknown): value is TronCheckpoint {
  const v = value as TronCheckpoint | null;
  return !!v && typeof v.meters === 'number' && Number.isFinite(v.meters) &&
    Number.isInteger(v.meters) && v.meters >= 0 && v.meters <= TRON_TARGET &&
    typeof v.lifetimeClimbed === 'number' && Number.isFinite(v.lifetimeClimbed) &&
    v.lifetimeClimbed >= 0;
}

export function calculateTronProgress(checkpoint: TronCheckpoint, lifetimeClimbed: number | null) {
  const current = lifetimeClimbed !== null && Number.isFinite(lifetimeClimbed) &&
    lifetimeClimbed >= checkpoint.lifetimeClimbed;
  const meters = Math.min(TRON_TARGET, checkpoint.meters +
    (current ? lifetimeClimbed! - checkpoint.lifetimeClimbed : 0));
  return {
    meters: Math.floor(meters),
    remaining: Math.max(0, Math.ceil(TRON_TARGET - meters)),
    percent: Math.min(100, Math.floor(meters / TRON_TARGET * 1000) / 10),
    current,
  };
}
