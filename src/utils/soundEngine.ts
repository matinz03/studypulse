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
  timers: number[];
}

class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private noiseBurstBuffer: AudioBuffer | null = null;
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
      master.gain.setValueAtTime(Math.max(0.01, this.volume * 0.55), this.ctx.currentTime);
      master.connect(this.ctx.destination);
      this.masterGain = master;
    }
    return this.ctx;
  }

  /**
   * Reusable 2-second white noise buffer for transient Foley events
   * (fire crackles, page turns, pencil strokes, espresso steam, raindrops).
   */
  private getWhiteNoiseBuffer(ctx: AudioContext): AudioBuffer {
    if (this.noiseBurstBuffer && this.noiseBurstBuffer.sampleRate === ctx.sampleRate) {
      return this.noiseBurstBuffer;
    }
    const len = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this.noiseBurstBuffer = buf;
    return buf;
  }

  /**
   * Generates a seamless stereo looping buffer (brown, pink, or flame-textured)
   * with DC-offset removal, RMS normalization, and equal-power seam crossfading.
   */
  private createSeamlessNoiseBuffer(
    ctx: AudioContext,
    durationSec: number,
    mode: 'brown' | 'pink' | 'white_soft'
  ): AudioBuffer {
    const sr = ctx.sampleRate;
    const totalSamples = Math.floor(sr * durationSec);
    const fadeSamples = Math.min(Math.floor(sr * 0.4), Math.floor(totalSamples / 4));
    const genSamples = totalSamples + fadeSamples;
    const buffer = ctx.createBuffer(2, totalSamples, sr);

    for (let ch = 0; ch < 2; ch++) {
      const raw = new Float32Array(genSamples);
      let lastBrown = 0;
      let b0 = 0,
        b1 = 0,
        b2 = 0,
        b3 = 0,
        b4 = 0,
        b5 = 0,
        b6 = 0;

      for (let i = 0; i < genSamples; i++) {
        const white = Math.random() * 2 - 1;
        if (mode === 'brown') {
          // Leaky Brownian integration with warm low-mid density
          lastBrown = (lastBrown + 0.042 * white) / 1.042;
          raw[i] = lastBrown;
        } else if (mode === 'pink') {
          // Paul Kellet's 7-pole pink noise filter
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          raw[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
          b6 = white * 0.115926;
        } else {
          b0 = 0.82 * b0 + white * 0.18;
          raw[i] = b0;
        }
      }

      // Remove DC offset
      let mean = 0;
      for (let i = 0; i < genSamples; i++) mean += raw[i];
      mean /= genSamples;
      for (let i = 0; i < genSamples; i++) raw[i] -= mean;

      // Normalize RMS to target 0.22
      let sumSq = 0;
      for (let i = 0; i < genSamples; i++) sumSq += raw[i] * raw[i];
      const rms = Math.sqrt(sumSq / genSamples) || 1;
      const scale = 0.22 / rms;
      for (let i = 0; i < genSamples; i++) {
        raw[i] = Math.max(-0.95, Math.min(0.95, raw[i] * scale));
      }

      // Equal-power crossfade tail into head so loop boundary is 100% seamless
      const out = buffer.getChannelData(ch);
      for (let i = 0; i < totalSamples; i++) {
        if (i < fadeSamples) {
          const t = i / fadeSamples;
          const fadeIn = Math.sin(t * Math.PI * 0.5);
          const fadeOut = Math.cos(t * Math.PI * 0.5);
          out[i] = raw[i] * fadeIn + raw[totalSamples + i] * fadeOut;
        } else {
          out[i] = raw[i];
        }
      }
    }

    return buffer;
  }

  private createPanNode(ctx: AudioContext, panValue: number): AudioNode {
    if (typeof ctx.createStereoPanner === 'function') {
      const panner = ctx.createStereoPanner();
      panner.pan.value = Math.max(-1, Math.min(1, panValue));
      return panner;
    }
    const g = ctx.createGain();
    return g;
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

  /**
   * 🌊 BROWN NOISE — Deep, velvety, seamless Brownian waterfall rumble
   * with warm low-shelf body and smooth organic drift.
   */
  private buildBrownChannel(ctx: AudioContext, chGain: GainNode, nodes: AudioNode[]) {
    const buffer = this.createSeamlessNoiseBuffer(ctx, 8, 'brown');
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;

    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 35;

    const lowShelf = ctx.createBiquadFilter();
    lowShelf.type = 'lowshelf';
    lowShelf.frequency.value = 165;
    lowShelf.gain.value = 5.5;

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 880;
    lp.Q.value = 0.55;

    const outGain = ctx.createGain();
    outGain.gain.value = 1.35;

    // Gentle organic tide modulation
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = 0.08;
    lfoGain.gain.value = 110;
    lfo.connect(lfoGain);
    lfoGain.connect(lp.frequency);

    src.connect(hp);
    hp.connect(lowShelf);
    lowShelf.connect(lp);
    lp.connect(outGain);
    outGain.connect(chGain);

    src.start();
    lfo.start();
    nodes.push(src, hp, lowShelf, lp, outGain, lfo, lfoGain);
  }

  /**
   * 🌧️ RAIN — Lush multi-layer rainfall with steady shower bed + soft roof patters.
   */
  private buildRainChannel(ctx: AudioContext, chGain: GainNode, nodes: AudioNode[], timers: number[]) {
    const pinkBuf = this.createSeamlessNoiseBuffer(ctx, 7, 'pink');
    const src = ctx.createBufferSource();
    src.buffer = pinkBuf;
    src.loop = true;

    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 240;

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 3600;
    lp.Q.value = 0.5;

    const rainGain = ctx.createGain();
    rainGain.gain.value = 0.85;

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = 0.14;
    lfoGain.gain.value = 420;
    lfo.connect(lfoGain);
    lfoGain.connect(lp.frequency);

    src.connect(hp);
    hp.connect(lp);
    lp.connect(rainGain);
    rainGain.connect(chGain);
    src.start();
    lfo.start();
    nodes.push(src, hp, lp, rainGain, lfo, lfoGain);

    // Subtle raindrop patter droplets on windowpane
    const noiseBuf = this.getWhiteNoiseBuffer(ctx);
    const spawnDroplets = () => {
      if (!this.channels.has('rain') || ctx.state !== 'running') return;
      const now = ctx.currentTime;
      const count = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) {
        const start = now + Math.random() * 0.22;
        const dur = 0.012 + Math.random() * 0.018;
        const dropSrc = ctx.createBufferSource();
        dropSrc.buffer = noiseBuf;
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = 1800 + Math.random() * 2400;
        bp.Q.value = 3.2;
        const env = ctx.createGain();
        const peak = 0.04 + Math.random() * 0.05;
        env.gain.setValueAtTime(0.0001, start);
        env.gain.exponentialRampToValueAtTime(peak, start + 0.003);
        env.gain.exponentialRampToValueAtTime(0.0001, start + dur);
        const pan = this.createPanNode(ctx, (Math.random() - 0.5) * 1.4);

        dropSrc.connect(bp);
        bp.connect(env);
        env.connect(pan);
        pan.connect(chGain);
        dropSrc.start(start, Math.random() * 1.5, dur + 0.01);
        dropSrc.stop(start + dur + 0.01);
      }
    };
    const intervalId = window.setInterval(spawnDroplets, 240);
    timers.push(intervalId);
  }

  /**
   * 🔥 FIRE — Cozy hearth fireplace with:
   * 1) Warm flickering flame draft roar (110–310 Hz)
   * 2) Glowing ember & sap sizzle bed (1.5–3.8 kHz)
   * 3) Stochastic crisp wood crackles, snaps, and resonant log pops
   */
  private buildFireChannel(ctx: AudioContext, chGain: GainNode, nodes: AudioNode[], timers: number[]) {
    // Layer 1: Warm hearth flame roar
    const brownBuf = this.createSeamlessNoiseBuffer(ctx, 6, 'brown');
    const roarSrc = ctx.createBufferSource();
    roarSrc.buffer = brownBuf;
    roarSrc.loop = true;

    const roarHp = ctx.createBiquadFilter();
    roarHp.type = 'highpass';
    roarHp.frequency.value = 55;

    const roarLp = ctx.createBiquadFilter();
    roarLp.type = 'lowpass';
    roarLp.frequency.value = 260;
    roarLp.Q.value = 0.9;

    const roarGain = ctx.createGain();
    roarGain.gain.value = 0.85;

    // Flame flicker modulation
    const flickerLfo = ctx.createOscillator();
    const flickerDepth = ctx.createGain();
    flickerLfo.type = 'sine';
    flickerLfo.frequency.value = 0.55;
    flickerDepth.gain.value = 85;
    flickerLfo.connect(flickerDepth);
    flickerDepth.connect(roarLp.frequency);

    roarSrc.connect(roarHp);
    roarHp.connect(roarLp);
    roarLp.connect(roarGain);
    roarGain.connect(chGain);
    roarSrc.start();
    flickerLfo.start();
    nodes.push(roarSrc, roarHp, roarLp, roarGain, flickerLfo, flickerDepth);

    // Layer 2: Glowing ember sizzle bed
    const pinkBuf = this.createSeamlessNoiseBuffer(ctx, 6, 'pink');
    const sizzleSrc = ctx.createBufferSource();
    sizzleSrc.buffer = pinkBuf;
    sizzleSrc.loop = true;

    const sizzleBp = ctx.createBiquadFilter();
    sizzleBp.type = 'bandpass';
    sizzleBp.frequency.value = 2300;
    sizzleBp.Q.value = 0.85;

    const sizzleGain = ctx.createGain();
    sizzleGain.gain.value = 0.16;

    const sizzleLfo = ctx.createOscillator();
    const sizzleLfoGain = ctx.createGain();
    sizzleLfo.type = 'triangle';
    sizzleLfo.frequency.value = 1.25;
    sizzleLfoGain.gain.value = 0.05;
    sizzleLfo.connect(sizzleLfoGain);
    sizzleLfoGain.connect(sizzleGain.gain);

    sizzleSrc.connect(sizzleBp);
    sizzleBp.connect(sizzleGain);
    sizzleGain.connect(chGain);
    sizzleSrc.start();
    sizzleLfo.start();
    nodes.push(sizzleSrc, sizzleBp, sizzleGain, sizzleLfo, sizzleLfoGain);

    // Layer 3: Crisp wood crackles, snaps, and log pops
    const noiseBuf = this.getWhiteNoiseBuffer(ctx);
    const triggerCrackleCluster = () => {
      if (!this.channels.has('fire') || ctx.state !== 'running') return;
      const now = ctx.currentTime;
      const snapCount = 1 + Math.floor(Math.random() * 4);
      const clusterPan = (Math.random() - 0.5) * 1.1;

      for (let i = 0; i < snapCount; i++) {
        const start = now + i * (0.018 + Math.random() * 0.045) + Math.random() * 0.02;
        const dur = 0.008 + Math.random() * 0.024;
        const snapSrc = ctx.createBufferSource();
        snapSrc.buffer = noiseBuf;

        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.value = 1200;

        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = 2100 + Math.random() * 3400;
        bp.Q.value = 2.4 + Math.random() * 2.5;

        const env = ctx.createGain();
        const peak = 0.22 + Math.random() * 0.36;
        env.gain.setValueAtTime(0.0001, start);
        env.gain.exponentialRampToValueAtTime(peak, start + 0.0015);
        env.gain.exponentialRampToValueAtTime(0.0001, start + dur);

        const pan = this.createPanNode(ctx, clusterPan + (Math.random() - 0.5) * 0.25);

        snapSrc.connect(hp);
        hp.connect(bp);
        bp.connect(env);
        env.connect(pan);
        pan.connect(chGain);

        snapSrc.start(start, Math.random() * 1.6, dur + 0.01);
        snapSrc.stop(start + dur + 0.01);
      }

      // 35% chance of a resonant burning-wood pop / ember thump
      if (Math.random() < 0.35) {
        const popStart = now + 0.01 + Math.random() * 0.05;
        const osc = ctx.createOscillator();
        const popEnv = ctx.createGain();
        osc.type = 'triangle';
        const baseFreq = 260 + Math.random() * 220;
        osc.frequency.setValueAtTime(baseFreq, popStart);
        osc.frequency.exponentialRampToValueAtTime(75, popStart + 0.038);

        popEnv.gain.setValueAtTime(0.0001, popStart);
        popEnv.gain.exponentialRampToValueAtTime(0.14 + Math.random() * 0.12, popStart + 0.003);
        popEnv.gain.exponentialRampToValueAtTime(0.0001, popStart + 0.042);

        const pan = this.createPanNode(ctx, clusterPan);
        osc.connect(popEnv);
        popEnv.connect(pan);
        pan.connect(chGain);
        osc.start(popStart);
        osc.stop(popStart + 0.048);
      }
    };

    // Fire immediate crackle on selection + continuous organic hearth schedule
    const firstId = window.setTimeout(triggerCrackleCluster, 40);
    const intervalId = window.setInterval(() => {
      triggerCrackleCluster();
      if (Math.random() < 0.45) {
        const subId = window.setTimeout(triggerCrackleCluster, 70 + Math.random() * 90);
        timers.push(subId);
      }
    }, 210);
    timers.push(firstId, intervalId);
  }

  /**
   * ☕ CAFÉ — Cozy coffeehouse soundscape with:
   * 1) Warm room ambience & espresso bar hum
   * 2) Multi-voice formant-filtered indistinct conversation murmur ("walla")
   * 3) Live syllabic chatter phrases + ceramic cup/saucer clinks, spoon taps & steam bursts
   */
  private buildCafeChannel(ctx: AudioContext, chGain: GainNode, nodes: AudioNode[], timers: number[]) {
    const pinkBuf = this.createSeamlessNoiseBuffer(ctx, 8, 'pink');

    // Layer 1: Warm café room tone
    const roomSrc = ctx.createBufferSource();
    roomSrc.buffer = pinkBuf;
    roomSrc.loop = true;

    const roomHp = ctx.createBiquadFilter();
    roomHp.type = 'highpass';
    roomHp.frequency.value = 120;

    const roomLp = ctx.createBiquadFilter();
    roomLp.type = 'lowpass';
    roomLp.frequency.value = 1450;

    const roomGain = ctx.createGain();
    roomGain.gain.value = 0.24;

    roomSrc.connect(roomHp);
    roomHp.connect(roomLp);
    roomLp.connect(roomGain);
    roomGain.connect(chGain);
    roomSrc.start();
    nodes.push(roomSrc, roomHp, roomLp, roomGain);

    // Layer 2: 4 Continuous Formant-Modulated Conversational Murmur Tables ("Walla")
    const tableConfigs = [
      { f1: 440, f2: 1180, rate1: 3.1, rate2: 0.45, pan: -0.65, gain: 0.22 },
      { f1: 580, f2: 1520, rate1: 3.8, rate2: 0.62, pan: -0.2, gain: 0.24 },
      { f1: 390, f2: 1020, rate1: 2.7, rate2: 0.38, pan: 0.28, gain: 0.22 },
      { f1: 650, f2: 1760, rate1: 4.3, rate2: 0.53, pan: 0.68, gain: 0.2 },
    ];

    for (const cfg of tableConfigs) {
      const tableSrc = ctx.createBufferSource();
      tableSrc.buffer = pinkBuf;
      tableSrc.loop = true;

      const formant1 = ctx.createBiquadFilter();
      formant1.type = 'bandpass';
      formant1.frequency.value = cfg.f1;
      formant1.Q.value = 3.4;

      const formant2 = ctx.createBiquadFilter();
      formant2.type = 'bandpass';
      formant2.frequency.value = cfg.f2;
      formant2.Q.value = 3.8;

      const voiceGate = ctx.createGain();
      voiceGate.gain.value = cfg.gain;

      // Syllabic cadence modulator
      const syllableLfo = ctx.createOscillator();
      const syllableDepth = ctx.createGain();
      syllableLfo.type = 'sine';
      syllableLfo.frequency.value = cfg.rate1;
      syllableDepth.gain.value = cfg.gain * 0.65;
      syllableLfo.connect(syllableDepth);
      syllableDepth.connect(voiceGate.gain);

      // Vowel formant shift modulator
      const vowelLfo = ctx.createOscillator();
      const vowelDepth = ctx.createGain();
      vowelLfo.type = 'triangle';
      vowelLfo.frequency.value = cfg.rate2;
      vowelDepth.gain.value = 180;
      vowelLfo.connect(vowelDepth);
      vowelDepth.connect(formant2.frequency);

      const pan = this.createPanNode(ctx, cfg.pan);

      tableSrc.connect(formant1);
      tableSrc.connect(formant2);
      formant1.connect(voiceGate);
      formant2.connect(voiceGate);
      voiceGate.connect(pan);
      pan.connect(chGain);

      tableSrc.start(ctx.currentTime, Math.random() * 4);
      syllableLfo.start();
      vowelLfo.start();
      nodes.push(tableSrc, formant1, formant2, voiceGate, syllableLfo, syllableDepth, vowelLfo, vowelDepth, pan);
    }

    // Layer 3A: Live Syllabic Conversational Murmur Bursts (indistinct human speech cadence)
    const triggerChatterPhrase = () => {
      if (!this.channels.has('cafe') || ctx.state !== 'running') return;
      const now = ctx.currentTime;
      const syllables = 2 + Math.floor(Math.random() * 4);
      const basePitch = 115 + Math.random() * 135; // Male/female vocal fundamental range
      const phrasePan = (Math.random() - 0.5) * 1.4;
      let cursor = now + 0.01;

      for (let s = 0; s < syllables; s++) {
        const dur = 0.085 + Math.random() * 0.095;
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        const pitch = basePitch * (0.92 + Math.random() * 0.18);
        osc.frequency.setValueAtTime(pitch, cursor);
        osc.frequency.linearRampToValueAtTime(pitch * (0.95 + Math.random() * 0.1), cursor + dur);

        // Formant filter + muffle lowpass so it sounds like distant warm conversation across the café
        const f1 = ctx.createBiquadFilter();
        f1.type = 'bandpass';
        f1.frequency.value = 380 + Math.random() * 420;
        f1.Q.value = 4.2;

        const muffle = ctx.createBiquadFilter();
        muffle.type = 'lowpass';
        muffle.frequency.value = 1150;

        const env = ctx.createGain();
        const peak = 0.045 + Math.random() * 0.04;
        env.gain.setValueAtTime(0.0001, cursor);
        env.gain.exponentialRampToValueAtTime(peak, cursor + 0.02);
        env.gain.exponentialRampToValueAtTime(0.0001, cursor + dur);

        const pan = this.createPanNode(ctx, phrasePan);
        osc.connect(f1);
        f1.connect(muffle);
        muffle.connect(env);
        env.connect(pan);
        pan.connect(chGain);

        osc.start(cursor);
        osc.stop(cursor + dur + 0.01);
        cursor += dur + 0.025 + Math.random() * 0.05;
      }
    };

    // Layer 3B: Ceramic Cup/Saucer Clinks, Spoon Stirring & Espresso Steam
    const noiseBuf = this.getWhiteNoiseBuffer(ctx);
    const triggerCafeFoley = () => {
      if (!this.channels.has('cafe') || ctx.state !== 'running') return;
      const now = ctx.currentTime;
      const panVal = (Math.random() - 0.5) * 1.3;
      const pan = this.createPanNode(ctx, panVal);
      pan.connect(chGain);
      const roll = Math.random();

      if (roll < 0.5) {
        // Ceramic coffee cup / saucer clink (dual inharmonic porcelain resonances)
        const base = 1350 + Math.random() * 550;
        const partials = [base, base * 1.92, base * 2.85];
        partials.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const env = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          const dur = 0.045 + (2 - idx) * 0.022;
          const peak = (0.075 - idx * 0.02) * (0.8 + Math.random() * 0.3);
          env.gain.setValueAtTime(0.0001, now);
          env.gain.exponentialRampToValueAtTime(Math.max(0.01, peak), now + 0.002);
          env.gain.exponentialRampToValueAtTime(0.0001, now + dur);
          osc.connect(env);
          env.connect(pan);
          osc.start(now);
          osc.stop(now + dur + 0.01);
        });
      } else if (roll < 0.82) {
        // Spoon double-clink against espresso cup
        const hits = [0, 0.11 + Math.random() * 0.05];
        const base = 2250 + Math.random() * 650;
        for (const offset of hits) {
          const t = now + offset;
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const env = ctx.createGain();
          osc1.type = 'sine';
          osc2.type = 'triangle';
          osc1.frequency.setValueAtTime(base, t);
          osc2.frequency.setValueAtTime(base * 2.14, t);
          env.gain.setValueAtTime(0.0001, t);
          env.gain.exponentialRampToValueAtTime(0.055, t + 0.0015);
          env.gain.exponentialRampToValueAtTime(0.0001, t + 0.055);
          osc1.connect(env);
          osc2.connect(env);
          env.connect(pan);
          osc1.start(t);
          osc2.start(t);
          osc1.stop(t + 0.06);
          osc2.stop(t + 0.06);
        }
      } else {
        // Espresso steam wand gentle hiss
        const dur = 0.45 + Math.random() * 0.45;
        const steamSrc = ctx.createBufferSource();
        steamSrc.buffer = noiseBuf;
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = 2200 + Math.random() * 600;
        bp.Q.value = 1.4;
        const env = ctx.createGain();
        env.gain.setValueAtTime(0.0001, now);
        env.gain.exponentialRampToValueAtTime(0.07, now + 0.08);
        env.gain.exponentialRampToValueAtTime(0.0001, now + dur);
        steamSrc.connect(bp);
        bp.connect(env);
        env.connect(pan);
        steamSrc.start(now, Math.random() * 1.2, dur + 0.02);
        steamSrc.stop(now + dur + 0.02);
      }
    };

    const firstChatter = window.setTimeout(triggerChatterPhrase, 50);
    const firstFoley = window.setTimeout(triggerCafeFoley, 140);
    const chatterInterval = window.setInterval(triggerChatterPhrase, 380);
    const foleyInterval = window.setInterval(triggerCafeFoley, 1850);
    timers.push(firstChatter, firstFoley, chatterInterval, foleyInterval);
  }

  /**
   * 📖 LIBRARY — Quiet university reading room with:
   * 1) Soft, wide reading-hall air circulation
   * 2) Steady distant wooden grandfather clock tick-tock (1 Hz)
   * 3) Crisp paper page turns, pencil-on-paper writing strokes & soft wooden desk shifts
   */
  private buildLibraryChannel(ctx: AudioContext, chGain: GainNode, nodes: AudioNode[], timers: number[]) {
    // Layer 1: Hushed airy reading hall tone (no hollow bandpass pipe resonance)
    const softBuf = this.createSeamlessNoiseBuffer(ctx, 8, 'white_soft');
    const hallSrc = ctx.createBufferSource();
    hallSrc.buffer = softBuf;
    hallSrc.loop = true;

    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 95;

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 950;

    const hallGain = ctx.createGain();
    hallGain.gain.value = 0.14;

    hallSrc.connect(hp);
    hp.connect(lp);
    lp.connect(hallGain);
    hallGain.connect(chGain);
    hallSrc.start();
    nodes.push(hallSrc, hp, lp, hallGain);

    const noiseBuf = this.getWhiteNoiseBuffer(ctx);

    // Layer 2: Distant reading-room wooden clock tick-tock (every 1.0s)
    let isTick = true;
    const triggerClockTick = () => {
      if (!this.channels.has('library') || ctx.state !== 'running') return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.type = 'triangle';
      const freq = isTick ? 880 : 740;
      isTick = !isTick;
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.016);

      env.gain.setValueAtTime(0.0001, now);
      env.gain.exponentialRampToValueAtTime(0.06, now + 0.0015);
      env.gain.exponentialRampToValueAtTime(0.0001, now + 0.022);

      const pan = this.createPanNode(ctx, -0.35);
      osc.connect(env);
      env.connect(pan);
      pan.connect(chGain);
      osc.start(now);
      osc.stop(now + 0.026);
    };

    // Layer 3: Crisp Paper Page Turns, Pencil Writing Strokes & Soft Book/Desk Shifts
    const triggerLibraryFoley = () => {
      if (!this.channels.has('library') || ctx.state !== 'running') return;
      const now = ctx.currentTime;
      const panVal = (Math.random() - 0.5) * 1.2;
      const pan = this.createPanNode(ctx, panVal);
      pan.connect(chGain);
      const roll = Math.random();

      if (roll < 0.5) {
        // Crisp textbook page turn (2-stage fingertip lift + sweeping paper rustle)
        const liftSrc = ctx.createBufferSource();
        liftSrc.buffer = noiseBuf;
        const liftBp = ctx.createBiquadFilter();
        liftBp.type = 'bandpass';
        liftBp.frequency.value = 3100;
        liftBp.Q.value = 2.1;
        const liftEnv = ctx.createGain();
        liftEnv.gain.setValueAtTime(0.0001, now);
        liftEnv.gain.exponentialRampToValueAtTime(0.11, now + 0.008);
        liftEnv.gain.exponentialRampToValueAtTime(0.0001, now + 0.038);
        liftSrc.connect(liftBp);
        liftBp.connect(liftEnv);
        liftEnv.connect(pan);
        liftSrc.start(now, Math.random() * 1.4, 0.045);
        liftSrc.stop(now + 0.045);

        // Sweeping page flip
        const sweepStart = now + 0.045;
        const sweepDur = 0.19 + Math.random() * 0.09;
        const pageSrc = ctx.createBufferSource();
        pageSrc.buffer = noiseBuf;

        const hpPaper = ctx.createBiquadFilter();
        hpPaper.type = 'highpass';
        hpPaper.frequency.value = 1100;

        const bpPaper = ctx.createBiquadFilter();
        bpPaper.type = 'bandpass';
        bpPaper.Q.value = 1.7;
        bpPaper.frequency.setValueAtTime(1650, sweepStart);
        bpPaper.frequency.exponentialRampToValueAtTime(3600, sweepStart + sweepDur * 0.45);
        bpPaper.frequency.exponentialRampToValueAtTime(1850, sweepStart + sweepDur);

        const pageEnv = ctx.createGain();
        pageEnv.gain.setValueAtTime(0.0001, sweepStart);
        pageEnv.gain.exponentialRampToValueAtTime(0.22, sweepStart + sweepDur * 0.3);
        pageEnv.gain.exponentialRampToValueAtTime(0.0001, sweepStart + sweepDur);

        pageSrc.connect(hpPaper);
        hpPaper.connect(bpPaper);
        bpPaper.connect(pageEnv);
        pageEnv.connect(pan);
        pageSrc.start(sweepStart, Math.random() * 1.4, sweepDur + 0.02);
        pageSrc.stop(sweepStart + sweepDur + 0.02);
      } else if (roll < 0.85) {
        // Pencil / fountain pen writing strokes on paper (3–6 rhythmic strokes)
        const strokes = 3 + Math.floor(Math.random() * 4);
        let cursor = now + 0.01;
        for (let s = 0; s < strokes; s++) {
          const dur = 0.048 + Math.random() * 0.055;
          const scribbleSrc = ctx.createBufferSource();
          scribbleSrc.buffer = noiseBuf;

          const bp = ctx.createBiquadFilter();
          bp.type = 'bandpass';
          bp.frequency.value = 2850 + Math.random() * 950;
          bp.Q.value = 2.4;

          const env = ctx.createGain();
          const peak = 0.11 + Math.random() * 0.06;
          env.gain.setValueAtTime(0.0001, cursor);
          env.gain.exponentialRampToValueAtTime(peak, cursor + 0.01);
          env.gain.exponentialRampToValueAtTime(0.0001, cursor + dur);

          scribbleSrc.connect(bp);
          bp.connect(env);
          env.connect(pan);
          scribbleSrc.start(cursor, Math.random() * 1.5, dur + 0.01);
          scribbleSrc.stop(cursor + dur + 0.01);

          cursor += dur + 0.035 + Math.random() * 0.05;
        }
      } else {
        // Soft hardcover book placement / wooden study desk creak
        const osc = ctx.createOscillator();
        const env = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(165, now);
        osc.frequency.exponentialRampToValueAtTime(78, now + 0.085);
        env.gain.setValueAtTime(0.0001, now);
        env.gain.exponentialRampToValueAtTime(0.12, now + 0.008);
        env.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
        osc.connect(env);
        env.connect(pan);
        osc.start(now);
        osc.stop(now + 0.095);
      }
    };

    // Immediate page turn & clock tick on activation + steady reading hall schedule
    const firstFoley = window.setTimeout(triggerLibraryFoley, 50);
    const firstTick = window.setTimeout(triggerClockTick, 220);
    const clockInterval = window.setInterval(triggerClockTick, 1000);
    const foleyInterval = window.setInterval(triggerLibraryFoley, 1750);
    timers.push(firstFoley, firstTick, clockInterval, foleyInterval);
  }

  private startChannel(track: TrackKey, level: number) {
    const ctx = this.ensureAudioContext();
    if (!ctx || !this.masterGain) return;
    const chGain = ctx.createGain();
    chGain.gain.setValueAtTime(0.001, ctx.currentTime);
    chGain.gain.exponentialRampToValueAtTime(Math.max(0.01, level), ctx.currentTime + 0.25);
    chGain.connect(this.masterGain);

    const nodes: AudioNode[] = [chGain];
    const timers: number[] = [];
    this.channels.set(track, { gain: chGain, nodes, timers });

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
    } else if (track === 'brown') {
      this.buildBrownChannel(ctx, chGain, nodes);
    } else if (track === 'rain') {
      this.buildRainChannel(ctx, chGain, nodes, timers);
    } else if (track === 'fire') {
      this.buildFireChannel(ctx, chGain, nodes, timers);
    } else if (track === 'cafe') {
      this.buildCafeChannel(ctx, chGain, nodes, timers);
    } else if (track === 'library') {
      this.buildLibraryChannel(ctx, chGain, nodes, timers);
    }
  }

  private stopChannel(track: TrackKey) {
    const ch = this.channels.get(track);
    if (!ch) return;
    for (const timerId of ch.timers) {
      window.clearInterval(timerId);
      window.clearTimeout(timerId);
    }
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
      this.masterGain.gain.setTargetAtTime(Math.max(0.01, val * 0.55), this.ctx.currentTime, 0.08);
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
