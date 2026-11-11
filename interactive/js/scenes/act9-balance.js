// Act 9 — Balance Restored (Chapters 22–23)
import * as THREE from 'three';
import { makeSky, makeOcean, makeStars, makeShip, makeFigure, makeSword, makeArtifact, makeParticles, glowSprite } from '../helpers.js';

const NIGHT = { top: '#04050e', mid: '#2a1030', bottom: '#05060c' };
const DAWN = { top: '#1a2a5a', mid: '#e0a080', bottom: '#202838' };

function stripeTexture() {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 64;
    const g = c.getContext('2d');
    g.fillStyle = '#000';
    g.fillRect(0, 0, 256, 64);
    for (let i = 0; i < 12; i++) {
        g.fillStyle = `rgba(255,255,255,${0.2 + Math.random() * 0.5})`;
        g.fillRect(i * 22 + Math.random() * 8, 0, 6 + Math.random() * 10, 64);
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
}

export default {
    id: 'balance',
    chapter: 'Chapters 22 – 23',
    title: 'Balance Restored',
    ambience: { waves: 0.35, wind: 0.4, rumble: 0.4, drone: 0.8, droneHz: 43.65, droneCutoff: 520 },
    bloom: { strength: 1.1, radius: 0.7, threshold: 0.55 },

    build(ctx) {
        const { scene } = ctx;
        const sky = makeSky(scene, { ...NIGHT, exponent: 0.45 });
        const stars = makeStars(scene, { count: 1800, opacity: 0.9 });
        scene.fog = new THREE.Fog(0x120a18, 50, 380);
        const hemi = new THREE.HemisphereLight(0x8a7ab8, 0x141020, 1.3);
        scene.add(hemi);
        const key = new THREE.DirectionalLight(0xa0b0ff, 1.3);
        key.position.set(-30, 40, 20);
        scene.add(key);

        const ocean = makeOcean(scene, { color: 0x10142a, amp: 0.4, roughness: 0.15, metalness: 0.4 });

        const ship = makeShip({ length: 40, hull: 0x1a0f0a, sail: 0x5a0f14, masts: 3, flag: 0x000000, lanterns: 4 });
        ship.position.y = -0.4;
        scene.add(ship);
        const deckY = ship.userData.deckY - 0.4;

        // allied ships around
        [[-40, -50, 0.5], [45, -40, -0.6], [-60, 30, 2.2]].forEach(([x, z, ry]) => {
            const s = makeShip({ length: 18, hull: 0x2a2018, sail: 0xd8d0c0, masts: 2, flag: 0x1d4f9a, lanterns: 2 });
            s.position.set(x, -0.5, z);
            s.rotation.y = ry;
            scene.add(s);
        });

        const center = new THREE.Vector3(-2, deckY, 0);

        const blackwood = makeFigure({ color: 0x6a0c18, hair: 0x0a0808, height: 1.9, braids: true, sash: 0xc9a23a, emissive: 0x400010, emissiveIntensity: 0.6 });
        blackwood.position.copy(center);
        scene.add(blackwood);

        const lyra = makeFigure({ color: 0x2a4a7a, hair: 0x2a1a10, hairLong: true, sash: 0xd4af37 });
        lyra.position.set(4.5, deckY, 0.4);
        lyra.rotation.y = -Math.PI / 2;
        scene.add(lyra);
        const nari = makeFigure({ color: 0x2f4a40, hair: 0x15100c, streak: true, hairLong: true });
        nari.position.set(6.5, deckY, 3);
        nari.rotation.y = -2.2;
        scene.add(nari);
        const thorn = makeFigure({ color: 0x5a4028, hair: 0x1a1008, height: 1.9 });
        thorn.position.set(6.2, deckY, -2.8);
        thorn.rotation.y = -1.0;
        scene.add(thorn);

        // the vortex Blackwood is trying to drink from
        const vortexTex = stripeTexture();
        const vortex = new THREE.Mesh(
            new THREE.CylinderGeometry(4, 0.6, 18, 24, 1, true),
            new THREE.MeshBasicMaterial({ color: 0xff2040, map: vortexTex, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending })
        );
        vortex.position.set(center.x, deckY + 9, 0);
        scene.add(vortex);
        const vortexCore = glowSprite(0xff1030, 6, 0.8);
        vortexCore.position.set(center.x, deckY + 1.5, 0);
        scene.add(vortexCore);
        const vLight = new THREE.PointLight(0xff2040, 30, 25, 1.5);
        vLight.position.set(center.x, deckY + 3, 0);
        scene.add(vLight);

        // the four artifacts
        const kinds = ['chalice', 'feather', 'root', 'sword'];
        const NOTES = { chalice: 261.6, feather: 329.6, root: 392, sword: 523.3 };
        const artifacts = kinds.map((k, i) => {
            const a = makeArtifact(k);
            a.userData.kind = k;
            a.userData.angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
            a.userData.radius = 3.6;
            a.userData.height = 2.6;
            a.userData.pure = k === 'sword';
            a.scale.setScalar(k === 'sword' ? 1 : 1.3);
            const hit = new THREE.Mesh(new THREE.SphereGeometry(0.9), new THREE.MeshBasicMaterial({ visible: false }));
            a.add(hit);
            const pl = new THREE.PointLight(a.userData.color, 0, 10, 1.5);
            a.add(pl);
            a.userData.light = pl;
            scene.add(a);
            return a;
        });
        const corrupt = new THREE.Color(0x8a0010);

        const motes = makeParticles(scene, { count: 400, color: 0xffd46b, size: 0.25, area: [10, 1, 10], origin: [center.x, deckY + 1, 0], velocity: [0, 2.5, 0], spread: [1.5, 1, 1.5], life: [1.5, 4], swirl: 1.2 });
        motes.state.emit = false;
        const dark = makeParticles(scene, { count: 300, color: 0xff2040, size: 0.3, area: [8, 1, 8], origin: [center.x, deckY + 0.5, 0], velocity: [0, 4, 0], spread: [0.5, 1, 0.5], life: [1, 3], swirl: 2 });

        const state = { vortex: 1, orbit: 0, spiral: 0, restored: false };
        const sw = artifacts[3].userData.sword;

        function placeArtifacts(t) {
            artifacts.forEach((a, i) => {
                const ang = a.userData.angle + state.orbit;
                const rad = a.userData.radius * (1 - state.spiral * 0.95);
                a.position.set(center.x + Math.cos(ang) * rad, deckY + a.userData.height + Math.sin(t * 1.4 + i) * 0.15 + state.spiral * 3, Math.sin(ang) * rad);
                a.rotation.y += 0.01 + state.spiral * 0.2;
                const halo = a.userData.halo;
                if (a.userData.pure || state.restored) {
                    halo.material.color.setHex(a.userData.color);
                    halo.material.opacity = 0.8 + Math.sin(t * 2 + i) * 0.15;
                    halo.scale.setScalar(2.8 + state.spiral * 4);
                    a.userData.light.intensity = 16;
                    if (a.userData.mat) a.userData.mat.emissiveIntensity = 0.8;
                } else {
                    halo.material.color.copy(corrupt);
                    halo.material.opacity = 0.4 + Math.random() * 0.3;
                    halo.scale.setScalar(2.2);
                    a.userData.light.intensity = 3;
                    if (a.userData.mat) a.userData.mat.emissiveIntensity = 0.1;
                }
            });
        }

        function update(dt, t) {
            ocean.update(dt);
            motes.update(dt);
            dark.update(dt);
            vortexTex.offset.x += dt * 0.6 * state.vortex;
            vortexTex.offset.y -= dt * 0.3;
            vortex.material.opacity = 0.55 * state.vortex;
            vortex.scale.set(0.6 + state.vortex * 0.4 + Math.sin(t * 3) * 0.03, 1, 0.6 + state.vortex * 0.4);
            vortexCore.material.opacity = 0.8 * state.vortex;
            vLight.intensity = 30 * state.vortex;
            dark.state.intensity = state.vortex;
            placeArtifacts(t);
            sw.setGlow(0xffc35a, 1.4 + state.spiral * 2);
        }

        return {
            update,
            camera: { pos: [26, 14, 24], look: [-2, 5, 0] },
            beats: [
                { cam: { pos: [18, 10, 18], look: [-2, deckY + 2, 0], dur: 6 }, say: 'The final battle. The Alliance fleet closes in. Aboard the Tempest, Nari breaks loose and sabotages the flagship from within.' },
                { cam: { pos: [9, deckY + 3, 6], look: [-2, deckY + 3, 0], dur: 3 }, say: 'Blackwood, desperate, tries to drink the power of every artifact at once.' },
                { who: 'blackwood', say: 'If I hold them all, no one will ever hold me again!' },
                { who: 'kais-gold', say: 'My siblings. I can hear them, Lyra. They are in pain—as I was.' },
                { who: 'lyra', say: "Then we don't fight them. We remind them." },
                {
                    cam: { pos: [7.5, deckY + 3.2, 0.5], look: [-2, deckY + 2.6, 0], dur: 2.5 },
                    click: {
                        targets: artifacts.slice(0, 3),
                        all: true,
                        hint: 'Reach out to each corrupted artifact',
                        onHit: async (a) => {
                            a.userData.pure = true;
                            ctx.audio.note(NOTES[a.userData.kind], 0.16, 4);
                            ctx.audio.shield();
                            ctx.flash('#' + new THREE.Color(a.userData.color).getHexString(), 0.9, 0.35);
                            state.vortex = Math.max(0.35, state.vortex - 0.22);
                            const names = {
                                chalice: 'The Chalice of Tides — order, memory, healing.',
                                feather: 'The Feather of Whispers — knowledge, connection.',
                                root: 'The Root of Stone — foundation, endurance.',
                            };
                            await ctx.say('kais-gold', names[a.userData.kind]);
                        },
                    },
                },
                {
                    cam: { pos: [12, deckY + 4, 9], look: [-2, deckY + 4, 0], dur: 3 },
                    do: async () => {
                        motes.state.emit = true;
                        ctx.audio.note(NOTES.sword, 0.16, 5);
                        await ctx.tween(4, (e) => {
                            state.orbit = e * Math.PI * 4;
                            state.spiral = e;
                            state.vortex = 0.35 * (1 - e);
                        });
                        ctx.audio.bell(261.6);
                        ctx.flash('#ffffff', 2.2, 1);
                        ctx.shake(0.8);
                        state.restored = true;
                        sky.blend(NIGHT, DAWN, 0.35);
                        hemi.intensity = 1.0;
                        await ctx.tween(2.5, (e) => (state.spiral = 1 - e));
                        motes.state.emit = false;
                    },
                    say: 'Four voices. One clear tone, like a bell. Nine hundred years of corruption fall away like rust.',
                },
                {
                    cam: { pos: [3, deckY + 2, 2.5], look: [-2, deckY + 1, 0], dur: 3 },
                    do: () => {
                        blackwood.scale.set(1, 0.72, 1);
                        blackwood.traverse((o) => o.material && (o.material.emissiveIntensity = 0));
                        return ctx.tween(3, (e) => {
                            sky.blend(NIGHT, DAWN, 0.35 + e * 0.35);
                            stars.material.opacity = 0.9 * (1 - e * 0.7);
                        });
                    },
                    say: 'Blackwood falls to her knees, human again—her face cycling through rage, disbelief, and finally, unexpectedly, relief.',
                },
                { who: 'kais-gold', say: 'We should finish this.' },
                { say: 'But there is no bloodthirst in it now. Only a question—one Kais is finally letting Lyra answer.' },
                { who: 'lyra', say: 'No. The cycle ends here. She lives.' },
            ],
        };
    },
};
