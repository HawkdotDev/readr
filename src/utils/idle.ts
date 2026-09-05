/**
 * Utility for running non-critical or deferred tasks when the JS thread is idle.
 * Uses `requestIdleCallback` (standard in React Native 0.76+ and modern web engines),
 * with a fallback to `setTimeout` when unavailable.
 *
 * Replaces deprecated `InteractionManager.runAfterInteractions`.
 */

export interface IdleTask {
  cancel: () => void;
}

export function runWhenIdle(callback: () => void, timeout = 250): IdleTask {
  if (typeof requestIdleCallback === 'function') {
    const handle = requestIdleCallback(() => {
      callback();
    }, { timeout });

    return {
      cancel: () => {
        if (typeof cancelIdleCallback === 'function') {
          cancelIdleCallback(handle);
        }
      },
    };
  }

  const timer = setTimeout(callback, 32);
  return {
    cancel: () => clearTimeout(timer),
  };
}
