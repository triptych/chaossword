// Act 6 — Ritual Betrayal (Chapter 11)
import * as THREE from 'three';
import { rng, makeSky, makeFigure, makeSword, makeRuneCircle, makeArtifact, makeParticles, makeRock, glowSprite } from '../helpers.js';

export default {
    id: 'ritual',
    chapter: 'Chapter 11',
    title: 'Ritual Betrayal',
    ambience: { wind: 0.45, rain: 0.35, rumble: 0.35, drone: 0.7, droneHz: 46.2, droneCutoff: 420 },
    bloom: { strength: 1.0, radius: 0.6, threshold: 0.6 },
    exposure: 1.1,

    build(ctx) {
        const { scene } = ctx;
        const r = rng(21);
        makeSky(scene, { top: '#06070c', mid: '#262838', bottom: '#050508', exponent: 0.5 });
        scene.fog = new THREE.Fog(0x12131a, 25, 160);
        const hemi = new THREE.HemisphereLight(0x7a80a8, 0x1a1a22, 1.5);
        scene.add(hemi);
        const moon = new THREE.DirectionalLight(0x9aa8d0, 0.9);
        moon.position.set(20, 40, 30);
        scene.add(moon);
        const lightning = new THREE.DirectionalLight(0xc8d8ff, 0);
        lightning.position.set(-30, 60, -20);
        scene.add(lightning);

        // the plateau and the Convergence Chamber
        const plateau = new THREE.Mesh(new THREE.CylinderGeometry(20, 26, 10, 14, 1), new THREE.MeshStandardMaterial({ color: 0x55555e, roughness: 1, flatShading: true }));
        plateau.position.y = -5;
        scene.add(plateau);
        const floor = new THREE.Mesh(new THREE.CircleGeometry(10, 40), new THREE.MeshStandardMaterial({ color: 0x24242a, roughness: 0.6, metalness: 0.2 }));
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = 0.01;
        scene.add(floor);
        const pillarMat = new THREE.MeshStandardMaterial({ color: 0x55555e, roughness: 0.95, flatShading: true });
        for (let i = 0; i < 10; i++) {
            const a = (i / 10) * Math.PI * 2;
            const h = i % 3 === 0 ? 3 + r() * 2 : 7 + r() * 1.5;
            const p = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.85, h, 8), pillarMat);
            p.position.set(Math.cos(a) * 13, h / 2, Math.sin(a) * 13);
            scene.add(p);
        }
        for (let i = 0; i < 12; i++) {
            const rk = makeRock(r, 0.5 + r(), 0x34343a);
            const a = r() * Math.PI * 2;
            rk.position.set(Math.cos(a) * (15 + r() * 4), 0, Math.sin(a) * (15 + r() * 4));
            scene.add(rk);
        }

        const circle = makeRuneCircle(7.5, 0xff2a40, 0.0, 3);
        circle.position.y = 0.04;
        scene.add(circle);
        const inner = makeRuneCircle(3.4, 0xff6a2a, 0.0, 8);
        inner.position.y = 0.05;
        scene.add(inner);

        // Lyra, forced to kneel at the centre
        const lyra = makeFigure({ color: 0x3a4f63, hair: 0x2a1a10, hairLong: true });
        lyra.scale.set(1, 0.72, 1);
        lyra.position.set(0, 0, 0);
        lyra.rotation.y = 0.4;
        scene.add(lyra);
        const sword = makeSword({ glow: 0xff3a1a, glowIntensity: 0.8 });
        sword.group.position.set(0.5, 0.05, 0.8);
        sword.group.rotation.set(-Math.PI / 2, 0, 0.6);
        scene.add(sword.group);

        const blackwood = makeFigure({ color: 0x6a0c18, hair: 0x0a0808, height: 1.9, braids: true, sash: 0xc9a23a });
        blackwood.position.set(-1.4, 0, 1.6);
        blackwood.rotation.y = 2.4;
        scene.add(blackwood);
        const dagger = makeSword({ length: 0.35, glow: 0xff0030, glowIntensity: 1.2, light: false });
        dagger.group.scale.setScalar(0.8);
        dagger.group.position.set(0.25, 0.85, 0.3);
        dagger.group.rotation.x = 1.3;
        blackwood.add(dagger.group);

        // the three stolen artifacts and their bearers
        const defs = [
            { kind: 'chalice', a: -2.2, bearer: { color: 0x1d2c4a, hair: 0x101820 } },
            { kind: 'feather', a: -0.1, bearer: { color: 0xc8c0b0, hair: 0xe8e0d0, hairLong: true } },
            { kind: 'root', a: 2.0, bearer: { color: 0x5a4028, hair: 0x1a1008, height: 1.9 } },
        ];
        const pedMat = new THREE.MeshStandardMaterial({ color: 0x45454c, roughness: 0.9, flatShading: true });
        const artifacts = defs.map((d) => {
            const x = Math.cos(d.a) * 5.2;
            const z = Math.sin(d.a) * 5.2;
            const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.6, 1.1, 8), pedMat);
            ped.position.set(x, 0.55, z);
            scene.add(ped);
            const art = makeArtifact(d.kind);
            art.position.set(x, 2, z);
            scene.add(art);
            const bearer = makeFigure(d.bearer);
            bearer.position.set(Math.cos(d.a) * 6.6, 0, Math.sin(d.a) * 6.6);
            bearer.rotation.y = Math.atan2(-bearer.position.x, -bearer.position.z);
            scene.add(bearer);
            // beam to Lyra
            const from = new THREE.Vector3(x, 2, z);
            const to = new THREE.Vector3(0, 1.0, 0);
            const len = from.distanceTo(to);
            const beam = new THREE.Mesh(
                new THREE.CylinderGeometry(0.05, 0.05, len, 6, 1, true),
                new THREE.MeshBasicMaterial({ color: art.userData.color, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })
            );
            beam.position.copy(from).add(to).multiplyScalar(0.5);
            beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), to.clone().sub(from).normalize());
            scene.add(beam);
            const pl = new THREE.PointLight(art.userData.color, 0, 10, 1.5);
            pl.position.copy(from);
            scene.add(pl);
            return { art, beam, pl, bearer };
        });

        const rain = makeParticles(scene, { count: 900, color: 0x8090b0, size: 0.12, area: [50, 4, 50], origin: [0, 22, 0], velocity: [-2, -26, 0], spread: [0.4, 2, 0.4], life: [0.7, 1.1], additive: true });
        const sparks = makeParticles(scene, { count: 200, color: 0xff6a3a, size: 0.25, area: [1.2, 0.5, 1.2], origin: [0, 0.8, 0], velocity: [0, 3, 0], spread: [3, 2, 3], life: [0.4, 1.2], gravity: 3 });
        sparks.state.emit = false;
        const core = glowSprite(0xff4030, 3, 0);
        core.position.set(0, 1, 0);
        scene.add(core);

        const state = { ritual: 0, strike: 3, resist: 0, broken: false };

        function update(dt, t) {
            rain.update(dt);
            sparks.update(dt);
            circle.rotation.z += dt * 0.15 * (1 + state.ritual * 2);
            inner.rotation.z -= dt * 0.35 * (1 + state.ritual * 2);
            circle.material.opacity = state.broken ? Math.max(0, circle.material.opacity - dt * 0.6) : state.ritual * (0.75 + Math.sin(t * 6) * 0.15);
            inner.material.opacity = circle.material.opacity;
            artifacts.forEach(({ art, beam, pl }, i) => {
                art.rotation.y += dt * (0.6 + state.ritual * 3);
                art.position.y = 2 + Math.sin(t * 1.5 + i) * 0.15;
                const pulse = 0.6 + Math.sin(t * 8 + i * 2) * 0.4;
                beam.material.opacity = state.broken ? 0 : state.ritual * pulse * 0.9;
                beam.scale.set(1 + state.ritual * 2, 1, 1 + state.ritual * 2);
                pl.intensity = state.broken ? 0 : state.ritual * 30 * pulse;
                art.userData.halo.material.opacity = state.broken ? 0.1 : 0.3 + state.ritual * 0.7;
            });
            core.material.opacity = state.broken ? 0 : state.ritual * 0.9;
            core.scale.setScalar(2 + state.ritual * 3 + Math.sin(t * 10) * 0.4);
            // lightning
            state.strike -= dt;
            if (state.strike <= 0) {
                state.strike = 4 + Math.random() * 6;
                lightning.intensity = 6;
                ctx.flash('#c8d8ff', 0.5, 0.35);
                setTimeout(() => ctx.audio.thunder(), 200 + Math.random() * 600);
            }
            lightning.intensity = Math.max(0, lightning.intensity - dt * 18);
            sword.setGlow(state.resist > 0 ? new THREE.Color(0xff3a1a).lerp(new THREE.Color(0xffc35a), state.resist) : 0xff3a1a, 0.8 + state.ritual * 1.5 + state.resist * 2);
        }

        return {
            update,
            camera: { pos: [0, 16, 26], look: [0, 1, 0] },
            beats: [
                { cam: { pos: [0, 9, 17], look: [0, 1, 0], dur: 7 }, say: 'Blackwood does not punish. She plans. On a storm-black night, her crew drags Lyra up to the Convergence Chamber—a ring of ancient stone built where the boundaries between realms run thin.' },
                {
                    do: () => ctx.tween(3, (e) => (state.ritual = e * 0.45)),
                    who: 'blackwood',
                    say: 'Blood forges connection, blood breaks barriers, blood transcends limitation.',
                },
                { cam: { pos: [8, 3.5, 7], look: [0, 1.6, 0], dur: 3.5 }, say: 'The Chalice of Tides. The Feather of Whispers. The Root of Stone. Three artifacts pulse around her, pulling at the bond like hooks in her chest.' },
                {
                    cam: { pos: [2.6, 1.8, 3.6], look: [-0.5, 1.0, 0.6], dur: 3 },
                    do: () => {
                        ctx.audio.heartbeat();
                        return ctx.tween(2, (e) => (state.ritual = 0.45 + e * 0.4));
                    },
                    who: 'blackwood',
                    say: 'Surrender the connection. The pain ends when you release the artifact willingly.',
                },
                { do: () => ctx.shake(0.4), who: 'sword', say: 'Lyra—do not let go. Whatever she promises. Hold on to me.' },
                { who: 'thought', say: "It's afraid. Not for itself. For me." },
                {
                    hold: {
                        hint: 'Press and hold — don\'t let them sever the bond',
                        duration: 4.2,
                        decay: 0.3,
                        onStart: () => ctx.audio.heartbeat(),
                        onProgress: (p, holding) => {
                            state.resist = p;
                            state.ritual = 0.85 + (holding ? 0.15 : 0);
                            ctx.shake(holding ? 0.08 + p * 0.12 : 0.05);
                            if (holding && Math.random() < 0.02) ctx.audio.heartbeat();
                        },
                    },
                },
                {
                    cam: { pos: [6, 4, 9], look: [0, 1, 0], dur: 2 },
                    do: async () => {
                        state.broken = true;
                        sparks.state.emit = true;
                        ctx.audio.boom(1.4);
                        ctx.audio.bell(130.8);
                        ctx.shake(1.4);
                        ctx.flash('#ffffff', 1.6, 0.9);
                        await ctx.sleep(1.2);
                        sparks.state.emit = false;
                    },
                    say: 'Thorn tears free of his guards and drives the Root of Stone into the circle. The pattern shatters. The artifacts flare—and fall dark.',
                },
                { who: 'blackwood', say: 'No! The power is mine to direct!' },
                { who: 'nari', say: 'Now, Lyra! The boat—go, go!' },
                {
                    do: () => {
                        lyra.scale.set(1, 1, 1);
                        sword.group.position.set(0.3, 0.95, 0.3);
                        sword.group.rotation.set(0.5, 0, 0);
                    },
                    who: 'sword',
                    say: 'I will guard your back. Run.',
                },
                { cam: { pos: [0, 18, 26], look: [0, 0, 0], dur: 5 }, say: 'With Nari and Thorn beside her, Lyra runs for the cliffs—and the three of them drop a stolen boat into the storm.' },
            ],
        };
    },
};
