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

export interface ShakeListenerOptions {
  enabled: boolean;
  onShake: () => void;
  threshold?: number;
  debounceMs?: number;
}

export interface TiltListenerOptions {
  enabled: boolean;
  onNextPage: () => void;
  onPrevPage: () => void;
  threshold?: number;
  debounceMs?: number;
}

export function attachShakeSensorListener(options: ShakeListenerOptions): () => void {
  if (!options.enabled) return () => {};

  let lastVector: Vector3D = { x: 0, y: 0, z: 0 };
  let lastTriggerTime = 0;
  const threshold = options.threshold ?? 1.75;
  const debounce = options.debounceMs ?? 1000;

  const handleMotion = (event: any) => {
    const acc = event.accelerationIncludingGravity || event.acceleration;
    if (!acc) return;
    const current: Vector3D = {
      x: acc.x ?? 0,
      y: acc.y ?? 0,
      z: acc.z ?? 0,
    };

    if (detectShake(current, lastVector, threshold)) {
      const now = Date.now();
      if (now - lastTriggerTime > debounce) {
        lastTriggerTime = now;
        options.onShake();
      }
    }
    lastVector = current;
  };

  if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('devicemotion', handleMotion);
    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }

  return () => {};
}

export function attachTiltSensorListener(options: TiltListenerOptions): () => void {
  if (!options.enabled) return () => {};

  let lastTriggerTime = 0;
  const threshold = options.threshold ?? 25;
  const debounce = options.debounceMs ?? 600;

  const handleOrientation = (event: any) => {
    const rollAngle = event.gamma ?? 0;
    const action = evaluateTiltPageTurn(rollAngle, threshold);
    if (action === 'none') return;

    const now = Date.now();
    if (now - lastTriggerTime > debounce) {
      lastTriggerTime = now;
      if (action === 'next') {
        options.onNextPage();
      } else if (action === 'prev') {
        options.onPrevPage();
      }
    }
  };

  if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('deviceorientation', handleOrientation);
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }

  return () => {};
}

