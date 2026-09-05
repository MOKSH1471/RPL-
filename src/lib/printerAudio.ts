/**
 * Realistic Web Audio Synthesizer for Thermal Receipt Printer
 * Accurately synced with paper rollout duration and physical knife tear.
 */

class PrinterAudioEngine {
  private audioCtx: AudioContext | null = null;
  private soundEnabled: boolean = true;

  constructor() {
    // Lazy initialized on first user gesture
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    if (enabled) {
      this.initAudio();
    }
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  public initAudio() {
    try {
      if (!this.audioCtx) {
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtxClass) {
          this.audioCtx = new AudioCtxClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
    } catch (e) {
      console.warn('AudioContext initialization failed', e);
    }
  }

  /**
   * Mechanical motor hum & stepper clicks synced to motion duration.
   */
  public playPrinterSound(mode: 'classic' | 'smooth', motionDurationMs: number = 2500) {
    if (!this.soundEnabled) return;
    this.initAudio();
    if (!this.audioCtx) return;

    try {
      const ctx = this.audioCtx;
      const now = ctx.currentTime;
      const duration = motionDurationMs / 1000;

      // 1. Noise buffer for mechanical motor background drone
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      // Bandpass filter for thermal motor hum
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(mode === 'classic' ? 850 : 600, now);
      filter.Q.setValueAtTime(3.5, now);

      const gainNode = ctx.createGain();
      const peakGain = mode === 'classic' ? 0.07 : 0.045;
      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.linearRampToValueAtTime(peakGain, now + 0.08);
      gainNode.gain.setValueAtTime(peakGain, now + duration - 0.12);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      whiteNoise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      whiteNoise.start(now);
      whiteNoise.stop(now + duration);

      // 2. Stepper motor pulse clicks for Classic mode
      if (mode === 'classic') {
        const stepCount = 14;
        const interval = (duration - 0.1) / stepCount;

        for (let i = 0; i < stepCount; i++) {
          const stepTime = now + i * interval;
          const osc = ctx.createOscillator();
          const stepGain = ctx.createGain();

          osc.type = 'square';
          osc.frequency.setValueAtTime(210 + Math.random() * 60, stepTime);

          stepGain.gain.setValueAtTime(0.05, stepTime);
          stepGain.gain.exponentialRampToValueAtTime(0.001, stepTime + 0.02);

          osc.connect(stepGain);
          stepGain.connect(ctx.destination);

          osc.start(stepTime);
          osc.stop(stepTime + 0.02);
        }
      }
    } catch (err) {
      console.warn('Error playing printer sound', err);
    }
  }

  /**
   * Realistic mechanical cutter blade slice sound.
   */
  public playTearSound() {
    if (!this.soundEnabled) return;
    this.initAudio();
    if (!this.audioCtx) return;

    try {
      const ctx = this.audioCtx;
      const now = ctx.currentTime;
      const duration = 0.35;
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.06));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1400, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + duration);
    } catch (err) {
      console.warn('Error playing tear sound', err);
    }
  }
}

export const printerAudio = new PrinterAudioEngine();
