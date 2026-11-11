// Act 2 — Blood and Blade (Chapter 2)
import * as THREE from 'three';
import { makeSky, makeOcean, makeStars, glowSprite, makeFigure, makeShip, makeParticles } from '../helpers.js';
import { buildStillwater, MERINA_HUT } from './stillwater.js';

function makeFire(scene, pos, scale = 1) {
    const g = new THREE.Group();
    g.position.copy(pos);
    const flames = [];
    for (let i = 0; i < 5; i++) {
        const s = glowSprite(i < 2 ? 0xffd070 : 0xff5a1a, (2.4 + Math.random() * 2) * scale, 0.9);
        s.position.set((Math.random() - 0.5) * 2 * scale, Math.random() * 1.5 * scale, (Math.random() - 0.5) * 2 * scale);
        s.userData.base = s.scale.x;
        s.userData.ph = Math.random() * 10;
        g.add(s);
        flames.push(s);
    }
    scene.add(g);
    const embers = makeParticles(scene, {
        count: 60,
        color: 0xff7a2a,
        size: 0.35,
        area: [2.5 * scale, 1, 2.5 * scale],
        origin: [pos.x, pos.y + 1, pos.z],
        velocity: [0.3, 3.5, 0],
        spread: [0.8, 1.2, 0.8],
        life: [1, 3],
        swirl: 0.6,
    });
    return {
        group: g,
        embers,
        intensity: 1,
        update(dt, t) {
            embers.update(dt);
            flames.forEach((f) => {
                const k = (0.75 + Math.sin(t * 9 + f.userData.ph) * 0.15 + Math.random() * 0.12) * this.intensity;
                f.scale.set(f.userData.base * k, f.userData.base * k * 1.3, 1);
            });
        },
    };
}

export default {
    id: 'raid',
    chapter: 'Chapter 2',
    title: 'Blood and Blade',
    ambience: { waves: 0.35, wind: 0.2, fire: 0.55, rumble: 0.25, drone: 0.6, droneHz: 49, droneCutoff: 300 },
    bloom: { strength: 0.95, radius: 0.6, threshold: 0.7 },
    exposure: 1.1,

    build(ctx) {
        const { scene } = ctx;
        makeSky(scene, { top: '#050409', mid: '#5a1a0a', bottom: '#120606', exponent: 0.35 });
        makeStars(scene, { count: 600, opacity: 0.5 });
        scene.fog = new THREE.Fog(0x2a0c06, 30, 300);

        scene.add(new THREE.HemisphereLight(0x8a3a30, 0x1a0a08, 1.4));
        const moon = new THREE.DirectionalLight(0x8090c0, 0.9);
        moon.position.set(40, 60, -80);
        scene.add(moon);

        const ocean = makeOcean(scene, { color: 0x2a1212, amp: 0.45, emissive: 0x1a0402, roughness: 0.2, metalness: 0.3 });
        const village = buildStillwater(scene, { night: true });
        village.lyra.visible = false;

        // fires on the huts
        const fires = [];
        const lights = [];
        village.huts.slice(0, 6).forEach((h, i) => {
            const p = h.position.clone();
            p.y += h.userData.h + 0.6;
            fires.push(makeFire(scene, p, 1.2));
            if (i % 2 === 0) {
                const l = new THREE.PointLight(0xff6a2a, 40, 30, 1.6);
                l.position.copy(p).add(new THREE.Vector3(0, 1, -3));
                scene.add(l);
                lights.push(l);
            }
        });
        const mp = village.merina.position.clone();
        mp.y += 2.8;
        const merinaFire = makeFire(scene, mp, 0.4);
        merinaFire.intensity = 0.3;

        // the fleet
        const ships = [
            { x: -20, z: -45, ry: 0.4, len: 22, sail: 0x5a0f14 },
            { x: 25, z: -60, ry: -0.3, len: 17, sail: 0x2b211c },
            { x: -60, z: -80, ry: 0.2, len: 17, sail: 0x2b211c },
        ].map((s) => {
            const sh = makeShip({ length: s.len, hull: 0x140d0a, sail: s.sail, flag: 0x000000, lanterns: 3, masts: s.len > 20 ? 3 : 2 });
            sh.position.set(s.x, 0, s.z);
            sh.rotation.y = s.ry;
            scene.add(sh);
            return sh;
        });

        const muzzle = glowSprite(0xffc080, 10, 0);
        scene.add(muzzle);

        // pirates with torches on the beach
        const pirates = [];
        for (let i = 0; i < 6; i++) {
            const p = makeFigure({ color: 0x1e1a1c, hair: 0x101010, height: 1.75 + Math.random() * 0.15 });
            p.position.set(-24 + i * 9 + Math.random() * 3, 0.5, 11 + Math.random() * 6);
            p.rotation.y = Math.random() * 0.8 - 0.4;
            const torch = glowSprite(0xff8a3a, 1.6, 1);
            torch.position.set(0.3, 1.9, 0.1);
            p.add(torch);
            scene.add(p);
            pirates.push(p);
        }

        // Lyra, crouched behind the nets
        const lyra = makeFigure({ color: 0x2f465e, hair: 0x2a1a10, hairLong: true });
        lyra.position.set(-6.4, 0.85, 16.3);
        lyra.scale.set(1, 0.68, 1);
        lyra.rotation.y = Math.PI;
        scene.add(lyra);

        const merina = makeFigure({ color: 0x5b5866, hair: 0xd8d8d8, height: 1.55 });
        merina.position.set(MERINA_HUT[0] + 1.8, 0.95, MERINA_HUT[1] - 2.4);
        merina.rotation.y = Math.PI;
        scene.add(merina);

        const blackwood = makeFigure({ color: 0x6a0c18, hair: 0x0a0808, height: 1.9, braids: true, sash: 0xc9a23a });
        blackwood.position.set(-2, 0.4, 2);
        blackwood.visible = false;
        scene.add(blackwood);

        const state = { cannonTimer: 2 };

        function update(dt, t) {
            ocean.update(dt);
            fires.forEach((f) => f.update(dt, t));
            merinaFire.update(dt, t);
            lights.forEach((l, i) => (l.intensity = 34 + Math.sin(t * 11 + i * 3) * 6 + Math.random() * 6));
            ships.forEach((s, i) => {
                s.position.y = ocean.heightAt(s.position.x, s.position.z) - 0.8;
                s.rotation.z = Math.sin(t * 0.7 + i) * 0.03;
            });
            pirates.forEach((p, i) => (p.children.at(-1).scale.setScalar(1.4 + Math.sin(t * 13 + i) * 0.2)));
            // cannon fire from the fleet
            state.cannonTimer -= dt;
            if (state.cannonTimer <= 0) {
                state.cannonTimer = 3 + Math.random() * 4;
                const s = ships[Math.floor(Math.random() * ships.length)];
                muzzle.position.copy(s.position).add(new THREE.Vector3(0, 3, 4));
                muzzle.material.opacity = 1;
                ctx.audio.boom(0.6);
            }
            muzzle.material.opacity = Math.max(0, muzzle.material.opacity - dt * 3);
        }

        return {
            update,
            camera: { pos: [6, 2.5, -36], look: [-10, 3, 0] },
            beats: [
                { cam: { pos: [8, 3.5, -20], look: [-4, 4, 20], dur: 6 }, say: 'They come with the dark tide. Six ships at least, lanterns burning like a second set of stars.' },
                {
                    cam: { pos: [-1, 4.5, 3], look: [-6, 3.5, 24], dur: 4 },
                    do: () => {
                        ctx.audio.boom(1);
                        ctx.shake(0.5);
                    },
                    say: 'Fire takes the thatched roofs one by one. Screams. Splintering wood. Orders barked in dialects Lyra has never heard.',
                },
                { cam: { pos: [-9, 1.8, 12.5], look: [-6.3, 1.2, 16.5], dur: 3 }, who: 'thought', say: 'Move. Do something. Anything.' },
                {
                    prompt: 'What does Lyra do?',
                    choice: [
                        {
                            label: 'Stay hidden beneath the drying nets',
                            then: [{ say: 'She hides. Every breath she takes behind the nets feels like a betrayal—and she will carry that shame for a long, long time.' }],
                        },
                        {
                            label: "Run for Merina's hut",
                            then: [
                                { do: () => ctx.audio.whoosh(), say: 'She runs—and Merina meets her halfway, gripping her shoulders with unexpected strength.' },
                                { who: 'merina', say: 'Listen carefully, child. The Stillwater records contain information Captain Blackwood must not find.' },
                                { say: 'The oracle pushes her back toward the nets. "Hide. Live."' },
                            ],
                        },
                    ],
                },
                {
                    cam: { pos: [-8, 3.5, 6], look: [-15, 2.5, 17], dur: 3 },
                    do: async () => {
                        await ctx.tween(1.5, (e) => merina.position.lerp(new THREE.Vector3(MERINA_HUT[0], 0.95, MERINA_HUT[1] - 1.6), e * 0.2));
                        merina.visible = false;
                        merinaFire.intensity = 2.2;
                        merinaFire.embers.points.scale.setScalar(1);
                        ctx.audio.boom(0.8);
                        ctx.shake(0.4);
                        ctx.flash('#ff7a2a', 1.2, 0.5);
                    },
                    say: "Merina turns back into the oracle's hut to protect the village records. The roof comes down in a storm of sparks. She does not come out again.",
                },
                {
                    cam: { pos: [-1.2, 2.3, 9.5], look: [-2, 2, 2], dur: 3.5 },
                    do: () => {
                        blackwood.visible = true;
                        blackwood.rotation.y = 0;
                    },
                    say: 'A woman walks up the burning beach as if she owns the night. Black braids threaded with gold. A scar from temple to jaw.',
                },
                { who: 'blackwood', say: 'Where did you find this one?' },
                { say: 'Rough hands drag Lyra from her hiding place and throw her down on the sand.' },
                { who: 'blackwood', say: 'Take her with the others. She may prove useful later.' },
                {
                    do: () => ctx.tween(4, (e) => (ctx.renderer.toneMappingExposure = 1.1 - e * 0.8)),
                    say: 'They bind her wrists. She tastes ash, salt tears, and the blood of her own bitten lip—and watches Stillwater burn until there is nothing left to watch.',
                },
            ],
        };
    },
};
