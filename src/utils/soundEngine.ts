export type SoundPreset = 'off' | 'rain' | 'brown' | 'binaural' | 'cafe' | 'fire' | 'library' | 'mix';
export type TrackKey = 'rain' | 'brown' | 'binaural' | 'cafe' | 'fire' | 'library';

export const TRACK_KEYS: TrackKey[] = ['rain', 'fire', 'brown', 'binaural', 'cafe', 'library'];

export const SAVED_MIX_PRESETS: Array<{ key: string; label: string; icon: string; mix: Partial<Record<TrackKey, number>> }> = [
  { key: 'stormy_library', label: 'Stormy Library', icon: '🌧️', mix: { rain: 0.65, fire: 0.45, library: 0.35 } },
  { key: 'cozy_hearth', label: 'Hearth & Café', icon: '☕', mix: { fire: 0.55, cafe: 0.45, brown: 0.25 } },
  { key: 'neural_gamma', label: '40Hz Deep Lab', icon: '🧠', mix: { binaural: 0.45, brown: 0.55, rain: 0.2 } },
];

interface ActiveChannel {
  gain: GainNode;
  nodes: AudioNode[];
}

class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private channels = new Map<TrackKey, ActiveChannel>();
  private trackMix: Record<TrackKey, number> = {
    rain: 0,
    brown: 0,
    binaural: 0,
    cafe: 0,
    fire: 0,
    library: 0,
  };
  private currentPreset: SoundPreset = 'off';
  private volume = 0.45;
  private sfxMuted = false;

  setSfxMuted(muted: boolean) {
    this.sfxMuted = muted;
  }

  isSfxMuted() {
    return this.sfxMuted;
  }

  private ensureAudioContext(): AudioContext | null {
    const AudioCtx =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!this.ctx) this.ctx = new AudioCtx();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    if (!this.masterGain) {
      const master = this.ctx.createGain();
      master.gain.setValueAtTime(Math.max(0.01, this.volume * 0.34), this.ctx.currentTime);
      master.connect(this.ctx.destination);
      this.masterGain = master;
    }
    return this.ctx;
  }

  private playToneSequence(notes: Array<{ freq: number; dur: number; delay: number; type?: OscillatorType; vol?: number }>) {
    if (this.sfxMuted) return;
    try {
      const AudioCtx =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.ctx) this.ctx = new AudioCtx();
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      const ctx = this.ctx;
      const base = ctx.currentTime + 0.01;
      for (const n of notes) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = n.type || 'square';
        osc.frequency.setValueAtTime(n.freq, base + n.delay);
        const start = base + n.delay;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(n.vol ?? 0.06, start + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + n.dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + n.dur + 0.02);
      }
    } catch {
      // ignore blocked audio
    }
  }

  playPixelHit() {
    this.playToneSequence([
      { freq: 340, dur: 0.06, delay: 0, type: 'square', vol: 0.05 },
      { freq: 190, dur: 0.08, delay: 0.04, type: 'sawtooth', vol: 0.04 },
    ]);
  }

  playPixelCrit() {
    this.playToneSequence([
      { freq: 520, dur: 0.06, delay: 0, type: 'square', vol: 0.06 },
      { freq: 780, dur: 0.08, delay: 0.05, type: 'square', vol: 0.06 },
      { freq: 1040, dur: 0.12, delay: 0.1, type: 'triangle', vol: 0.07 },
    ]);
  }

  playPixelGuard() {
    this.playToneSequence([
      { freq: 290, dur: 0.08, delay: 0, type: 'triangle', vol: 0.06 },
      { freq: 440, dur: 0.12, delay: 0.05, type: 'sine', vol: 0.06 },
    ]);
  }

  playPixelStep() {
    this.playToneSequence([
      { freq: 240, dur: 0.045, delay: 0, type: 'triangle', vol: 0.04 },
      { freq: 310, dur: 0.055, delay: 0.04, type: 'triangle', vol: 0.04 },
    ]);
  }

  playPixelDefeat() {
    this.playToneSequence([
      { freq: 260, dur: 0.12, delay: 0, type: 'sawtooth', vol: 0.05 },
      { freq: 195, dur: 0.14, delay: 0.11, type: 'sawtooth', vol: 0.05 },
      { freq: 130, dur: 0.22, delay: 0.23, type: 'sawtooth', vol: 0.05 },
    ]);
  }

  playPixelLoot(rarity = 'common') {
    if (rarity === 'legendary' || rarity === 'epic') {
      this.playToneSequence([
        { freq: 523.25, dur: 0.08, delay: 0, type: 'square', vol: 0.06 },
        { freq: 659.25, dur: 0.08, delay: 0.07, type: 'square', vol: 0.06 },
        { freq: 783.99, dur: 0.09, delay: 0.14, type: 'square', vol: 0.06 },
        { freq: 1046.5, dur: 0.18, delay: 0.21, type: 'square', vol: 0.07 },
      ]);
    } else {
      this.playToneSequence([
        { freq: 440, dur: 0.07, delay: 0, type: 'triangle', vol: 0.05 },
        { freq: 659.25, dur: 0.12, delay: 0.06, type: 'triangle', vol: 0.06 },
      ]);
    }
  }

  playPixelParry() {
    this.playToneSequence([
      { freq: 587.33, dur: 0.06, delay: 0, type: 'square', vol: 0.06 },
      { freq: 880, dur: 0.11, delay: 0.04, type: 'triangle', vol: 0.07 },
      { freq: 1174.66, dur: 0.14, delay: 0.09, type: 'triangle', vol: 0.06 },
    ]);
  }

  playPixelSecret() {
    this.playToneSequence([
      { freq: 392, dur: 0.07, delay: 0, type: 'triangle', vol: 0.06 },
      { freq: 493.88, dur: 0.07, delay: 0.07, type: 'triangle', vol: 0.06 },
      { freq: 587.33, dur: 0.07, delay: 0.14, type: 'triangle', vol: 0.06 },
      { freq: 783.99, dur: 0.16, delay: 0.21, type: 'square', vol: 0.06 },
    ]);
  }

  playPixelTrap() {
    this.playToneSequence([
      { freq: 180, dur: 0.09, delay: 0, type: 'sawtooth', vol: 0.06 },
      { freq: 140, dur: 0.14, delay: 0.07, type: 'sawtooth', vol: 0.05 },
    ]);
  }

  private startChannel(track: TrackKey, level: number) {
    const ctx = this.ensureAudioContext();
    if (!ctx || !this.masterGain) return;
    const chGain = ctx.createGain();
    chGain.gain.setValueAtTime(0.001, ctx.currentTime);
    chGain.gain.exponentialRampToValueAtTime(Math.max(0.01, level), ctx.currentTime + 0.35);
    chGain.connect(this.masterGain);

    const nodes: AudioNode[] = [chGain];
    if (track === 'binaural') {
      const merger = ctx.createChannelMerger(2);
      const oscL = ctx.createOscillator();
      const oscR = ctx.createOscillator();
      const pad = ctx.createOscillator();
      const gainOsc = ctx.createGain();
      const gainPad = ctx.createGain();
      oscL.type = 'sine';
      oscR.type = 'sine';
      pad.type = 'triangle';
      oscL.frequency.value = 200;
      oscR.frequency.value = 240;
      pad.frequency.value = 100;
      gainOsc.gain.value = 0.14;
      gainPad.gain.value = 0.07;
      oscL.connect(merger, 0, 0);
      oscR.connect(merger, 0, 1);
      merger.connect(gainOsc);
      gainOsc.connect(chGain);
      pad.connect(gainPad);
      gainPad.connect(chGain);
      oscL.start();
      oscR.start();
      pad.start();
      nodes.push(oscL, oscR, pad, merger, gainOsc, gainPad);
    } else {
      const bufferSize = ctx.sampleRate * 3;
      const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const out = buffer.getChannelData(ch);
        let lastOut = 0;
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          if (track === 'brown' || track === 'fire') {
            out[i] = (lastOut + 0.02 * white) / 1.02;
            lastOut = out[i];
            out[i] *= track === 'fire' ? 2.8 : 3.2;
            if (track === 'fire' && Math.random() < 0.00055) {
              out[i] += (Math.random() - 0.5) * 0.65;
            }
          } else {
            b0 = 0.99765 * b0 + white * 0.099046;
            b1 = 0.963 * b1 + white * 0.2965164;
            b2 = 0.57 * b2 + white * 1.0526913;
            out[i] = (b0 + b1 + b2 + white * 0.1848) * (track === 'library' ? 0.09 : 0.14);
            if (track === 'cafe' && Math.random() < 0.0004) {
              out[i] += (Math.random() - 0.5) * 0.18;
            } else if (track === 'library' && Math.random() < 0.00008) {
              out[i] += (Math.random() - 0.5) * 0.09;
            }
          }
        }
      }
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = track === 'cafe' || track === 'library' ? 'bandpass' : 'lowpass';
      filter.frequency.value =
        track === 'brown' ? 320 : track === 'fire' ? 460 : track === 'cafe' ? 680 : track === 'library' ? 520 : 1900;
      if (track === 'cafe' || track === 'library') filter.Q.value = track === 'library' ? 1.1 : 0.7;
      src.connect(filter);
      filter.connect(chGain);
      src.start();
      nodes.push(src, filter);

      if (track === 'rain' || track === 'fire') {
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.value = track === 'fire' ? 0.35 : 0.18;
        lfoGain.gain.value = track === 'fire' ? 180 : 260;
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        lfo.start();
        nodes.push(lfo, lfoGain);
      }
    }
    this.channels.set(track, { gain: chGain, nodes });
  }

  private stopChannel(track: TrackKey) {
    const ch = this.channels.get(track);
    if (!ch) return;
    for (const node of ch.nodes) {
      try {
        if ('stop' in node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
          (node as AudioScheduledSourceNode).stop();
        }
        node.disconnect();
      } catch {
        // ignore
      }
    }
    this.channels.delete(track);
  }

  setTrackMix(mix: Partial<Record<TrackKey, number>>) {
    const nextMix = { ...this.trackMix };
    for (const k of TRACK_KEYS) {
      if (mix[k] !== undefined) {
        nextMix[k] = Math.max(0, Math.min(1, Number(mix[k]) || 0));
      }
    }
    this.trackMix = nextMix;

    const activeTracks = TRACK_KEYS.filter((k) => nextMix[k] > 0.01);
    if (activeTracks.length === 0) {
      this.stop();
      return;
    }
    this.currentPreset = activeTracks.length === 1 ? activeTracks[0] : 'mix';

    for (const k of TRACK_KEYS) {
      const val = nextMix[k];
      const existing = this.channels.get(k);
      if (val <= 0.01) {
        if (existing) this.stopChannel(k);
      } else if (existing && this.ctx) {
        existing.gain.gain.setTargetAtTime(val, this.ctx.currentTime, 0.08);
      } else {
        this.startChannel(k, val);
      }
    }
  }

  applySavedMixPreset(key: string) {
    const found = SAVED_MIX_PRESETS.find((p) => p.key === key);
    if (!found) return;
    const blank: Record<TrackKey, number> = {
      rain: 0,
      brown: 0,
      binaural: 0,
      cafe: 0,
      fire: 0,
      library: 0,
    };
    this.setTrackMix({ ...blank, ...found.mix });
  }

  getTrackMix(): Record<TrackKey, number> {
    return { ...this.trackMix };
  }

  setPreset(preset: SoundPreset, volume = this.volume) {
    this.volume = volume;
    if (preset === 'off') {
      this.stop();
      return;
    }
    if (preset === 'mix') return;
    const blank: Record<TrackKey, number> = {
      rain: 0,
      brown: 0,
      binaural: 0,
      cafe: 0,
      fire: 0,
      library: 0,
    };
    blank[preset] = 1;
    this.setTrackMix(blank);
  }

  setVolume(val: number) {
    this.volume = val;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(Math.max(0.01, val * 0.34), this.ctx.currentTime, 0.08);
    }
  }

  stop() {
    for (const k of TRACK_KEYS) {
      this.stopChannel(k);
    }
    if (this.masterGain) {
      try {
        this.masterGain.disconnect();
      } catch {
        // ignore
      }
      this.masterGain = null;
    }
    this.trackMix = { rain: 0, brown: 0, binaural: 0, cafe: 0, fire: 0, library: 0 };
    this.currentPreset = 'off';
  }

  getPreset() {
    return this.currentPreset;
  }

  getVolume() {
    return this.volume;
  }

  playCompletionChime() {
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([250, 100, 250, 100, 400]);
      }
      const AudioCtx =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.ctx) {
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      const ctx = this.ctx;
      const notes = [523.25, 659.25, 783.99, 1046.5];
      const baseTime = ctx.currentTime + 0.03;
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, baseTime + idx * 0.14);
        const start = baseTime + idx * 0.14;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.18, start + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.55);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.58);
      });
    } catch {
      // ignore audio autoplay restrictions
    }
  }
}

export const soundEngine = new AmbientSoundEngine();
