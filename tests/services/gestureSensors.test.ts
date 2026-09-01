import { describe, it, expect, beforeEach } from 'bun:test';
import {
  detectShake,
  calculateTiltRollAngle,
  evaluateTiltPageTurn,
} from '../../src/services/sensors/gestureSensors';
import { useReaderStore } from '../../src/store/readerStore';

describe('Motion Sensors & Gesture Calculations (Phase 4)', () => {
  beforeEach(() => {
    const store = useReaderStore.getState();
    store.setShakeToSpeechEnabled(false);
    store.setTiltToTurnEnabled(false);
    store.setTiltSensitivity(25);
    store.setEdgeBrightnessEnabled(true);
    store.setBrightness(0.8);
  });

  it('detects shake gestures based on acceleration delta thresholds', () => {
    const prev = { x: 0.1, y: 9.8, z: 0.2 };
    // Small natural jitter -> not a shake
    const minorJitter = { x: 0.3, y: 9.9, z: 0.3 };
    expect(detectShake(minorJitter, prev, 1.75)).toBe(false);

    // Sudden wrist flick / shake -> exceeds delta threshold
    const violentShake = { x: 1.8, y: 8.2, z: 1.5 };
    expect(detectShake(violentShake, prev, 1.75)).toBe(true);
  });

  it('calculates roll tilt angle in degrees accurately', () => {
    // Level upright screen (x=0, y=9.8, z=0) -> 0 deg
    expect(calculateTiltRollAngle(0, 9.8, 0)).toBe(0);

    // Tilted right (positive X)
    const rightAngle = calculateTiltRollAngle(4.9, 8.5, 0);
    expect(rightAngle).toBeGreaterThan(20);
    expect(rightAngle).toBeLessThan(40);

    // Tilted left (negative X)
    const leftAngle = calculateTiltRollAngle(-4.9, 8.5, 0);
    expect(leftAngle).toBeLessThan(-20);
    expect(leftAngle).toBeGreaterThan(-40);
  });

  it('evaluates tilt-to-turn page commands with sensitivity threshold', () => {
    expect(evaluateTiltPageTurn(30, 25)).toBe('next');
    expect(evaluateTiltPageTurn(-30, 25)).toBe('prev');
    expect(evaluateTiltPageTurn(15, 25)).toBe('none');
    expect(evaluateTiltPageTurn(-10, 25)).toBe('none');
  });

  it('manages Phase 4 store properties and action updates', () => {
    const store = useReaderStore.getState();

    store.setShakeToSpeechEnabled(true);
    expect(useReaderStore.getState().shakeToSpeechEnabled).toBe(true);

    store.setTiltToTurnEnabled(true);
    expect(useReaderStore.getState().tiltToTurnEnabled).toBe(true);

    store.setTiltSensitivity(30);
    expect(useReaderStore.getState().tiltSensitivity).toBe(30);

    store.setBrightness(0.65);
    expect(useReaderStore.getState().brightness).toBe(0.65);

    store.updateTouchZoneAction('center', 'bookmark');
    expect(useReaderStore.getState().touchZoneMappings.center).toBe('bookmark');
  });
});
