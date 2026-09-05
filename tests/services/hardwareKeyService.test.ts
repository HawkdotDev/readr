import { describe, it, expect } from 'bun:test';
import { HardwareKeyService } from '../../src/services/hardware/hardwareKeyService';

describe('Hardware Key & Remote Navigation Service', () => {
  it('maps volume down and next-page keys to nextPage action by default', () => {
    expect(HardwareKeyService.resolveKeyAction('VolumeDown', false)).toBe('nextPage');
    expect(HardwareKeyService.resolveKeyAction('PageDown', false)).toBe('nextPage');
    expect(HardwareKeyService.resolveKeyAction('ArrowRight', false)).toBe('nextPage');
    expect(HardwareKeyService.resolveKeyAction('ArrowDown', false)).toBe('nextPage');
    expect(HardwareKeyService.resolveKeyAction(' ', false)).toBe('nextPage');
    expect(HardwareKeyService.resolveKeyAction('j', false)).toBe('nextPage');
  });

  it('maps volume up and prev-page keys to prevPage action by default', () => {
    expect(HardwareKeyService.resolveKeyAction('VolumeUp', false)).toBe('prevPage');
    expect(HardwareKeyService.resolveKeyAction('PageUp', false)).toBe('prevPage');
    expect(HardwareKeyService.resolveKeyAction('ArrowLeft', false)).toBe('prevPage');
    expect(HardwareKeyService.resolveKeyAction('ArrowUp', false)).toBe('prevPage');
    expect(HardwareKeyService.resolveKeyAction('k', false)).toBe('prevPage');
  });

  it('inverts action mapping when invert parameter is true', () => {
    expect(HardwareKeyService.resolveKeyAction('VolumeDown', true)).toBe('prevPage');
    expect(HardwareKeyService.resolveKeyAction('VolumeUp', true)).toBe('nextPage');
    expect(HardwareKeyService.resolveKeyAction('PageDown', true)).toBe('prevPage');
    expect(HardwareKeyService.resolveKeyAction('PageUp', true)).toBe('nextPage');
  });

  it('ignores unrelated keys', () => {
    expect(HardwareKeyService.resolveKeyAction('KeyQ', false)).toBeNull();
    expect(HardwareKeyService.resolveKeyAction('Shift', false)).toBeNull();
    expect(HardwareKeyService.resolveKeyAction('Control', false)).toBeNull();
  });
});
