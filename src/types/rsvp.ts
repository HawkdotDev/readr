export interface RSVPWordToken {
  text: string;
  prefix: string;
  orpChar: string;
  suffix: string;
  orpIndex: number;
  delayMultiplier: number;
}

export interface RSVPConfig {
  targetWpm: number;      // 200 - 1000 WPM (default 350)
  pauseOnPunctuation: boolean;
  fontSize: number;       // 28 - 56
}

export interface RSVPState {
  currentIndex: number;
  isPlaying: boolean;
  tokens: RSVPWordToken[];
  totalTokens: number;
  wpm: number;
}
