// Act 8 — Harbor Defense (Chapters 14–21)
import * as THREE from 'three';
import { rng, makeSky, makeOcean, makeShip, makeFigure, makeSword, makeHut, makeParticles, glowSprite, plankTexture } from '../helpers.js';

const TOTAL = 14;
const KINDS = [
    { color: 0xff7a2a, core: 0xffe0a0 }, // cannon fire
    { color: 0x3a8aff, core: 0xd0e8ff }, // the Chalice's water
    { color: 0xf0f0ff, core: 0xffffff }, // the Feather's wind-blades
];

export default {
    id: 'harbor',
    chapter: 'Chapters 14 – 21',
    title: 'Harbor Defense',
    ambience: { waves: 0.5, wind: 0.35, fire: 0.1, rumble: 0.3, drone: 0.45, droneHz: 55, droneCutoff: 600 },
    bloom: { strength: 0.8, radius: 0.55, threshold: 0.7 },

    build(ctx) {
        const { scene } = ctx;
        const r = rng(8);
        makeSky(scene, { top: '#2a3550', mid: '#d08a5a', bottom: '#2a3040', exponent: 0.5 });
        scene.fog = new THREE.Fog(0xb07a5a, 60, 420);
        scene.add(new THREE.HemisphereLight(0xffd8b0, 0x2a3040, 1.0));
        const sun = new THREE.DirectionalLight(0xffb070, 1.7);
        sun.position.set(80, 40, -120);
        scene.add(sun);

        const ocean = makeOcean(scene, { color: 0x24506a, amp: 0.5, roughness: 0.7, metalness: 0.05 });

        // quay and town
        const stone = new THREE.MeshStandardMaterial({ color: 0x8a8278, roughness: 1, flatShading: true });
        const quay = new THREE.Mesh(new THREE.BoxGeometry(90, 4, 30), stone);
        quay.position.set(0, 0, 18);
        scene.add(quay);
        const pier = new THREE.Mesh(new THREE.BoxGeometry(6, 3.6, 18), stone);
        pier.position.set(0, 0.2, -4);
        scene.add(pier);
        const deck = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.2, 17.6), new THREE.MeshStandardMaterial({ map: plankTexture('#6a5038', 3) }));
        deck.position.set(0, 2.05, -4);
        scene.add(deck);
        const mole = new THREE.Mesh(new THREE.BoxGeometry(8, 4, 40), stone);
        mole.position.set(-34, 0, -12);
        scene.add(mole);
        // lighthouse
        const lh = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 2.4, 16, 10), new THREE.MeshStandardMaterial({ color: 0xd8d0c0, roughness: 0.9, flatShading: true }));
        lh.position.set(-34, 10, -28);
        scene.add(lh);
        const lamp = glowSprite(0xfff0b0, 8, 0.9);
        lamp.position.set(-34, 19, -28);
        scene.add(lamp);
        // buildings
        const houses = [];
        for (let i = 0; i < 14; i++) {
            const h = makeHut(r, { wall: 0xb8a088, roof: 0x8a3a2a, glow: 0.8 });
            h.position.set(-40 + i * 6 + r() * 2, 2, 12 + r() * 14);
            h.rotation.y = Math.PI + (r() - 0.5) * 0.3;
            h.scale.set(1, 1.3 + r() * 0.6, 1);
            scene.add(h);
            houses.push(h);
        }
        // Alliance banners
        const bannerMat = new THREE.MeshStandardMaterial({ color: 0x1d4f9a, side: THREE.DoubleSide, emissive: 0x0a2050, emissiveIntensity: 0.6 });
        const banners = [];
        for (let i = 0; i < 6; i++) {
            const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 7, 5), new THREE.MeshStandardMaterial({ color: 0x3a3028 }));
            pole.position.set(-25 + i * 10, 5.5, 4);
            scene.add(pole);
            const b = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.6, 4, 1), bannerMat);
            b.position.set(-24.2 + i * 10, 7.4, 4);
            scene.add(b);
            banners.push(b);
        }

        // Thorn's harbor walls (rise later)
        const wallMat = new THREE.MeshStandardMaterial({ color: 0x6a6258, roughness: 1, flatShading: true, emissive: 0x3a8a2a, emissiveIntensity: 0.25 });
        const walls = [];
        for (let i = 0; i < 9; i++) {
            const w = new THREE.Mesh(new THREE.BoxGeometry(6, 6, 2.5), wallMat);
            w.position.set(-28 + i * 7, -8, -26 - Math.abs(i - 4) * 1.5);
            w.rotation.y = (i - 4) * 0.06;
            scene.add(w);
            walls.push(w);
        }

        // the enemy fleet
        const ships = [-60, -30, 0, 30, 60].map((x, i) => {
            const s = makeShip({ length: i === 2 ? 24 : 17, hull: 0x1a120c, sail: i === 2 ? 0x6a0f14 : 0x3a2c24, masts: i === 2 ? 3 : 2, flag: 0x000000, lanterns: 2 });
            s.position.set(x, -0.6, -105 - (i % 2) * 18);
            s.rotation.y = Math.PI / 2 + (x / 60) * 0.25;
            scene.add(s);
            return s;
        });

        // Lyra on the pier
        const lyra = makeFigure({ color: 0x2a4a7a, hair: 0x2a1a10, hairLong: true, sash: 0xd4af37 });
        lyra.position.set(0, 2.15, -11);
        lyra.rotation.y = Math.PI;
        scene.add(lyra);
        const sword = makeSword({ glow: 0xffc35a, glowIntensity: 1.6 });
        sword.group.position.set(0.28, 1.45, 0.1);
        sword.group.rotation.set(0.15, 0, -0.15);
        lyra.add(sword.group);
        lyra.userData.parts.armR.rotation.z = -2.6;

        const smoke = makeParticles(scene, { count: 160, color: 0x2a2420, size: 2.5, area: [60, 2, 10], origin: [0, 4, 14], velocity: [0.8, 1.6, 0], spread: [0.4, 0.4, 0.4], life: [4, 8], additive: false });
        smoke.points.material.opacity = 0.35;
        smoke.state.intensity = 0;
        const sparks = makeParticles(scene, { count: 300, color: 0xffd46b, size: 0.5, area: [1, 1, 1], origin: [0, -50, 0], velocity: [0, 0, 0], spread: [7, 7, 7], life: [0.3, 0.9], gravity: 4 });
        sparks.state.emit = false;

        const state = { pulse: 0 };

        function update(dt, t) {
            ocean.update(dt);
            smoke.update(dt);
            sparks.update(dt);
            ships.forEach((s, i) => {
                s.position.y = ocean.heightAt(s.position.x, s.position.z) - 0.8;
                s.rotation.x = Math.sin(t * 0.6 + i) * 0.03;
            });
            banners.forEach((b, i) => (b.rotation.y = Math.sin(t * 2 + i) * 0.25));
            lamp.material.opacity = 0.6 + Math.sin(t * 1.5) * 0.3;
            sword.setGlow(0xffc35a, 1.6 + state.pulse);
            state.pulse = Math.max(0, state.pulse - dt * 2);
        }

        // ------------------------------------------------------------ mini-game
        function defend(ctx2, signal) {
            return new Promise((resolve, reject) => {
                const live = [];
                let launched = 0;
                let blocked = 0;
                let hits = 0;
                let nextLaunch = 0.8;
                const domeGeo = new THREE.SphereGeometry(1, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2);
                const tmp = new THREE.Vector3();
                const up = new THREE.Vector3(0, 1, 0);
                ctx.ui.setCounter(`Shields 0 · Hits 0 · ${TOTAL} incoming`);
                ctx.ui.showPrompt('Click the incoming fire to raise shields');
                document.body.classList.add('can-click');

                const effects = [];

                function launch() {
                    const s = ships[Math.floor(Math.random() * ships.length)];
                    const kind = KINDS[launched % 3 === 2 ? Math.floor(Math.random() * 3) : launched % 3];
                    const start = s.position.clone().add(new THREE.Vector3(0, 6, 0));
                    const end = new THREE.Vector3(-26 + Math.random() * 52, 3 + Math.random() * 3, 4 + Math.random() * 16);
                    const sp = glowSprite(kind.color, 4.5, 1);
                    const core = glowSprite(kind.core, 1.6, 1);
                    sp.add(core);
                    core.scale.setScalar(0.4);
                    scene.add(sp);
                    live.push({ sp, start, end, t: 0, dur: 3.4 + Math.random() * 1.2 - Math.min(1, launched * 0.06), h: 22 + Math.random() * 10, autoAt: 1.2 + Math.random() * 0.8, age: 0 });
                    launched++;
                    ctx.audio.boom(0.35);
                }

                function shieldAt(p, color = 0xffd46b) {
                    const dome = new THREE.Mesh(domeGeo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, wireframe: false }));
                    dome.position.copy(p);
                    dome.rotation.x = -Math.PI / 2;
                    dome.lookAt(ctx.camera.position);
                    dome.rotateX(Math.PI / 2);
                    scene.add(dome);
                    effects.push({ obj: dome, t: 0, dur: 0.9, kind: 'dome' });
                    sparks.state.origin.copy(p);
                    sparks.state.emit = true;
                    setTimeout(() => (sparks.state.emit = false), 120);
                }

                function explodeAt(p) {
                    const fx = glowSprite(0xff6a20, 4, 1);
                    fx.position.copy(p);
                    scene.add(fx);
                    effects.push({ obj: fx, t: 0, dur: 1.2, kind: 'boom' });
                    smoke.state.intensity = Math.min(1, smoke.state.intensity + 0.25);
                    ctx.audio.boom(0.9);
                    ctx.shake(0.6);
                }

                function block(p) {
                    const i = live.indexOf(p);
                    if (i < 0) return;
                    live.splice(i, 1);
                    shieldAt(p.sp.position);
                    scene.remove(p.sp);
                    blocked++;
                    state.pulse = 1.5;
                    ctx.audio.shield();
                    hud();
                }

                function hud() {
                    ctx.ui.setCounter(`Shields ${blocked} · Hits ${hits} · ${TOTAL - launched + live.length} incoming`);
                }

                const onDown = (e) => {
                    if (e.target !== ctx.renderer.domElement) return;
                    let best = null;
                    let bestD = 110;
                    for (const p of live) {
                        const s = ctx.project(p.sp.position);
                        const d = Math.hypot(s.x - e.clientX, s.y - e.clientY);
                        if (s.visible && d < bestD) {
                            bestD = d;
                            best = p;
                        }
                    }
                    if (best) block(best);
                };
                const onKey = (e) => {
                    if ((e.code === 'Space' || e.code === 'Enter') && live.length) {
                        e.preventDefault();
                        // shield the most urgent one
                        block(live.reduce((a, b) => (a.t / a.dur > b.t / b.dur ? a : b)));
                    }
                };
                ctx.renderer.domElement.addEventListener('pointerdown', onDown);
                window.addEventListener('keydown', onKey);

                const tick = (dt) => {
                    nextLaunch -= dt;
                    if (launched < TOTAL && nextLaunch <= 0 && live.length < 4) {
                        launch();
                        nextLaunch = Math.max(0.75, 1.7 - launched * 0.07);
                        hud();
                    }
                    for (const p of [...live]) {
                        p.t += dt;
                        p.age += dt;
                        const s = Math.min(1, p.t / p.dur);
                        tmp.lerpVectors(p.start, p.end, s).addScaledVector(up, 4 * p.h * s * (1 - s));
                        p.sp.position.copy(tmp);
                        if (ctx.ui.isAuto() && p.age > p.autoAt) {
                            block(p);
                            continue;
                        }
                        if (s >= 1) {
                            live.splice(live.indexOf(p), 1);
                            scene.remove(p.sp);
                            explodeAt(p.end);
                            hits++;
                            hud();
                        }
                    }
                    for (const fx of [...effects]) {
                        fx.t += dt;
                        const k = fx.t / fx.dur;
                        if (fx.kind === 'dome') {
                            fx.obj.scale.setScalar(1 + k * 5);
                            fx.obj.material.opacity = 0.85 * (1 - k);
                        } else {
                            fx.obj.scale.setScalar(4 + k * 14);
                            fx.obj.material.opacity = 1 - k;
                        }
                        if (k >= 1) {
                            scene.remove(fx.obj);
                            fx.obj.material.dispose();
                            effects.splice(effects.indexOf(fx), 1);
                        }
                    }
                    if (launched >= TOTAL && live.length === 0 && effects.length === 0) {
                        cleanup();
                        state.result = { blocked, hits };
                        resolve();
                        return true;
                    }
                    return false;
                };
                const off = ctx.onUpdate(tick);
                const cleanup = () => {
                    off();
                    ctx.renderer.domElement.removeEventListener('pointerdown', onDown);
                    window.removeEventListener('keydown', onKey);
                    ctx.ui.hidePrompt();
                    ctx.ui.setCounter(null);
                    document.body.classList.remove('can-click');
                    signal.removeEventListener('abort', abortH);
                };
                const abortH = () => {
                    cleanup();
                    reject(ctx.ui.abortError());
                };
                signal.addEventListener('abort', abortH, { once: true });
            });
        }

        return {
            update,
            camera: { pos: [30, 26, 40], look: [0, 2, -40] },
            beats: [
                { cam: { pos: [14, 12, 26], look: [0, 3, -30], dur: 6 }, say: 'Port Haven. Months ago Lyra could not have imagined it: Master Wei\'s teas and scrolls, an Alliance that trusts her, a sword that glows blue-gold instead of red.' },
                { cam: { pos: [3.5, 5.2, -2], look: [0, 6, -90], dur: 4 }, say: 'Now Captain Blackwood comes for the harbor with everything she has—cannon, the Chalice\'s drowning water, the Feather\'s cutting wind.' },
                { who: 'kais-gold', say: 'Shields, Lyra. We protect. Everything else follows.' },
                { game: defend },
                {
                    do: async () => {
                        ctx.audio.boom(0.6);
                        ctx.shake(0.3);
                        await ctx.tween(2.5, (e) => walls.forEach((w, i) => (w.position.y = -8 + Math.min(1, e * 1.3 - i * 0.03) * 8.5)));
                    },
                    cam: { pos: [6, 6, -6], look: [0, 1, -30], dur: 3 },
                    say: 'Then the harbor itself stands up to help. Thorn and the Root of Stone raise the old sea walls from the water, glowing green as new moss.',
                },
                {
                    do: async () => {
                        const res = state.result || { blocked: TOTAL, hits: 0 };
                        const lines = [
                            'Not a single roof in Port Haven burns tonight. Not one.',
                            'A few fires take hold along the quay—but the harbor holds, and every family in it lives.',
                            'Fire gets through in places, and the quay will need rebuilding. But the harbor holds. The people hold.',
                        ];
                        await ctx.say('narrator', lines[res.hits === 0 ? 0 : res.hits <= 3 ? 1 : 2]);
                    },
                },
                { cam: { pos: [3, 4.5, -4], look: [20, 3, -110], dur: 4 }, say: 'Blackwood\'s fleet turns and runs. But in the smoke and chaos, her crew drags someone aboard the Tempest.' },
                { who: 'lyra', say: 'Nari—! NARI!' },
                { who: 'kais-gold', say: 'We will bring her back. Together. I swear it on every name I have ever had.' },
            ],
        };
    },
};
