import { BEAT, musicBar, type MusicEvent } from "./composition";
class AdventureAudio {
  private ctx?: AudioContext;
  private master?: GainNode;
  private music?: GainNode;
  private effects?: GainNode;
  private timer?: number;
  private nextBar = 0;
  private bar = 0;
  private sources = new Set<AudioScheduledSourceNode>();
  private noise?: AudioBuffer;
  /** On by default. Browsers only let audio play after a gesture, see unlock(). */
  enabled = true;
  private started = false;
  private starting = false;
  volume = 0.55;
  private initialize() {
    if (this.ctx) return;
    const ctx = (this.ctx = new AudioContext());
    const master = (this.master = ctx.createGain());
    master.gain.value = 0;
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -20;
    compressor.ratio.value = 3;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 3600;
    master.connect(filter);
    filter.connect(compressor);
    compressor.connect(ctx.destination);
    this.music = ctx.createGain();
    this.music.gain.value = this.volume * 0.7;
    this.music.connect(master);
    this.effects = ctx.createGain();
    this.effects.gain.value = 0.8;
    this.effects.connect(master);
    this.noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = this.noise.getChannelData(0);
    let seed = 42;
    for (let i = 0; i < data.length; i++) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      data[i] = (seed / 4294967296) * 2 - 1;
    }
  }
  async toggle() {
    if (this.enabled) {
      this.disable();
      return false;
    }
    try {
      this.initialize();
      await this.ctx!.resume();
      this.enabled = true;
      this.begin();
      return true;
    } catch {
      this.disable();
      return false;
    }
  }
  private begin() {
    this.started = true;
    this.master!.gain.setTargetAtTime(0.55, this.ctx!.currentTime, 0.08);
    this.startMusic();
  }
  /**
   * Sound starts "on", but the browser blocks audio until the visitor interacts.
   * The first gesture starts the music; it is retried until the context runs.
   */
  async unlock() {
    if (!this.enabled || this.started || this.starting) return;
    this.starting = true;
    try {
      this.initialize();
      await this.ctx!.resume();
      if (this.enabled && !this.started && this.ctx!.state === "running")
        this.begin();
    } catch {
      /* Blocked: the next gesture tries again. */
    } finally {
      this.starting = false;
    }
  }
  /** Soft, dry, low "little drum" tap for button clicks. */
  tap() {
    if (!this.enabled || !this.started || !this.ctx || this.ctx.state !== "running")
      return;
    const ctx = this.ctx,
      t = ctx.currentTime + 0.005,
      pitch = 1 + (Math.random() - 0.5) * 0.08,
      body = ctx.createOscillator(),
      g = ctx.createGain();
    body.type = "sine";
    body.frequency.setValueAtTime(175 * pitch, t);
    body.frequency.exponentialRampToValueAtTime(82 * pitch, t + 0.1);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.2, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
    body.connect(g);
    g.connect(this.effects!);
    this.remember(body);
    body.start(t);
    body.stop(t + 0.15);
    // A very short muffled knock gives the "dry" attack without any click.
    this.noiseBurst(t, 0.028, 0.05, this.effects!, 700);
  }
  private remember(source: AudioScheduledSourceNode) {
    this.sources.add(source);
    source.onended = () => {
      this.sources.delete(source);
      source.disconnect();
    };
  }
  disable() {
    this.enabled = false;
    this.started = false;
    clearInterval(this.timer);
    this.timer = undefined;
    if (this.ctx)
      this.master?.gain.setTargetAtTime(0, this.ctx.currentTime, 0.02);
    for (const source of this.sources)
      try {
        source.stop();
      } catch {
        /* Already ended. */
      }
    this.sources.clear();
  }
  setVolume(value: number) {
    this.volume = Math.max(0, Math.min(1, value));
    if (this.ctx)
      this.music?.gain.setTargetAtTime(
        this.volume * 0.7,
        this.ctx.currentTime,
        0.1,
      );
  }
  private startMusic() {
    clearInterval(this.timer);
    this.bar = 0;
    this.nextBar = this.ctx!.currentTime + 0.12;
    const schedule = () => {
      if (!this.enabled || document.hidden) return;
      if (this.nextBar < this.ctx!.currentTime - 0.1)
        this.nextBar = this.ctx!.currentTime + 0.1;
      while (this.nextBar < this.ctx!.currentTime + 0.4) {
        for (const e of musicBar(this.bar)) this.playEvent(e, this.nextBar);
        this.bar++;
        this.nextBar += 4 * BEAT;
      }
    };
    schedule();
    this.timer = window.setInterval(schedule, 100);
  }
  private sine(
    f: number,
    time: number,
    duration: number,
    level: number,
    bus: AudioNode,
    decay = true,
  ) {
    const ctx = this.ctx!,
      o = ctx.createOscillator(),
      g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, level), time + 0.015);
    if (decay) g.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    else {
      g.gain.setTargetAtTime(level * 0.7, time + 0.08, 0.2);
      g.gain.setTargetAtTime(0.0001, time + duration - 0.25, 0.1);
    }
    o.connect(g);
    g.connect(bus);
    this.remember(o);
    o.start(time);
    o.stop(time + duration + 0.1);
  }
  private noiseBurst(
    time: number,
    duration: number,
    level: number,
    bus: AudioNode,
    frequency = 1800,
  ) {
    const ctx = this.ctx!,
      source = ctx.createBufferSource(),
      filter = ctx.createBiquadFilter(),
      g = ctx.createGain();
    source.buffer = this.noise!;
    filter.type = "bandpass";
    filter.frequency.value = frequency;
    filter.Q.value = 0.65;
    g.gain.setValueAtTime(level, time);
    g.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    source.connect(filter);
    filter.connect(g);
    g.connect(bus);
    this.remember(source);
    source.start(time);
    source.stop(time + duration);
  }
  private playEvent(e: MusicEvent, start: number) {
    const ctx = this.ctx!,
      time = start + e.beat * BEAT,
      duration = e.duration * BEAT,
      f = 440 * 2 ** ((e.note - 69) / 12),
      bus = this.music!;
    if (e.instrument === "shaker") {
      this.noiseBurst(time, duration, e.gain, bus, 2200);
      return;
    }
    if (e.instrument === "kick" || e.instrument === "conga") {
      const o = ctx.createOscillator(),
        g = ctx.createGain();
      const kick = e.instrument === "kick";
      o.type = "sine";
      o.frequency.setValueAtTime(kick ? 95 : 220, time);
      o.frequency.exponentialRampToValueAtTime(
        kick ? 46 : 125,
        time + duration,
      );
      g.gain.setValueAtTime(e.gain, time);
      g.gain.exponentialRampToValueAtTime(0.0001, time + duration);
      o.connect(g);
      g.connect(bus);
      this.remember(o);
      o.start(time);
      o.stop(time + duration);
      return;
    }
    this.sine(f, time, duration, e.gain, bus, e.instrument !== "pad");
    if (e.instrument === "mallet") {
      this.sine(f * 2.76, time, 0.12, e.gain * 0.12, bus);
      this.sine(f * 4, time, 0.065, e.gain * 0.025, bus);
    }
  }
  tone() {
    if (!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime;
    [392, 493.88, 587.33].forEach((f, i) =>
      this.sine(f, t + i * 0.08, 0.35, 0.09, this.effects!),
    );
  }
  celebrate() {
    if (!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime;
    // Original clap bursts and a small, synthetic cheering chorus. These are
    // generated characters, not recordings or imitations of identifiable kids.
    for (let i = 0; i < 52; i++) {
      const at = t + 0.2 + i * 0.065 + Math.sin(i * 13) * 0.024;
      this.noiseBurst(
        at,
        0.07 + (i % 3) * 0.015,
        0.11 + (i % 4) * 0.015,
        this.effects!,
        1100 + (i % 5) * 230,
      );
    }
    for (let v = 0; v < 5; v++) {
      const start = t + 0.2 + v * 0.14,
        ctx = this.ctx!,
        voice = ctx.createOscillator(),
        pan = ctx.createStereoPanner();
      voice.type = "sawtooth";
      voice.frequency.setValueAtTime(225 + v * 19, start);
      voice.frequency.exponentialRampToValueAtTime(345 + v * 15, start + 0.3);
      voice.frequency.exponentialRampToValueAtTime(235 + v * 18, start + 1.2);
      pan.pan.value = (v - 2) * 0.22;
      pan.connect(this.effects!);
      [650, 1250, 2350].forEach((f, i) => {
        const filter = ctx.createBiquadFilter(),
          g = ctx.createGain();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(f, start);
        filter.frequency.linearRampToValueAtTime(
          [320, 2000, 2450][i],
          start + 1.2,
        );
        filter.Q.value = 7;
        g.gain.setValueAtTime(0.0001, start);
        g.gain.exponentialRampToValueAtTime(
          [0.035, 0.018, 0.008][i],
          start + 0.13,
        );
        g.gain.exponentialRampToValueAtTime(0.0001, start + 1.35);
        voice.connect(filter);
        filter.connect(g);
        g.connect(pan);
      });
      this.remember(voice);
      voice.start(start);
      voice.stop(start + 1.4);
    }
    [261.63, 329.63, 392, 523.25].forEach((f, i) =>
      this.sine(f, t + i * 0.12, 1.6, 0.08, this.effects!),
    );
  }
  pauseWhenHidden() {
    if (!this.ctx || !this.enabled) return;
    if (document.hidden) {
      for (const source of this.sources)
        try {
          source.stop();
        } catch {}
      this.sources.clear();
      void this.ctx.suspend();
    } else {
      void this.ctx.resume().then(() => {
        this.nextBar = this.ctx!.currentTime + 0.1;
      });
    }
  }
}
export const gameAudio = new AdventureAudio();
document.addEventListener("visibilitychange", () =>
  gameAudio.pauseWhenHidden(),
);
