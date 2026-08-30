import * as Speech from 'expo-speech';

export interface TTSState {
  isPlaying: boolean;
  currentSentenceIndex: number;
  totalSentences: number;
  rate: number; // 0.5 - 2.5
  pitch: number; // 0.5 - 2.0
  voice?: string;
  sleepTimerMinutes: number | null; // e.g. 15, 30, 45, 60 or null
  sleepTimerRemainingSeconds: number | null;
}

type TTSListener = (state: TTSState) => void;

class TTSService {
  private sentences: string[] = [];
  private currentIndex: number = 0;
  private isPlaying: boolean = false;
  private rate: number = 1.0;
  private pitch: number = 1.0;
  private voice?: string;
  private sleepTimerId: any = null;
  private sleepTimerIntervalId: any = null;
  private sleepTimerSecondsLeft: number | null = null;
  private listeners: Set<TTSListener> = new Set();

  public setContent(text: string): void {
    this.stop();
    // Split text into meaningful sentences
    this.sentences = text
      .replace(/([.?!])\s*(?=[A-Z])/g, '$1|')
      .split('|')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    this.currentIndex = 0;
    this.notify();
  }

  public async play(): Promise<void> {
    if (this.sentences.length === 0) return;
    this.isPlaying = true;
    this.notify();
    await this.speakCurrentSentence();
  }

  public async pause(): Promise<void> {
    this.isPlaying = false;
    try {
      await Speech.stop();
    } catch {}
    this.notify();
  }

  public async stop(): Promise<void> {
    this.isPlaying = false;
    this.currentIndex = 0;
    this.clearSleepTimer();
    try {
      await Speech.stop();
    } catch {}
    this.notify();
  }

  public async nextSentence(): Promise<void> {
    if (this.currentIndex < this.sentences.length - 1) {
      this.currentIndex++;
      this.notify();
      if (this.isPlaying) {
        try {
          await Speech.stop();
        } catch {}
        await this.speakCurrentSentence();
      }
    } else {
      this.stop();
    }
  }

  public async prevSentence(): Promise<void> {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.notify();
      if (this.isPlaying) {
        try {
          await Speech.stop();
        } catch {}
        await this.speakCurrentSentence();
      }
    }
  }

  public setRate(newRate: number): void {
    this.rate = Math.max(0.5, Math.min(2.5, newRate));
    this.notify();
  }

  public setPitch(newPitch: number): void {
    this.pitch = Math.max(0.5, Math.min(2.0, newPitch));
    this.notify();
  }

  public setSleepTimer(minutes: number | null): void {
    this.clearSleepTimer();
    if (minutes === null || minutes <= 0) {
      this.notify();
      return;
    }

    this.sleepTimerSecondsLeft = minutes * 60;
    this.sleepTimerIntervalId = setInterval(() => {
      if (this.sleepTimerSecondsLeft !== null && this.sleepTimerSecondsLeft > 0) {
        this.sleepTimerSecondsLeft--;
        this.notify();
      }
    }, 1000);

    this.sleepTimerId = setTimeout(() => {
      this.stop();
    }, minutes * 60 * 1000);

    this.notify();
  }

  private clearSleepTimer(): void {
    if (this.sleepTimerId) {
      clearTimeout(this.sleepTimerId);
      this.sleepTimerId = null;
    }
    if (this.sleepTimerIntervalId) {
      clearInterval(this.sleepTimerIntervalId);
      this.sleepTimerIntervalId = null;
    }
    this.sleepTimerSecondsLeft = null;
  }

  private async speakCurrentSentence(): Promise<void> {
    if (!this.isPlaying || this.currentIndex >= this.sentences.length) {
      this.stop();
      return;
    }

    const currentText = this.sentences[this.currentIndex];

    try {
      Speech.speak(currentText, {
        rate: this.rate,
        pitch: this.pitch,
        voice: this.voice,
        onDone: () => {
          if (this.isPlaying) {
            this.nextSentence();
          }
        },
        onError: () => {
          this.stop();
        },
      });
    } catch {
      this.stop();
    }
  }

  public subscribe(listener: TTSListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  public getState(): TTSState {
    return {
      isPlaying: this.isPlaying,
      currentSentenceIndex: this.currentIndex,
      totalSentences: this.sentences.length,
      rate: this.rate,
      pitch: this.pitch,
      voice: this.voice,
      sleepTimerMinutes: this.sleepTimerSecondsLeft ? Math.ceil(this.sleepTimerSecondsLeft / 60) : null,
      sleepTimerRemainingSeconds: this.sleepTimerSecondsLeft,
    };
  }

  private notify(): void {
    const state = this.getState();
    for (const listener of this.listeners) {
      listener(state);
    }
  }
}

export const ttsService = new TTSService();
