// The Chaos Sword — interactive movie engine.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { audio } from './audio.js';
import * as ui from './ui.js';
import { easeInOut, disposeScene } from './helpers.js';
import { ACTS } from './scenes/index.js';

// ------------------------------------------------------------- renderer

const canvas = document.getElementById('stage');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 4000);
camera.position.set(0, 6, 20);

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(new THREE.Scene(), camera);
const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.7, 0.5, 0.82);
composer.addPass(renderPass);
composer.addPass(bloom);
composer.addPass(new OutputPass());

function onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    // keep framing on portrait screens by widening the vertical FOV
    camera.fov = w / h < 0.9 ? 64 : 48;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    composer.setSize(w, h);
}
window.addEventListener('resize', onResize);
onResize();

// ------------------------------------------------------------- camera rig

const rig = {
    pos: new THREE.Vector3(0, 6, 20),
    look: new THREE.Vector3(0, 0, 0),
    fromPos: new THREE.Vector3(),
    toPos: new THREE.Vector3(0, 6, 20),
    fromLook: new THREE.Vector3(),
    toLook: new THREE.Vector3(),
    t: 1,
    dur: 1,
    shake: 0,
    roll: 0,
    rollFn: null,
    parallax: 1,
    pointer: new THREE.Vector2(),
    smooth: new THREE.Vector2(),
    resolve: null,
};

function setCamera(pos, look, dur = 3) {
    rig.fromPos.copy(rig.pos);
    rig.fromLook.copy(rig.look);
    rig.toPos.set(...pos);
    rig.toLook.set(...look);
    if (rig.resolve) rig.resolve();
    if (dur <= 0) {
        rig.pos.copy(rig.toPos);
        rig.look.copy(rig.toLook);
        rig.t = 1;
        return Promise.resolve();
    }
    rig.t = 0;
    rig.dur = dur;
    return new Promise((r) => (rig.resolve = r));
}

window.addEventListener('pointermove', (e) => {
    rig.pointer.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
});

const _right = new THREE.Vector3();
const _up = new THREE.Vector3();
const _fwd = new THREE.Vector3();
function updateCamera(dt, t) {
    if (rig.t < 1) {
        rig.t = Math.min(1, rig.t + dt / rig.dur);
        const e = easeInOut(rig.t);
        rig.pos.lerpVectors(rig.fromPos, rig.toPos, e);
        rig.look.lerpVectors(rig.fromLook, rig.toLook, e);
        if (rig.t >= 1 && rig.resolve) {
            rig.resolve();
            rig.resolve = null;
        }
    }
    rig.smooth.lerp(rig.pointer, Math.min(1, dt * 2));
    _fwd.subVectors(rig.look, rig.pos).normalize();
    _right.crossVectors(_fwd, camera.up).normalize();
    _up.crossVectors(_right, _fwd).normalize();
    const dist = rig.pos.distanceTo(rig.look);
    const k = rig.parallax * Math.min(1, dist / 12) * 0.5;
    camera.position
        .copy(rig.pos)
        .addScaledVector(_right, rig.smooth.x * k)
        .addScaledVector(_up, rig.smooth.y * k * 0.5)
        // gentle handheld breathing
        .addScaledVector(_up, Math.sin(t * 0.7) * 0.04);
    if (rig.shake > 0.001) {
        camera.position.x += (Math.random() - 0.5) * rig.shake;
        camera.position.y += (Math.random() - 0.5) * rig.shake;
        rig.shake *= Math.pow(0.04, dt);
    }
    camera.lookAt(rig.look);
    const roll = rig.rollFn ? rig.rollFn(t) : rig.roll;
    if (roll) camera.rotateZ(roll);
}

// ------------------------------------------------------------- environment

const pmrem = new THREE.PMREMGenerator(renderer);
function refreshEnv() {
    if (!current) return;
    if (current.envRT) {
        current.envRT.dispose();
        current.envRT = null;
    }
    const sky = current.scene.userData.sky;
    if (!sky) {
        current.scene.environment = null;
        return;
    }
    const tmp = new THREE.Scene();
    tmp.add(sky.clone());
    current.envRT = pmrem.fromScene(tmp, 0.04, 1, 3000);
    current.scene.environment = current.envRT.texture;
}

// ------------------------------------------------------------- act state

let actSeq = 0;
let current = null; // { index, scene, update, controller, updaters }
const raycaster = new THREE.Raycaster();
const clock = new THREE.Clock();
const _v = new THREE.Vector3();
const _box = new THREE.Box3();

function project(vec3) {
    _v.copy(vec3).project(camera);
    return {
        x: (_v.x * 0.5 + 0.5) * window.innerWidth,
        y: (-_v.y * 0.5 + 0.5) * window.innerHeight,
        visible: _v.z < 1 && _v.z > -1,
    };
}

function targetCenter(obj, out = new THREE.Vector3()) {
    if (obj.userData.markerOffset) return obj.localToWorld(out.copy(obj.userData.markerOffset));
    _box.setFromObject(obj);
    return _box.getCenter(out);
}

// Context handed to each scene's build() and beats.
const ctx = {
    THREE,
    camera,
    renderer,
    bloom,
    audio,
    ui,
    scene: null,
    signal: null,
    rig,
    setCamera,
    refreshEnv: () => refreshEnv(),
    project,
    shake(amount = 0.4) {
        rig.shake = Math.max(rig.shake, amount);
    },
    say(who, text, opts) {
        return ui.say(who, text, ctx.signal, opts);
    },
    sleep(s) {
        return ui.sleep(s, ctx.signal);
    },
    onUpdate(fn) {
        current?.updaters.add(fn);
        return () => current?.updaters.delete(fn);
    },
    /** Animate fn(e) for e: 0→1 over `dur` seconds. */
    tween(dur, fn, ease = easeInOut) {
        const signal = ctx.signal;
        return new Promise((resolve, reject) => {
            let t = 0;
            const up = (dt) => {
                if (signal.aborted) {
                    reject(ui.abortError());
                    return true;
                }
                t = Math.min(1, t + dt / dur);
                fn(ease(t), t);
                if (t >= 1) {
                    resolve();
                    return true;
                }
                return false;
            };
            ctx.onUpdate(up);
        });
    },
    flash: ui.flash,
};

// ------------------------------------------------------------- interactions

function waitForTarget(targets, signal) {
    return new Promise((resolve, reject) => {
        if (signal.aborted) return reject(ui.abortError());
        document.body.classList.add('can-click');
        const pointer = new THREE.Vector2();
        const onDown = (e) => {
            if (e.target !== canvas) return;
            pointer.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
            raycaster.setFromCamera(pointer, camera);
            const hits = raycaster.intersectObjects(targets, true);
            let hit = null;
            if (hits.length) {
                let o = hits[0].object;
                while (o && !targets.includes(o)) o = o.parent;
                hit = o;
            }
            // forgiving fallback: nearest target within ~80px on screen
            if (!hit) {
                let best = 80;
                for (const tg of targets) {
                    const s = project(targetCenter(tg));
                    const d = Math.hypot(s.x - e.clientX, s.y - e.clientY);
                    if (s.visible && d < best) {
                        best = d;
                        hit = tg;
                    }
                }
            }
            if (hit) finish(hit);
        };
        const onKey = (e) => {
            if (e.code === 'Space' || e.code === 'Enter') {
                e.preventDefault();
                finish(targets[0]);
            }
        };
        // marker follows the first remaining target
        const markerUp = () => {
            const s = project(targetCenter(targets[0]));
            if (s.visible) ui.setMarker(s.x, s.y);
            else ui.setMarker(null);
            return false;
        };
        const offMarker = ctx.onUpdate(markerUp);
        canvas.addEventListener('pointerdown', onDown);
        window.addEventListener('keydown', onKey);
        const cleanup = () => {
            canvas.removeEventListener('pointerdown', onDown);
            window.removeEventListener('keydown', onKey);
            offMarker();
            ui.setMarker(null);
            document.body.classList.remove('can-click');
            signal.removeEventListener('abort', abortH);
        };
        const abortH = () => {
            cleanup();
            reject(ui.abortError());
        };
        signal.addEventListener('abort', abortH, { once: true });
        let autoTimer = ui.isAuto() ? setTimeout(() => finish(targets[0]), 4500) : null;
        function finish(o) {
            clearTimeout(autoTimer);
            cleanup();
            resolve(o);
        }
    });
}

async function interactClick({ targets, hint, all = false, onHit }, signal) {
    const list = [...(typeof targets === 'function' ? targets() : targets)];
    let index = 0;
    while (list.length) {
        ui.showPrompt(hint + (all && index > 0 ? ` (${list.length} left)` : ''));
        const obj = await waitForTarget(list, signal);
        ui.hidePrompt();
        list.splice(list.indexOf(obj), 1);
        if (onHit) await onHit(obj, index, ctx);
        index++;
        if (!all) break;
    }
}

function interactHold({ hint, duration = 2.5, decay = 0.35, onProgress, onStart }, signal) {
    return new Promise((resolve, reject) => {
        if (signal.aborted) return reject(ui.abortError());
        ui.showPrompt(hint, { meter: true });
        document.body.classList.add('can-hold');
        let holding = ui.isAuto();
        let p = 0;
        let started = false;
        const down = (e) => {
            if (e.type === 'keydown') {
                if (e.code !== 'Space' && e.code !== 'Enter') return;
                e.preventDefault();
            } else if (e.target.closest('button, a, .screen')) return;
            holding = true;
            document.body.classList.add('holding');
            if (!started) {
                started = true;
                onStart?.();
            }
        };
        const up = (e) => {
            if (e.type === 'keyup' && e.code !== 'Space' && e.code !== 'Enter') return;
            holding = ui.isAuto();
            document.body.classList.remove('holding');
        };
        window.addEventListener('pointerdown', down);
        window.addEventListener('pointerup', up);
        window.addEventListener('pointercancel', up);
        window.addEventListener('keydown', down);
        window.addEventListener('keyup', up);
        const tick = (dt) => {
            p = holding ? p + dt / duration : Math.max(0, p - dt * decay);
            p = Math.min(1, p);
            ui.setMeter(p);
            onProgress?.(p, holding, dt);
            if (p >= 1) {
                cleanup();
                resolve();
                return true;
            }
            return false;
        };
        const offTick = ctx.onUpdate(tick);
        const cleanup = () => {
            window.removeEventListener('pointerdown', down);
            window.removeEventListener('pointerup', up);
            window.removeEventListener('pointercancel', up);
            window.removeEventListener('keydown', down);
            window.removeEventListener('keyup', up);
            offTick();
            ui.hidePrompt();
            document.body.classList.remove('can-hold', 'holding');
            signal.removeEventListener('abort', abortH);
        };
        const abortH = () => {
            cleanup();
            reject(ui.abortError());
        };
        signal.addEventListener('abort', abortH, { once: true });
    });
}

// ------------------------------------------------------------- beats

async function runBeats(beats, signal) {
    for (const b of beats) {
        if (signal.aborted) throw ui.abortError();
        if (b.cam) setCamera(b.cam.pos, b.cam.look, b.cam.dur ?? 3);
        if (b.do) await b.do(ctx);
        if (b.say) await ui.say(b.who || 'narrator', b.say, signal, { label: b.label });
        if (b.wait) await ui.sleep(b.wait, signal);
        if (b.choice) {
            const i = await ui.choose(b.prompt, b.choice.map((c) => c.label), signal);
            if (b.choice[i].then) await runBeats(b.choice[i].then, signal);
        }
        if (b.click) await interactClick(b.click, signal);
        if (b.hold) await interactHold(b.hold, signal);
        if (b.game) await b.game(ctx, signal);
    }
}

// ------------------------------------------------------------- acts

function teardown() {
    if (!current) return;
    current.controller.abort();
    current.envRT?.dispose();
    disposeScene(current.scene);
    current = null;
}

async function playAct(index) {
    const my = ++actSeq;
    if (current) current.controller.abort();
    ui.resetOverlays();
    await ui.fade(true, 0.9);
    if (my !== actSeq) return;
    teardown();

    const act = ACTS[index];
    const controller = new AbortController();
    const scene = new THREE.Scene();
    renderPass.scene = scene;
    ctx.scene = scene;
    ctx.signal = controller.signal;
    current = { index, scene, controller, updaters: new Set(), update: null };

    rig.shake = 0;
    rig.roll = 0;
    rig.rollFn = null;
    rig.parallax = 1;
    const b = act.bloom || {};
    bloom.strength = b.strength ?? 0.7;
    bloom.radius = b.radius ?? 0.5;
    bloom.threshold = b.threshold ?? 0.82;
    renderer.toneMappingExposure = act.exposure ?? 1.05;

    const built = act.build(ctx);
    current.update = built.update;
    refreshEnv();
    if (built.camera) setCamera(built.camera.pos, built.camera.look, 0);
    audio.ambience(act.ambience || {}, 3);
    ui.setActLabel(`${index + 1} / ${ACTS.length} · ${act.title}`);
    markMenu(index);

    await ui.fade(false, 1.4);
    if (my !== actSeq) return;
    try {
        await ui.titleCard(act.chapter, act.title, controller.signal);
        await runBeats(built.beats, controller.signal);
    } catch (e) {
        if (e.name === 'AbortError') return;
        throw e;
    }
    if (my !== actSeq) return;
    if (index + 1 < ACTS.length) playAct(index + 1);
    else showEnd();
}

async function showEnd() {
    const my = ++actSeq;
    await ui.fade(true, 1.5);
    if (my !== actSeq) return;
    ui.resetOverlays();
    document.getElementById('end').classList.remove('hidden');
}

// ------------------------------------------------------------- loop

function frame() {
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    if (current) {
        current.update?.(dt, t);
        for (const fn of [...current.updaters]) if (fn(dt, t) === true) current.updaters.delete(fn);
    }
    updateCamera(dt, t);
    composer.render(dt);
    requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// ------------------------------------------------------------- input / menus

const startScreen = document.getElementById('start');
const menu = document.getElementById('menu');
const endScreen = document.getElementById('end');
const btnBegin = document.getElementById('btn-begin');
const btnAuto = document.getElementById('btn-auto');
const btnMute = document.getElementById('btn-mute');

const menuList = document.getElementById('menu-list');
ACTS.forEach((act, i) => {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.innerHTML = `<span class="m-num">${i + 1}</span><span class="m-title"></span><span class="m-ch"></span>`;
    b.querySelector('.m-title').textContent = act.title;
    b.querySelector('.m-ch').textContent = act.chapter;
    b.addEventListener('click', () => {
        closeMenu();
        startScreen.classList.add('hidden');
        endScreen.classList.add('hidden');
        audio.init();
        audio.resume();
        playAct(i);
    });
    li.append(b);
    menuList.append(li);
});
function markMenu(i) {
    menuList.querySelectorAll('button').forEach((b, k) => b.classList.toggle('current', k === i));
}
function openMenu() {
    menu.classList.remove('hidden');
    ui.setPaused(true);
    menuList.querySelector('button.current, button')?.focus();
}
function closeMenu() {
    menu.classList.add('hidden');
    ui.setPaused(false);
}

btnBegin.disabled = false;
btnBegin.textContent = 'Begin';
btnBegin.addEventListener('click', () => {
    audio.init();
    audio.resume();
    startScreen.classList.add('hidden');
    playAct(0);
});

document.getElementById('btn-menu').addEventListener('click', (e) => {
    e.stopPropagation();
    menu.classList.contains('hidden') ? openMenu() : closeMenu();
});
document.getElementById('btn-close-menu').addEventListener('click', closeMenu);
document.getElementById('btn-replay').addEventListener('click', () => {
    endScreen.classList.add('hidden');
    playAct(0);
});

function toggleAuto() {
    const on = !ui.isAuto();
    ui.setAuto(on);
    btnAuto.setAttribute('aria-pressed', String(on));
    ui.refreshAuto();
}
function toggleMute() {
    const m = audio.toggleMute();
    btnMute.setAttribute('aria-pressed', String(m));
    btnMute.textContent = m ? 'Muted' : 'Sound';
}
btnAuto.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleAuto();
    btnAuto.blur();
});
btnMute.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMute();
    btnMute.blur();
});

// advancing dialogue
window.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    if (e.target.closest('button, a, .screen, #hud')) return;
    if (document.body.classList.contains('can-click') || document.body.classList.contains('can-hold')) return;
    ui.emitAdvance();
});
window.addEventListener('keydown', (e) => {
    const screenOpen = !startScreen.classList.contains('hidden') || !endScreen.classList.contains('hidden');
    if (e.code === 'Escape') {
        if (!startScreen.classList.contains('hidden')) return;
        menu.classList.contains('hidden') ? openMenu() : closeMenu();
        return;
    }
    if (screenOpen || !menu.classList.contains('hidden')) return;
    if (e.key === 'a' || e.key === 'A') return toggleAuto();
    if (e.key === 'm' || e.key === 'M') return toggleMute();
    if (document.body.classList.contains('can-click') || document.body.classList.contains('can-hold')) return;
    if (e.code === 'Space' || e.code === 'Enter' || e.code === 'ArrowRight') {
        if (document.activeElement && document.activeElement.tagName === 'BUTTON') return;
        e.preventDefault();
        ui.emitAdvance();
    }
});

// expose for debugging in the console
window.chaosSword = { playAct, ACTS, get current() { return current; }, bloom, renderer };
