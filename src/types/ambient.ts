export type AmbientSoundId =
  | 'rain'
  | 'hearth'
  | 'storm'
  | 'stream'
  | 'brown_noise'
  | 'pink_noise';

export interface AmbientTrack {
  id: AmbientSoundId;
  name: string;
  category: 'nature' | 'cozy' | 'focus';
  description: string;
  volume: number; // 0.0 - 1.0 (default 0.7)
  isActive: boolean;
}

export interface AmbientPreset {
  id: string;
  name: string;
  description: string;
  tracks: Partial<Record<AmbientSoundId, number>>; // trackId -> volume
}

export interface AmbientAudioState {
  isPlaying: boolean;
  masterVolume: number; // 0.0 - 1.0
  activeTracks: Partial<Record<AmbientSoundId, number>>;
  sleepTimerMinutes: number | null;
  sleepTimerRemainingSeconds: number | null;
}
