export type SoundPreset = 'off' | 'rain' | 'brown' | 'binaural' | 'cafe';

class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeNodes: AudioNode[] = [];
  private currentPreset: SoundPreset = 'off';
  private volume = 0.45;

  setPreset(preset: SoundPreset, volume = this.volume) {
    this.stop();
    this.currentPreset = preset;
    this.volume = volume;
    if (preset === 'off') return;

    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    if (!this.ctx) {
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    const ctx = this.ctx;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.001, ctx.currentTime);
    master.gain.exponentialRampToValueAtTime(Math.max(0.02, volume * 0.32), ctx.currentTime + 0.6);
    master.connect(ctx.destination);
    this.masterGain = master;

    if (preset === 'rain' || preset === 'brown' || preset === 'cafe') {
      const bufferSize = ctx.sampleRate * 3;
      const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const out = buffer.getChannelData(ch);
        let lastOut = 0;
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          if (preset === 'brown') {
            out[i] = (lastOut + 0.02 * white) / 1.02;
            lastOut = out[i];
            out[i] *= 3.2;
          } else {
            b0 = 0.99765 * b0 + white * 0.099046;
            b1 = 0.963 * b1 + white * 0.2965164;
            b2 = 0.57 * b2 + white * 1.0526913;
            out[i] = (b0 + b1 + b2 + white * 0.1848) * 0.14;
            if (preset === 'cafe' && Math.random() < 0.0004) {
              out[i] += (Math.random() - 0.5) * 0.18;
            }
          }
        }
      }
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = preset === 'cafe' ? 'bandpass' : 'lowpass';
      filter.frequency.value = preset === 'brown' ? 320 : preset === 'cafe' ? 680 : 1900;
      if (preset === 'cafe') filter.Q.value = 0.7;

      src.connect(filter);
      filter.connect(master);
      src.start();
      this.activeNodes.push(src, filter);

      if (preset === 'rain') {
        // Gentle droplet shimmer via LFO modulation
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.value = 0.18;
        lfoGain.gain.value = 260;
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        lfo.start();
        this.activeNodes.push(lfo, lfoGain);
      }
    } else if (preset === 'binaural') {
      // 40Hz Gamma Focus Binaural Beat (200Hz L / 240Hz R) + soft harmonic pad
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
      gainOsc.connect(master);
      pad.connect(gainPad);
      gainPad.connect(master);

      oscL.start();
      oscR.start();
      pad.start();
      this.activeNodes.push(oscL, oscR, pad, merger, gainOsc, gainPad);
    }
  }

  setVolume(val: number) {
    this.volume = val;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(Math.max(0.01, val * 0.32), this.ctx.currentTime, 0.08);
    }
  }

  stop() {
    for (const node of this.activeNodes) {
      try {
        if ('stop' in node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
          (node as AudioScheduledSourceNode).stop();
        }
        node.disconnect();
      } catch {
        // ignore
      }
    }
    this.activeNodes = [];
    if (this.masterGain) {
      try {
        this.masterGain.disconnect();
      } catch {
        // ignore
      }
      this.masterGain = null;
    }
    this.currentPreset = 'off';
  }

  getPreset() {
    return this.currentPreset;
  }
}

export const soundEngine = new AmbientSoundEngine();
