import { AmbientSoundId, AmbientTrack, AmbientPreset, AmbientAudioState } from '../../types/ambient';

export const AMBIENT_TRACKS: AmbientTrack[] = [
  {
    id: 'rain',
    name: 'Rain on Window',
    category: 'nature',
    description: 'Steady soothing downpour patter',
    volume: 0.7,
    isActive: false,
  },
  {
    id: 'hearth',
    name: 'Crackling Hearth',
    category: 'cozy',
    description: 'Warm fireplace with snapping embers',
    volume: 0.6,
    isActive: false,
  },
  {
    id: 'storm',
    name: 'Night Storm',
    category: 'nature',
    description: 'Rolling thunder and deep wind gusts',
    volume: 0.5,
    isActive: false,
  },
  {
    id: 'stream',
    name: 'Forest Stream',
    category: 'nature',
    description: 'Babbling brook under green canopy',
    volume: 0.6,
    isActive: false,
  },
  {
    id: 'brown_noise',
    name: 'Deep Brown Noise',
    category: 'focus',
    description: 'Heavy low-frequency drone for flow states',
    volume: 0.65,
    isActive: false,
  },
  {
    id: 'pink_noise',
    name: 'Balanced Pink Noise',
    category: 'focus',
    description: 'Calibrated 1/f noise for cognitive focus',
    volume: 0.6,
    isActive: false,
  },
];

export const AMBIENT_PRESETS: AmbientPreset[] = [
  {
    id: 'rainy_library',
    name: 'Rainy Library',
    description: 'Soothing rain combined with a warm fireplace',
    tracks: { rain: 0.75, hearth: 0.45 },
  },
  {
    id: 'deep_flow',
    name: 'Deep Alpha Flow',
    description: 'Brown noise and gentle rain to block distractions',
    tracks: { brown_noise: 0.7, rain: 0.35 },
  },
  {
    id: 'forest_cabin',
    name: 'Forest Sanctuary',
    description: 'Mountain stream with distant rainstorm',
    tracks: { stream: 0.65, storm: 0.3 },
  },
];

type AmbientListener = (state: AmbientAudioState) => void;

class AmbientAudioService {
  private isPlaying: boolean = false;
  private masterVolume: number = 0.8;
  private activeTracks: Partial<Record<AmbientSoundId, number>> = {};
  private sleepTimerMinutes: number | null = null;
  private sleepTimerRemainingSeconds: number | null = null;
  private sleepTimerInterval: any = null;
  private listeners: Set<AmbientListener> = new Set();
  private webViewRef: any = null;

  public registerWebView(ref: any) {
    this.webViewRef = ref;
    this.syncToBridge();
  }

  public subscribe(listener: AmbientListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((l) => l(state));
    this.syncToBridge();
  }

  public getState(): AmbientAudioState {
    return {
      isPlaying: this.isPlaying,
      masterVolume: this.masterVolume,
      activeTracks: { ...this.activeTracks },
      sleepTimerMinutes: this.sleepTimerMinutes,
      sleepTimerRemainingSeconds: this.sleepTimerRemainingSeconds,
    };
  }

  public play() {
    // If no tracks selected, activate rain by default
    if (Object.keys(this.activeTracks).length === 0) {
      this.activeTracks['rain'] = 0.7;
    }
    this.isPlaying = true;
    this.notify();
  }

  public pause() {
    this.isPlaying = false;
    this.notify();
  }

  public togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public toggleTrack(id: AmbientSoundId) {
    if (this.activeTracks[id] !== undefined) {
      delete this.activeTracks[id];
      if (Object.keys(this.activeTracks).length === 0) {
        this.isPlaying = false;
      }
    } else {
      const def = AMBIENT_TRACKS.find((t) => t.id === id);
      this.activeTracks[id] = def?.volume || 0.6;
      this.isPlaying = true;
    }
    this.notify();
  }

  public setTrackVolume(id: AmbientSoundId, volume: number) {
    const clamped = Math.max(0, Math.min(1, volume));
    if (clamped <= 0.02) {
      delete this.activeTracks[id];
    } else {
      this.activeTracks[id] = clamped;
      if (!this.isPlaying) {
        this.isPlaying = true;
      }
    }
    this.notify();
  }

  public setMasterVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.notify();
  }

  public applyPreset(preset: AmbientPreset) {
    this.activeTracks = { ...preset.tracks };
    this.isPlaying = true;
    this.notify();
  }

  public setSleepTimer(minutes: number | null) {
    if (this.sleepTimerInterval) {
      clearInterval(this.sleepTimerInterval);
      this.sleepTimerInterval = null;
    }

    this.sleepTimerMinutes = minutes;

    if (!minutes || minutes <= 0) {
      this.sleepTimerRemainingSeconds = null;
      this.notify();
      return;
    }

    this.sleepTimerRemainingSeconds = minutes * 60;
    this.notify();

    this.sleepTimerInterval = setInterval(() => {
      if (this.sleepTimerRemainingSeconds === null) return;

      if (this.sleepTimerRemainingSeconds <= 1) {
        clearInterval(this.sleepTimerInterval);
        this.sleepTimerInterval = null;
        this.sleepTimerMinutes = null;
        this.sleepTimerRemainingSeconds = null;
        this.pause();
      } else {
        this.sleepTimerRemainingSeconds -= 1;
        this.notify();
      }
    }, 1000);
  }

  private syncToBridge() {
    if (!this.webViewRef?.injectJavaScript) return;

    const payload = JSON.stringify({
      isPlaying: this.isPlaying,
      masterVolume: this.masterVolume,
      activeTracks: this.activeTracks,
    });

    this.webViewRef.injectJavaScript(`
      if (window.onAmbientSync) {
        window.onAmbientSync(${payload});
      }
      true;
    `);
  }

  /**
   * Generates procedural Web Audio synthesizer HTML string
   * for zero-asset, mathematically infinite offline audio loops.
   */
  public getSynthHtml(): string {
    return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><title>Synth</title></head>
<body>
<script>
  let ctx = null;
  let masterGain = null;
  const nodes = {};

  function initAudio() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.8, ctx.currentTime);
      masterGain.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
  }

  // Create White Noise Buffer
  function createWhiteNoiseBuffer() {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  // Brown Noise Synthesizer
  function startBrownNoise() {
    const white = ctx.createBufferSource();
    white.buffer = createWhiteNoiseBuffer();
    white.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0, ctx.currentTime);

    white.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    white.start();

    return { source: white, gain };
  }

  // Pink Noise Synthesizer
  function startPinkNoise() {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0, ctx.currentTime);

    source.connect(gain);
    gain.connect(masterGain);
    source.start();

    return { source, gain };
  }

  // Rain on Window (Bandpass filtered noise with gentle flutter)
  function startRain() {
    const white = ctx.createBufferSource();
    white.buffer = createWhiteNoiseBuffer();
    white.loop = true;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(1400, ctx.currentTime);
    bandpass.Q.setValueAtTime(0.8, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0, ctx.currentTime);

    white.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(masterGain);
    white.start();

    return { source: white, gain };
  }

  // Hearth (Low rumble + bandpass crackles)
  function startHearth() {
    const white = ctx.createBufferSource();
    white.buffer = createWhiteNoiseBuffer();
    white.loop = true;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(260, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0, ctx.currentTime);

    white.connect(lowpass);
    lowpass.connect(gain);
    gain.connect(masterGain);
    white.start();

    return { source: white, gain };
  }

  // Night Storm (Deep low-frequency rumble)
  function startStorm() {
    const white = ctx.createBufferSource();
    white.buffer = createWhiteNoiseBuffer();
    white.loop = true;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(180, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0, ctx.currentTime);

    white.connect(lowpass);
    lowpass.connect(gain);
    gain.connect(masterGain);
    white.start();

    return { source: white, gain };
  }

  // Forest Stream (Modulated dual bandpass)
  function startStream() {
    const white = ctx.createBufferSource();
    white.buffer = createWhiteNoiseBuffer();
    white.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(950, ctx.currentTime);
    filter.Q.setValueAtTime(1.2, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0, ctx.currentTime);

    white.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    white.start();

    return { source: white, gain };
  }

  function getOrCreateTrackNode(id) {
    if (nodes[id]) return nodes[id];
    if (id === 'brown_noise') nodes[id] = startBrownNoise();
    else if (id === 'pink_noise') nodes[id] = startPinkNoise();
    else if (id === 'rain') nodes[id] = startRain();
    else if (id === 'hearth') nodes[id] = startHearth();
    else if (id === 'storm') nodes[id] = startStorm();
    else if (id === 'stream') nodes[id] = startStream();
    return nodes[id];
  }

  window.onAmbientSync = function(data) {
    initAudio();
    if (!ctx) return;

    // Master Gain Fade
    const targetMaster = data.isPlaying ? (data.masterVolume || 0.8) : 0.0;
    masterGain.gain.setTargetAtTime(targetMaster, ctx.currentTime, 0.25);

    // Sync Track Volumes
    const allTrackIds = ['rain', 'hearth', 'storm', 'stream', 'brown_noise', 'pink_noise'];
    allTrackIds.forEach(id => {
      const vol = (data.isPlaying && data.activeTracks && data.activeTracks[id] !== undefined)
        ? data.activeTracks[id]
        : 0.0;
      
      const node = getOrCreateTrackNode(id);
      if (node && node.gain) {
        node.gain.gain.setTargetAtTime(vol, ctx.currentTime, 0.25);
      }
    });
  };
</script>
</body>
</html>`;
  }
}

export const ambientAudioService = new AmbientAudioService();
