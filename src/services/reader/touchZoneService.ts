export type TouchZone =
  | 'topLeft'
  | 'topCenter'
  | 'topRight'
  | 'centerLeft'
  | 'center'
  | 'centerRight'
  | 'bottomLeft'
  | 'bottomCenter'
  | 'bottomRight';

export type TouchAction =
  | 'nextPage'
  | 'prevPage'
  | 'toggleChrome'
  | 'bookmark'
  | 'dictionary'
  | 'search'
  | 'tts'
  | 'autoScroll'
  | 'readingRuler'
  | 'bionic'
  | 'theme'
  | 'none';

export type TouchZoneConfig = Record<TouchZone, TouchAction>;

export const DEFAULT_TOUCH_ZONE_CONFIG: TouchZoneConfig = {
  topLeft: 'prevPage',
  topCenter: 'toggleChrome',
  topRight: 'nextPage',
  centerLeft: 'prevPage',
  center: 'toggleChrome',
  centerRight: 'nextPage',
  bottomLeft: 'prevPage',
  bottomCenter: 'toggleChrome',
  bottomRight: 'nextPage',
};

export const TOUCH_ACTION_LABELS: Record<TouchAction, { label: string; icon: string }> = {
  nextPage: { label: 'Next Page', icon: 'ChevronRight' },
  prevPage: { label: 'Previous Page', icon: 'ChevronLeft' },
  toggleChrome: { label: 'Toggle Menus / Chrome', icon: 'Sliders' },
  bookmark: { label: 'Bookmark Page', icon: 'Bookmark' },
  dictionary: { label: 'Look Up Word', icon: 'BookA' },
  search: { label: 'Search Book', icon: 'Search' },
  tts: { label: 'Toggle Audio TTS', icon: 'Volume2' },
  autoScroll: { label: 'Toggle Auto-Scroll', icon: 'FastForward' },
  readingRuler: { label: 'Toggle Reading Ruler', icon: 'Ruler' },
  bionic: { label: 'Toggle Bionic Reading', icon: 'Zap' },
  theme: { label: 'Cycle Theme', icon: 'Palette' },
  none: { label: 'Disabled (No Action)', icon: 'X' },
};

/**
 * Resolves (x, y) tap coordinates to one of the 9 touch zones
 */
export function resolveTouchZone(
  x: number,
  y: number,
  width: number,
  height: number
): TouchZone {
  if (width <= 0 || height <= 0) return 'center';

  const col = x < width / 3 ? 0 : x < (2 * width) / 3 ? 1 : 2;
  const row = y < height / 3 ? 0 : y < (2 * height) / 3 ? 1 : 2;

  if (row === 0) {
    if (col === 0) return 'topLeft';
    if (col === 1) return 'topCenter';
    return 'topRight';
  }

  if (row === 1) {
    if (col === 0) return 'centerLeft';
    if (col === 1) return 'center';
    return 'centerRight';
  }

  if (col === 0) return 'bottomLeft';
  if (col === 1) return 'bottomCenter';
  return 'bottomRight';
}

/**
 * Dispatches an action mapped to the tapped coordinates
 */
export function resolveActionForTap(
  x: number,
  y: number,
  width: number,
  height: number,
  config: TouchZoneConfig = DEFAULT_TOUCH_ZONE_CONFIG
): { zone: TouchZone; action: TouchAction } {
  const zone = resolveTouchZone(x, y, width, height);
  const action = config[zone] || 'none';
  return { zone, action };
}
