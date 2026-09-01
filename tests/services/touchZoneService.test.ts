import { describe, it, expect } from 'bun:test';
import {
  resolveTouchZone,
  resolveActionForTap,
  DEFAULT_TOUCH_ZONE_CONFIG,
  TouchZoneConfig,
} from '../../src/services/reader/touchZoneService';

describe('9-Zone Touch Grid & Action Resolution Engine', () => {
  const width = 360;
  const height = 800;

  it('maps coordinates to the correct top row zones', () => {
    expect(resolveTouchZone(50, 50, width, height)).toBe('topLeft');
    expect(resolveTouchZone(180, 50, width, height)).toBe('topCenter');
    expect(resolveTouchZone(300, 50, width, height)).toBe('topRight');
  });

  it('maps coordinates to the correct center row zones', () => {
    expect(resolveTouchZone(50, 400, width, height)).toBe('centerLeft');
    expect(resolveTouchZone(180, 400, width, height)).toBe('center');
    expect(resolveTouchZone(300, 400, width, height)).toBe('centerRight');
  });

  it('maps coordinates to the correct bottom row zones', () => {
    expect(resolveTouchZone(50, 750, width, height)).toBe('bottomLeft');
    expect(resolveTouchZone(180, 750, width, height)).toBe('bottomCenter');
    expect(resolveTouchZone(300, 750, width, height)).toBe('bottomRight');
  });

  it('resolves default mapped actions accurately', () => {
    // Left side tap -> prevPage
    const leftRes = resolveActionForTap(50, 400, width, height, DEFAULT_TOUCH_ZONE_CONFIG);
    expect(leftRes.zone).toBe('centerLeft');
    expect(leftRes.action).toBe('prevPage');

    // Right side tap -> nextPage
    const rightRes = resolveActionForTap(320, 400, width, height, DEFAULT_TOUCH_ZONE_CONFIG);
    expect(rightRes.zone).toBe('centerRight');
    expect(rightRes.action).toBe('nextPage');

    // Center tap -> toggleChrome
    const centerRes = resolveActionForTap(180, 400, width, height, DEFAULT_TOUCH_ZONE_CONFIG);
    expect(centerRes.zone).toBe('center');
    expect(centerRes.action).toBe('toggleChrome');
  });

  it('resolves custom remapped actions correctly', () => {
    const customConfig: TouchZoneConfig = {
      ...DEFAULT_TOUCH_ZONE_CONFIG,
      topLeft: 'bookmark',
      topRight: 'bionic',
      bottomRight: 'tts',
    };

    expect(resolveActionForTap(20, 20, width, height, customConfig).action).toBe('bookmark');
    expect(resolveActionForTap(340, 20, width, height, customConfig).action).toBe('bionic');
    expect(resolveActionForTap(340, 780, width, height, customConfig).action).toBe('tts');
  });
});
