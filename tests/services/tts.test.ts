import { describe, it, expect } from 'bun:test';
import { ttsService } from '../../src/services/tts/ttsService';

describe('TTSService', () => {
  it('splits paragraphs into sentences accurately', () => {
    const text = 'In a quiet sanctuary. Words breathe easily! Do you agree?';
    ttsService.setContent(text);
    const state = ttsService.getState();
    expect(state.totalSentences).toBe(3);
  });

  it('clamps speech rate between 0.5 and 2.5', () => {
    ttsService.setRate(3.5);
    expect(ttsService.getState().rate).toBe(2.5);

    ttsService.setRate(0.1);
    expect(ttsService.getState().rate).toBe(0.5);

    ttsService.setRate(1.2);
    expect(ttsService.getState().rate).toBe(1.2);
  });

  it('configures sleep timers correctly', () => {
    ttsService.setSleepTimer(15);
    const state = ttsService.getState();
    expect(state.sleepTimerMinutes).toBe(15);
    expect(state.sleepTimerRemainingSeconds).toBe(15 * 60);

    ttsService.setSleepTimer(null);
    expect(ttsService.getState().sleepTimerMinutes).toBeNull();
  });
});
