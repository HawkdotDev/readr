import { Platform } from 'react-native';

export type KeyNavigationAction = 'nextPage' | 'prevPage' | null;

export interface HardwareKeyHandlerOptions {
  enabled: boolean;
  invert: boolean;
  onNextPage: () => void;
  onPrevPage: () => void;
  debounceMs?: number;
}

/**
 * Maps hardware keys (Volume buttons, presentation clickers, keyboard arrows/space)
 * to reader page turns with configurable inversion and debounce protection.
 */
export class HardwareKeyService {
  private static lastTriggerTime = 0;

  /**
   * Resolves a key code or key name into a reader action.
   */
  public static resolveKeyAction(key: string, invert = false): KeyNavigationAction {
    const normalized = key.toLowerCase();

    // Next Page Key Bindings
    const nextKeys = [
      'volumedown',
      'pagedown',
      'arrowright',
      'arrowdown',
      ' ',
      'space',
      'spacebar',
      'j',
      'enter',
      'n',
    ];

    // Previous Page Key Bindings
    const prevKeys = [
      'volumeup',
      'pageup',
      'arrowleft',
      'arrowup',
      'k',
      'backspace',
      'p',
    ];

    if (nextKeys.includes(normalized)) {
      return invert ? 'prevPage' : 'nextPage';
    }

    if (prevKeys.includes(normalized)) {
      return invert ? 'nextPage' : 'prevPage';
    }

    return null;
  }

  /**
   * Attaches global key listener (active on Web, desktop, and key-event supported platforms)
   * returns an unsubscribe cleanup function.
   */
  public static attachListener(options: HardwareKeyHandlerOptions): () => void {
    if (!options.enabled) return () => {};

    const debounce = options.debounceMs ?? 200;

    const handleKeyDown = (event: any) => {
      const key = event.key || event.code;
      if (!key) return;

      const action = this.resolveKeyAction(key, options.invert);
      if (!action) return;

      const now = Date.now();
      if (now - this.lastTriggerTime < debounce) {
        event.preventDefault?.();
        return;
      }

      this.lastTriggerTime = now;
      event.preventDefault?.();

      if (action === 'nextPage') {
        options.onNextPage();
      } else if (action === 'prevPage') {
        options.onPrevPage();
      }
    };

    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('keydown', handleKeyDown, { passive: false });
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }

    return () => {};
  }
}
