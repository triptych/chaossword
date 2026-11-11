// DOM layer: captions, choices, prompts, title cards, markers, fades.
import { audio } from './audio.js';

const $ = (s) => document.querySelector(s);
const el = {
    caption: $('#caption'),
    speaker: $('#caption .cap-speaker'),
    text: $('#caption .cap-text'),
    prompt: $('#prompt'),
    promptText: $('#prompt .prompt-text'),
    meter: $('#prompt .meter'),
    meterFill: $('#prompt .meter-fill'),
    choices: $('#prompt .choices'),
    title: $('#titlecard'),
    tcChapter: $('#titlecard .tc-chapter'),
    tcTitle: $('#titlecard .tc-title'),
    flash: $('#flash'),
    fade: $('#fade'),
    hudAct: $('#hud-act'),
    counter: $('#counter'),
    marker: $('#marker'),
};

export const SPEAKERS = {
    narrator: { label: '', cls: 'narrator' },
    lyra: { label: 'Lyra', cls: 'lyra' },
    thought: { label: 'Lyra', cls: 'lyra thought' },
    sword: { label: 'The Sword', cls: 'kais', wrap: true, voice: 'kais' },
    kais: { label: 'Kais', cls: 'kais', wrap: true, voice: 'kais' },
    'kais-gold': { label: 'Kais', cls: 'kais-gold', wrap: true, voice: 'kais-gold' },
    merina: { label: 'Merina', cls: 'merina', voice: 'merina' },
    spirit: { label: "The Oracle's Spirit", cls: 'merina', voice: 'merina' },
    blackwood: { label: 'Captain Blackwood', cls: 'blackwood' },
    nari: { label: 'Nari', cls: 'nari' },
    thorn: { label: 'Thorn', cls: 'nari' },
    elsin: { label: 'Commander Elsin', cls: 'lyra' },
    echo: { label: 'Memory', cls: 'echo' },
};

// ---------------------------------------------------------------- state

const state = {
    auto: false,
    paused: false,
    advanceListeners: new Set(),
};

export function abortError() {
    return new DOMException('Act aborted', 'AbortError');
}

/** Called by main.js whenever the player clicks / presses advance. */
export function emitAdvance() {
    for (const fn of [...state.advanceListeners]) fn();
}

export function setAuto(v) {
    state.auto = v;
}
export function isAuto() {
    return state.auto;
}
export function setPaused(v) {
    state.paused = v;
}

function onAbort(signal, cleanup, reject) {
    const h = () => {
        cleanup();
        reject(abortError());
    };
    signal.addEventListener('abort', h, { once: true });
    return () => signal.removeEventListener('abort', h);
}

export function sleep(seconds, signal) {
    return new Promise((resolve, reject) => {
        if (signal?.aborted) return reject(abortError());
        let off = () => {};
        const id = setTimeout(() => {
            off();
            resolve();
        }, seconds * 1000);
        if (signal) off = onAbort(signal, () => clearTimeout(id), reject);
    });
}

// -------------------------------------------------------------- caption

/**
 * Typewriter a line of dialogue and wait for the player to advance.
 */
export function say(who, text, signal, { label } = {}) {
    const sp = SPEAKERS[who] || SPEAKERS.narrator;
    return new Promise((resolve, reject) => {
        if (signal?.aborted) return reject(abortError());
        el.caption.className = sp.cls;
        el.speaker.textContent = label ?? sp.label;
        const full = sp.wrap ? `«${text}»` : text;
        el.text.textContent = '';
        el.caption.classList.remove('hidden');
        if (sp.voice) audio.voice(sp.voice);

        let i = 0;
        let typing = true;
        let autoTimer = null;
        const step = 1000 / 55;
        const typer = setInterval(() => {
            i += 1;
            el.text.textContent = full.slice(0, i);
            if (i >= full.length) finishTyping();
        }, step);

        const scheduleAuto = () => {
            clearTimeout(autoTimer);
            if (!state.auto) return;
            const wait = 1400 + full.length * 42;
            autoTimer = setTimeout(function tick() {
                if (state.paused) {
                    autoTimer = setTimeout(tick, 500);
                    return;
                }
                advance();
            }, wait);
        };

        function finishTyping() {
            clearInterval(typer);
            typing = false;
            el.text.textContent = full;
            el.caption.classList.add('done');
            scheduleAuto();
        }

        function cleanup() {
            clearInterval(typer);
            clearTimeout(autoTimer);
            state.advanceListeners.delete(advance);
            state.autoWatchers?.delete(scheduleAuto);
            el.caption.classList.remove('done');
            offAbort();
        }

        function advance() {
            if (typing) return finishTyping();
            cleanup();
            el.caption.classList.add('hidden');
            resolve();
        }

        state.advanceListeners.add(advance);
        state.autoWatchers = state.autoWatchers || new Set();
        state.autoWatchers.add(scheduleAuto);
        const offAbort = signal ? onAbort(signal, () => { cleanup(); el.caption.classList.add('hidden'); }, reject) : () => {};
    });
}

/** Re-arm autoplay timers on any waiting caption (used when toggling Auto). */
export function refreshAuto() {
    state.autoWatchers?.forEach((fn) => fn());
}

export function hideCaption() {
    el.caption.classList.add('hidden');
}

// --------------------------------------------------------------- choices

export function choose(promptText, labels, signal) {
    return new Promise((resolve, reject) => {
        if (signal?.aborted) return reject(abortError());
        el.prompt.classList.remove('hidden');
        el.meter.classList.add('hidden');
        el.promptText.textContent = promptText;
        el.promptText.classList.remove('hidden');
        el.choices.innerHTML = '';
        const buttons = labels.map((label, i) => {
            const b = document.createElement('button');
            b.className = 'choice-btn';
            b.innerHTML = `<kbd>${i + 1}</kbd>`;
            b.append(document.createTextNode(label));
            b.addEventListener('click', (e) => {
                e.stopPropagation();
                pick(i);
            });
            el.choices.append(b);
            return b;
        });
        setTimeout(() => buttons[0]?.focus({ preventScroll: true }), 50);
        const onKey = (e) => {
            const n = parseInt(e.key, 10);
            if (n >= 1 && n <= labels.length) pick(n - 1);
        };
        window.addEventListener('keydown', onKey);
        let autoTimer = null;
        if (state.auto) autoTimer = setTimeout(() => pick(0), 6000);
        const cleanup = () => {
            window.removeEventListener('keydown', onKey);
            clearTimeout(autoTimer);
            el.choices.innerHTML = '';
            el.prompt.classList.add('hidden');
            offAbort();
        };
        const offAbort = signal ? onAbort(signal, cleanup, reject) : () => {};
        function pick(i) {
            audio.whoosh();
            cleanup();
            resolve(i);
        }
    });
}

// ---------------------------------------------------------------- prompt

export function showPrompt(text, { meter = false } = {}) {
    el.choices.innerHTML = '';
    el.prompt.classList.remove('hidden');
    el.promptText.classList.remove('hidden');
    el.promptText.textContent = text;
    el.meter.classList.toggle('hidden', !meter);
    setMeter(0);
}
export function hidePrompt() {
    el.prompt.classList.add('hidden');
}
export function setMeter(p) {
    el.meterFill.style.width = `${Math.round(p * 100)}%`;
}

export function setCounter(text) {
    if (text == null) el.counter.classList.add('hidden');
    else {
        el.counter.textContent = text;
        el.counter.classList.remove('hidden');
    }
}

// ---------------------------------------------------------------- marker

export function setMarker(x, y) {
    if (x == null) {
        el.marker.classList.remove('on');
        return;
    }
    el.marker.classList.add('on');
    el.marker.style.transform = `translate(${x}px, ${y}px)`;
}

// ------------------------------------------------------------ title card

export function titleCard(chapter, title, signal) {
    return new Promise((resolve, reject) => {
        el.tcChapter.textContent = chapter;
        el.tcTitle.textContent = title;
        el.title.classList.remove('hidden');
        // restart animation
        el.title.style.animation = 'none';
        void el.title.offsetWidth;
        el.title.style.animation = '';
        const started = performance.now();
        const done = () => {
            cleanup();
            el.title.classList.add('hidden');
            resolve();
        };
        const skip = () => {
            if (performance.now() - started > 600) done();
        };
        const timer = setTimeout(done, 3600);
        state.advanceListeners.add(skip);
        const cleanup = () => {
            clearTimeout(timer);
            state.advanceListeners.delete(skip);
            offAbort();
        };
        const offAbort = signal ? onAbort(signal, () => { cleanup(); el.title.classList.add('hidden'); }, reject) : () => {};
    });
}

// --------------------------------------------------------- flash / fade

export function flash(color = '#fff', duration = 0.8, strength = 1) {
    el.flash.style.transition = 'none';
    el.flash.style.background = color;
    el.flash.style.opacity = String(strength);
    void el.flash.offsetWidth;
    el.flash.style.transition = `opacity ${duration}s ease-out`;
    el.flash.style.opacity = '0';
}

export function fade(toBlack, seconds = 1.2) {
    el.fade.style.transition = `opacity ${seconds}s ease`;
    el.fade.classList.toggle('out', !toBlack);
    return new Promise((r) => setTimeout(r, seconds * 1000));
}

export function setActLabel(text) {
    el.hudAct.textContent = text;
}

export function resetOverlays() {
    hideCaption();
    hidePrompt();
    setMarker(null);
    setCounter(null);
    el.title.classList.add('hidden');
    document.body.classList.remove('can-click', 'can-hold', 'holding');
}
