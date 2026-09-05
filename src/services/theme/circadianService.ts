import { CircadianConfig } from '../../types/theme';

export const DEFAULT_CIRCADIAN_CONFIG: CircadianConfig = {
  enabled: false,
  mode: 'solar',
  startHour: 21, // 9:00 PM
  endHour: 7,    // 7:00 AM
  targetWarmth: 0.65,
};

/**
 * Circadian Rhythm Warmth Calculator.
 * Smoothly ramps blue-light filtering warmth during evening/night hours
 * to protect reader melatonin production and ocular comfort.
 */
export class CircadianService {
  /**
   * Calculates astronomical solar warmth curve.
   * Day (08:00 - 18:00): 0.0
   * Evening ramp-up (18:00 - 22:00): 0.0 -> targetWarmth
   * Midnight peak (22:00 - 05:00): targetWarmth
   * Dawn ramp-down (05:00 - 08:00): targetWarmth -> 0.0
   */
  public static calculateSolarWarmth(date: Date = new Date(), targetWarmth = 0.65): number {
    const hours = date.getHours() + date.getMinutes() / 60;

    // Daytime: 8:00 AM to 6:00 PM -> No night filter
    if (hours >= 8 && hours < 18) {
      return 0.0;
    }

    // Evening sunset transition: 6:00 PM (18:00) to 10:00 PM (22:00)
    if (hours >= 18 && hours < 22) {
      const progress = (hours - 18) / 4; // 0.0 to 1.0
      // Smooth cosine easing
      const factor = (1 - Math.cos(progress * Math.PI)) / 2;
      return Number((targetWarmth * factor).toFixed(3));
    }

    // Deep night: 10:00 PM (22:00) to 5:00 AM (5:00)
    if (hours >= 22 || hours < 5) {
      return targetWarmth;
    }

    // Dawn transition: 5:00 AM to 8:00 AM
    if (hours >= 5 && hours < 8) {
      const progress = (hours - 5) / 3; // 0.0 to 1.0
      const factor = (1 + Math.cos(progress * Math.PI)) / 2;
      return Number((targetWarmth * factor).toFixed(3));
    }

    return 0.0;
  }

  /**
   * Calculates user-scheduled warmth window with 30-minute ease-in and ease-out.
   */
  public static calculateScheduledWarmth(
    date: Date = new Date(),
    startHour: number = 21,
    endHour: number = 7,
    targetWarmth: number = 0.65
  ): number {
    const hours = date.getHours() + date.getMinutes() / 60;

    // Handle overnight window (e.g. 21 to 7)
    let isInside = false;
    let transitionFactor = 1.0;

    if (startHour > endHour) {
      // Crosses midnight
      if (hours >= startHour || hours < endHour) {
        isInside = true;
      }
    } else {
      // Same day window
      if (hours >= startHour && hours < endHour) {
        isInside = true;
      }
    }

    if (!isInside) {
      return 0.0;
    }

    // Gentle 30-min ramp in at start
    const diffFromStart = (hours >= startHour) ? (hours - startHour) : (hours + 24 - startHour);
    if (diffFromStart < 0.5) {
      transitionFactor = Math.min(transitionFactor, diffFromStart / 0.5);
    }

    // Gentle 30-min ramp down before end
    const diffToEnd = (hours < endHour) ? (endHour - hours) : (endHour + 24 - hours);
    if (diffToEnd < 0.5) {
      transitionFactor = Math.min(transitionFactor, diffToEnd / 0.5);
    }

    return Number((targetWarmth * Math.max(0.1, transitionFactor)).toFixed(3));
  }

  /**
   * Evaluates active warmth for a given configuration.
   */
  public static evaluateWarmth(config: CircadianConfig, date: Date = new Date()): number {
    if (!config || !config.enabled) {
      return 0.0;
    }

    if (config.mode === 'solar') {
      return this.calculateSolarWarmth(date, config.targetWarmth);
    }

    return this.calculateScheduledWarmth(
      date,
      config.startHour,
      config.endHour,
      config.targetWarmth
    );
  }

  /**
   * Formats 24h number to 12h AM/PM string (e.g. 21 -> '9:00 PM')
   */
  public static formatHour(hour: number): string {
    const h = Math.floor(hour);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${displayH}:00 ${suffix}`;
  }
}
