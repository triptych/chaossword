// Procedural audio for the interactive movie — everything is synthesized
// with the Web Audio API, so there are no sound files to load.

class MovieAudio {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.beds = {};
    }

    init() {
        if (this.ctx) return;
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        const ctx = (this.ctx = new AC());

        this.master = ctx.createGain();
        this.master.gain.value = 0.9;
        const comp = ctx.createDynamicsCompressor();
        comp.threshold.value = -16;
        comp.ratio.value = 4;
        this.master.connect(comp).connect(ctx.destination);

        this.sfxBus = ctx.createGain();
        this.sfxBus.gain.value = 0.8;
        this.sfxBus.connect(this.master);

        // simple reverb for sfx / voices
        this.reverb = ctx.createConvolver();
        this.reverb.buffer = this._impulse(2.8, 2.5);
        const wet = ctx.createGain();
        wet.gain.value = 0.35;
        this.sfxBus.connect(this.reverb).connect(wet).connect(this.master);

        this.noise = this._noiseBuffer(3);
        this.crackle = this._crackleBuffer(4);

        // ---------- ambience beds (created once, faded in/out) ----------
        this.beds.waves = this._bed(this.noise, [['lowpass', 520, 0.6]], 0.12);
        this.beds.wind = this._bed(this.noise, [['bandpass', 700, 0.8]], 0.05);
        this.beds.rain = this._bed(this.noise, [['highpass', 3200, 0.5]], 0);
        this.beds.fire = this._bed(this.crackle, [['highpass', 900, 0.4]], 0);
        this.beds.rumble = this._bed(this.noise, [['lowpass', 140, 0.8]], 0);

        // drone: two detuned saws + sub, through a low-pass
        const dg = ctx.createGain();
        dg.gain.value = 0;
        const dl = ctx.createBiquadFilter();
        dl.type = 'lowpass';
        dl.frequency.value = 420;
        dl.Q.value = 2;
        const o1 = ctx.createOscillator();
        const o2 = ctx.createOscillator();
        const o3 = ctx.createOscillator();
        o1.type = 'sawtooth';
        o2.type = 'sawtooth';
        o3.type = 'sine';
        o1.frequency.value = 55;
        o2.frequency.value = 55;
        o2.detune.value = 9;
        o3.frequency.value = 27.5;
        const o3g = ctx.createGain();
        o3g.gain.value = 1.4;
        o1.connect(dl);
        o2.connect(dl);
        o3.connect(o3g).connect(dg);
        dl.connect(dg).connect(this.master);
        // slow filter sweep
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.05;
        const lfoG = ctx.createGain();
        lfoG.gain.value = 180;
        lfo.connect(lfoG).connect(dl.frequency);
        [o1, o2, o3, lfo].forEach((o) => o.start());
        this.drone = { gain: dg, o1, o2, o3, filter: dl };

        // swell LFOs for waves and wind
        this._lfo(this.beds.waves.filter.frequency, 0.09, 260);
        this._lfo(this.beds.wind.filter.frequency, 0.13, 420);
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    }

    toggleMute() {
        this.muted = !this.muted;
        if (this.ctx) this._ramp(this.master.gain, this.muted ? 0 : 0.9, 0.3);
        return this.muted;
    }

    /**
     * Crossfade the ambient beds.
     * @param {{waves?:number,wind?:number,rain?:number,fire?:number,rumble?:number,drone?:number,droneHz?:number,droneCutoff?:number}} mix
     */
    ambience(mix = {}, fade = 2.5) {
        if (!this.ctx) return;
        for (const k of Object.keys(this.beds)) {
            this._ramp(this.beds[k].gain.gain, mix[k] || 0, fade);
        }
        this._ramp(this.drone.gain.gain, (mix.drone || 0) * 0.09, fade);
        if (mix.droneHz) {
            const t = this.ctx.currentTime;
            this.drone.o1.frequency.setTargetAtTime(mix.droneHz, t, fade / 3);
            this.drone.o2.frequency.setTargetAtTime(mix.droneHz, t, fade / 3);
            this.drone.o3.frequency.setTargetAtTime(mix.droneHz / 2, t, fade / 3);
        }
        if (mix.droneCutoff) this.drone.filter.frequency.setTargetAtTime(mix.droneCutoff, this.ctx.currentTime, fade / 3);
    }

    // ------------------------------------------------------------------ sfx

    chime() {
        if (!this.ctx) return;
        const notes = [1318.5, 1568, 1975.5, 2349.3, 1760];
        notes.forEach((f, i) => this._tone(f, { delay: i * 0.13 + Math.random() * 0.05, dur: 2.4, gain: 0.08, type: 'sine', partials: [1, 2.76] }));
    }

    bell(base = 392) {
        if (!this.ctx) return;
        [1, 2, 2.4, 3, 4.2, 5.4].forEach((p, i) => this._tone(base * p, { dur: 6 - i * 0.6, gain: 0.12 / (i + 1), type: 'sine' }));
    }

    note(freq, gain = 0.12, dur = 2.5) {
        if (!this.ctx) return;
        this._tone(freq, { dur, gain, type: 'triangle', partials: [1, 2, 3] });
    }

    voice(who) {
        if (!this.ctx) return;
        if (who === 'kais') {
            // metallic, inharmonic shimmer
            [110, 173, 261, 413].forEach((f, i) => this._tone(f, { dur: 1.2, gain: 0.05 / (i + 1), type: 'sawtooth', attack: 0.02, cutoff: 900 }));
        } else if (who === 'kais-gold') {
            [220, 330, 440, 660].forEach((f, i) => this._tone(f, { dur: 1.6, gain: 0.045 / (i + 1), type: 'sine', attack: 0.05 }));
        } else if (who === 'merina') {
            [880, 1320, 1760].forEach((f, i) => this._tone(f, { delay: i * 0.08, dur: 2, gain: 0.03, type: 'sine', attack: 0.2 }));
        }
    }

    boom(intensity = 1) {
        if (!this.ctx) return;
        this._noiseHit({ dur: 1.6 * intensity, gain: 0.7 * intensity, type: 'lowpass', freq: 180, sweepTo: 50 });
        this._tone(48, { dur: 1.2, gain: 0.4 * intensity, type: 'sine', attack: 0.005, slideTo: 30 });
    }

    thunder() {
        if (!this.ctx) return;
        this._noiseHit({ dur: 0.25, gain: 0.5, type: 'highpass', freq: 1500 });
        this._noiseHit({ delay: 0.1, dur: 4, gain: 0.8, type: 'lowpass', freq: 300, sweepTo: 60 });
    }

    impact() {
        if (!this.ctx) return;
        this._noiseHit({ dur: 0.5, gain: 0.6, type: 'bandpass', freq: 600, sweepTo: 120 });
        this._tone(70, { dur: 0.6, gain: 0.35, type: 'sine', slideTo: 40 });
    }

    whoosh() {
        if (!this.ctx) return;
        this._noiseHit({ dur: 1.0, gain: 0.35, type: 'bandpass', freq: 300, sweepTo: 2400, attack: 0.4 });
    }

    shield() {
        if (!this.ctx) return;
        this._tone(523.25, { dur: 1.4, gain: 0.08, type: 'triangle', attack: 0.01 });
        this._tone(783.99, { dur: 1.6, gain: 0.06, type: 'sine', delay: 0.04 });
        this._tone(1046.5, { dur: 1.2, gain: 0.04, type: 'sine', delay: 0.08 });
        this._noiseHit({ dur: 0.35, gain: 0.15, type: 'highpass', freq: 3000 });
    }

    bond() {
        if (!this.ctx) return;
        this.boom(1.2);
        [55, 82.4, 110, 164.8].forEach((f, i) => this._tone(f, { dur: 5, gain: 0.12, type: 'sawtooth', attack: 0.05, cutoff: 700, delay: i * 0.02 }));
    }

    heartbeat() {
        if (!this.ctx) return;
        this._tone(60, { dur: 0.25, gain: 0.5, type: 'sine', attack: 0.005, slideTo: 40 });
        this._tone(55, { dur: 0.25, gain: 0.35, type: 'sine', attack: 0.005, slideTo: 38, delay: 0.22 });
    }

    // ------------------------------------------------------------- helpers

    _ramp(param, value, time) {
        const t = this.ctx.currentTime;
        param.cancelScheduledValues(t);
        param.setValueAtTime(param.value, t);
        param.linearRampToValueAtTime(value, t + time);
    }

    _lfo(param, freq, depth) {
        const l = this.ctx.createOscillator();
        l.frequency.value = freq;
        const g = this.ctx.createGain();
        g.gain.value = depth;
        l.connect(g).connect(param);
        l.start();
    }

    _bed(buffer, filters, level) {
        const ctx = this.ctx;
        const src = ctx.createBufferSource();
        src.buffer = buffer;
        src.loop = true;
        let node = src;
        let first = null;
        for (const [type, freq, q] of filters) {
            const f = ctx.createBiquadFilter();
            f.type = type;
            f.frequency.value = freq;
            f.Q.value = q;
            node.connect(f);
            node = f;
            first = first || f;
        }
        const gain = ctx.createGain();
        gain.gain.value = level;
        node.connect(gain).connect(this.master);
        src.start(0, Math.random() * buffer.duration);
        return { src, filter: first, gain };
    }

    _tone(freq, { delay = 0, dur = 1, gain = 0.1, type = 'sine', attack = 0.01, partials = [1], cutoff = 0, slideTo = 0 } = {}) {
        const ctx = this.ctx;
        const t = ctx.currentTime + delay;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(gain, t + attack);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        let out = g;
        if (cutoff) {
            const f = ctx.createBiquadFilter();
            f.type = 'lowpass';
            f.frequency.value = cutoff;
            g.connect(f);
            out = f;
        }
        out.connect(this.sfxBus);
        partials.forEach((p, i) => {
            const o = ctx.createOscillator();
            o.type = type;
            o.frequency.setValueAtTime(freq * p, t);
            if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo * p, t + dur);
            const pg = ctx.createGain();
            pg.gain.value = 1 / (i + 1);
            o.connect(pg).connect(g);
            o.start(t);
            o.stop(t + dur + 0.05);
        });
    }

    _noiseHit({ delay = 0, dur = 1, gain = 0.3, type = 'lowpass', freq = 800, sweepTo = 0, attack = 0.005 } = {}) {
        const ctx = this.ctx;
        const t = ctx.currentTime + delay;
        const src = ctx.createBufferSource();
        src.buffer = this.noise;
        const f = ctx.createBiquadFilter();
        f.type = type;
        f.frequency.setValueAtTime(freq, t);
        if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t + dur);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(gain, t + attack);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        src.connect(f).connect(g).connect(this.sfxBus);
        src.start(t, Math.random() * 2);
        src.stop(t + dur + 0.05);
    }

    _noiseBuffer(seconds) {
        const len = this.ctx.sampleRate * seconds;
        const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
        const d = buf.getChannelData(0);
        // brown-ish noise: smoother, more oceanic than white
        let last = 0;
        for (let i = 0; i < len; i++) {
            const w = Math.random() * 2 - 1;
            last = (last + 0.04 * w) / 1.04;
            d[i] = last * 3.2 + w * 0.12;
        }
        return buf;
    }

    _crackleBuffer(seconds) {
        const sr = this.ctx.sampleRate;
        const len = sr * seconds;
        const buf = this.ctx.createBuffer(1, len, sr);
        const d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * 0.04;
        const pops = seconds * 38;
        for (let p = 0; p < pops; p++) {
            const at = Math.floor(Math.random() * (len - 2000));
            const amp = 0.3 + Math.random() * 0.7;
            const decay = 80 + Math.random() * 600;
            for (let i = 0; i < decay; i++) d[at + i] += (Math.random() * 2 - 1) * amp * Math.exp(-i / (decay / 5));
        }
        return buf;
    }

    _impulse(seconds, decay) {
        const sr = this.ctx.sampleRate;
        const len = sr * seconds;
        const buf = this.ctx.createBuffer(2, len, sr);
        for (let c = 0; c < 2; c++) {
            const d = buf.getChannelData(c);
            for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
        }
        return buf;
    }
}

export const audio = new MovieAudio();
