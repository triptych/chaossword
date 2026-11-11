// Act 4 — Unexpected Allies (Chapters 4–6)
import * as THREE from 'three';
import { makeSky, makeOcean, makeShip, makeFigure, makeSword, makeRuneCircle, makeParticles, glowSprite } from '../helpers.js';

export default {
    id: 'allies',
    chapter: 'Chapters 4 – 6',
    title: 'Unexpected Allies',
    ambience: { waves: 0.6, wind: 0.35, drone: 0.2, droneHz: 73.4, droneCutoff: 500 },
    bloom: { strength: 0.6, radius: 0.5, threshold: 0.85 },

    build(ctx) {
        const { scene, rig } = ctx;
        makeSky(scene, { top: '#2f6fb8', mid: '#cfe3ee', bottom: '#2a5a78', exponent: 0.45 });
        scene.fog = new THREE.Fog(0xbcd6e6, 80, 600);
        scene.add(new THREE.HemisphereLight(0xdfefff, 0x3a5a6a, 1.3));
        const sun = new THREE.DirectionalLight(0xfff2da, 2.4);
        sun.position.set(60, 90, 40);
        scene.add(sun);

        const ocean = makeOcean(scene, { color: 0x1f6488, amp: 0.8, roughness: 0.2, metalness: 0.15 });

        const ship = makeShip({ length: 40, hull: 0x2a1a10, sail: 0xe9e0c8, masts: 3, flag: 0x101010, lanterns: 0 });
        scene.add(ship);
        const deckY = ship.userData.deckY;
        // rails
        const railMat = new THREE.MeshStandardMaterial({ color: 0x3a2618, roughness: 0.9 });
        for (const z of [-4.5, 4.5]) {
            const rail = new THREE.Mesh(new THREE.BoxGeometry(26, 0.12, 0.15), railMat);
            rail.position.set(-1, deckY + 0.9, z);
            ship.add(rail);
            for (let x = -13; x <= 12; x += 2) {
                const post = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.9, 0.1), railMat);
                post.position.set(x, deckY + 0.45, z);
                ship.add(post);
            }
        }

        const lyra = makeFigure({ color: 0x3a5068, hair: 0x2a1a10, hairLong: true, sash: 0x8a2a20 });
        lyra.position.set(2, deckY, 0.5);
        lyra.rotation.y = Math.PI / 2;
        ship.add(lyra);
        const sword = makeSword({ glow: 0xff3a1a, glowIntensity: 0.6 });
        sword.group.position.set(0.3, 0.95, 0.35);
        sword.group.rotation.set(0.9, 0, 0);
        lyra.add(sword.group);

        const blackwood = makeFigure({ color: 0x6a0c18, hair: 0x0a0808, height: 1.9, braids: true, sash: 0xc9a23a });
        blackwood.position.set(-13, deckY + 4.4, 1);
        blackwood.rotation.y = Math.PI / 2;
        ship.add(blackwood);

        const nari = makeFigure({ color: 0x2f4a40, hair: 0x15100c, streak: true, hairLong: true });
        nari.position.set(5, deckY, 2.6);
        nari.rotation.y = -2.2;
        ship.add(nari);

        const sparring = makeFigure({ color: 0x3a3030, hair: 0x101010, height: 1.85 });
        sparring.position.set(4.5, deckY, -0.3);
        sparring.rotation.y = -Math.PI / 2;
        ship.add(sparring);

        const boy = makeFigure({ color: 0x7a5a3a, hair: 0x3a2010, height: 1.15 });
        boy.position.set(7, deckY, 3.6);
        boy.rotation.y = 0;
        ship.add(boy);

        for (let i = 0; i < 4; i++) {
            const c = makeFigure({ color: 0x4a4038, hair: 0x2a2018, height: 1.6 + i * 0.05 });
            c.position.set(-4 - i * 1.6, deckY, -2.5 + (i % 2) * 1.2);
            c.rotation.y = Math.PI / 2 + (i - 1.5) * 0.3;
            ship.add(c);
        }

        // the boundary — a plane of blue-gold light
        const boundary = makeRuneCircle(1.6, 0xffd46b, 0, 9);
        boundary.position.set(7, 1.2, 8);
        ship.add(boundary);
        const boundaryGlow = glowSprite(0x8ac8ff, 5, 0);
        boundaryGlow.position.copy(boundary.position);
        ship.add(boundaryGlow);
        const spray = makeParticles(scene, { count: 120, color: 0xbfe6ff, size: 0.3, area: [2, 0.2, 2], origin: [7, 1, 8], velocity: [0, 2.5, 0], spread: [1.2, 1, 1.2], life: [0.4, 1.2], gravity: 4 });
        spray.state.emit = false;

        const state = { duel: true, boyFall: 0 };
        rig.rollFn = (t) => Math.sin(t * 0.5) * 0.02;

        function update(dt, t) {
            ocean.update(dt);
            spray.update(dt);
            ship.position.y = Math.sin(t * 0.6) * 0.25 - 0.4;
            ship.rotation.x = Math.sin(t * 0.5) * 0.025;
            ship.rotation.z = Math.sin(t * 0.37) * 0.012;
            ship.userData.sails.forEach((s, i) => (s.scale.z = 1 + Math.sin(t * 1.4 + i) * 0.08));
            if (ship.userData.flag) ship.userData.flag.rotation.y = Math.sin(t * 3) * 0.3;
            if (state.duel) {
                const k = Math.sin(t * 3.2);
                sword.group.rotation.x = 0.9 + k * 0.6;
                lyra.userData.parts.armR.rotation.x = -0.6 - k * 0.4;
                sparring.userData.parts.armR.rotation.x = -0.6 + k * 0.5;
            }
            boundary.rotation.z += dt * 0.6;
        }

        const toWorld = (v) => ship.localToWorld(v.clone());

        return {
            update,
            camera: { pos: [34, 14, 34], look: [0, 6, 0] },
            beats: [
                { cam: { pos: [26, 10, 24], look: [0, 6, 0], dur: 6 }, say: 'Days aboard the Tempest. The sea is endless and blue—and the sword never stops talking.' },
                { cam: { pos: [9, deckY + 2.2, -5], look: [3, deckY + 1.1, 0.5], dur: 4 }, who: 'sword', say: 'Your pulse quickens. Anger serves us well in combat.' },
                { say: 'Instead of punishing her, Captain Blackwood trains her. Blades at dawn, bruises by noon. Lyra grows stronger—and, to her shame, a little proud.' },
                { cam: { pos: [-6, deckY + 4, 5], look: [-13, deckY + 5.6, 1], dur: 3.5 }, who: 'blackwood', say: 'You learn quickly, girl. Or something inside you does.' },
                { cam: { pos: [9.5, deckY + 2, 6.5], look: [5, deckY + 1.5, 2.6], dur: 3.5 }, say: 'Another captive watches Lyra argue with no one. Nari—seventeen, sharp-eyed, a white streak through her dark hair.' },
                { who: 'nari', say: "You're either mad, or you're carrying something Blackwood wants very badly. I haven't decided which is worse." },
                {
                    cam: { pos: [13, deckY + 1.5, 13], look: [7, deckY - 1, 5], dur: 2.5 },
                    do: async () => {
                        state.duel = false;
                        ctx.audio.impact();
                        ctx.audio.whoosh();
                        ctx.shake(0.7);
                        const a = boy.position.clone();
                        const b = new THREE.Vector3(7, 2.4, 7.4);
                        await ctx.tween(1.0, (e, raw) => {
                            boy.position.lerpVectors(a, b, raw);
                            boy.position.y += Math.sin(raw * Math.PI) * 1.2;
                            boy.rotation.x = raw * 1.4;
                        }, (x) => x);
                    },
                    say: 'A rogue wave slams the hull. A boy is thrown clean over the rail.',
                },
                { who: 'lyra', say: 'No—!' },
                { who: 'sword', say: 'Boundary definition. Yes, that might be possible. Draw me. Focus on creating a surface beneath him.' },
                {
                    hold: {
                        hint: 'Press and hold to form the boundary',
                        duration: 2.4,
                        decay: 0.25,
                        onStart: () => ctx.audio.shield(),
                        onProgress: (p, holding, dt) => {
                            boundary.material.opacity = p;
                            boundaryGlow.material.opacity = p * 0.8;
                            boundary.scale.setScalar(0.4 + p * 0.6);
                            sword.setGlow(new THREE.Color(0xff3a1a).lerp(new THREE.Color(0x7ab8ff), p), 0.6 + p * 2.5);
                            // he keeps falling until the boundary holds
                            boy.position.y = Math.max(1.5, boy.position.y - dt * (holding ? 0.15 : 0.45));
                            boundary.position.y = boy.position.y - 0.25;
                            boundaryGlow.position.y = boundary.position.y;
                        },
                    },
                },
                {
                    do: async () => {
                        ctx.audio.shield();
                        spray.state.origin.copy(toWorld(boundary.position));
                        spray.state.emit = true;
                        ctx.flash('#bfe2ff', 1, 0.5);
                        const a = boy.position.clone();
                        const b = new THREE.Vector3(7, deckY, 3.4);
                        const ba = boundary.position.clone();
                        await ctx.tween(2.2, (e) => {
                            boy.position.lerpVectors(a, b, e);
                            boy.rotation.x = 1.4 * (1 - e);
                            boundary.position.lerpVectors(ba, new THREE.Vector3(7, deckY - 0.2, 3.4), e);
                            boundaryGlow.position.copy(boundary.position);
                        });
                        spray.state.emit = false;
                        await ctx.tween(1, (e) => {
                            boundary.material.opacity = 1 - e;
                            boundaryGlow.material.opacity = 0.8 * (1 - e);
                        });
                    },
                    say: 'A plane of blue-gold light catches the boy above the waves—and carries him home.',
                },
                { cam: { pos: [8, deckY + 2, -4.5], look: [3, deckY + 1.2, 1], dur: 3 }, who: 'sword', say: 'You drained yourself. Protective magic demands more energy than destruction. Curious.' },
                { who: 'sword', say: "The boy's survival... was not entirely without value to me." },
                { cam: { pos: [-5, deckY + 5, 6], look: [-13, deckY + 5.5, 1], dur: 3.5 }, say: 'On the quarterdeck, Captain Blackwood smiles—and begins to make other plans.' },
            ],
        };
    },
};
