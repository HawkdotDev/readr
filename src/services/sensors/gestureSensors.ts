export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

/**
 * Detects if a 3D acceleration vector exceeds the shake threshold
 */
export function detectShake(
  current: Vector3D,
  previous: Vector3D,
  threshold: number = 1.75
): boolean {
  const deltaX = Math.abs(current.x - previous.x);
  const deltaY = Math.abs(current.y - previous.y);
  const deltaZ = Math.abs(current.z - previous.z);

  const totalDelta = deltaX + deltaY + deltaZ;
  return totalDelta > threshold;
}

/**
 * Calculates horizontal roll / tilt angle in degrees (-90 to +90)
 */
export function calculateTiltRollAngle(x: number, y: number, z: number): number {
  // Roll angle in radians = atan2(x, sqrt(y^2 + z^2))
  const radians = Math.atan2(x, Math.sqrt(y * y + z * z));
  return Math.round((radians * 180) / Math.PI);
}

/**
 * Determines whether the device is tilted sufficiently to trigger a page turn
 * @param rollAngle Tilt roll in degrees
 * @param threshold Threshold in degrees (default: 25)
 */
export function evaluateTiltPageTurn(
  rollAngle: number,
  threshold: number = 25
): 'next' | 'prev' | 'none' {
  if (rollAngle > threshold) return 'next';
  if (rollAngle < -threshold) return 'prev';
  return 'none';
}
