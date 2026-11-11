// Act 3 — The Awakening (Chapter 3)
import * as THREE from 'three';
import { rng, makeFigure, makeSword, glowSprite, plankTexture, makeParticles } from '../helpers.js';

function treasurePile(scene, r, cx, cz, radius, height, count) {
    const geo = new THREE.CylinderGeometry(0.09, 0.09, 0.02, 10);
    const mat = new THREE.MeshStandardMaterial({ color: 0xe0b040, metalness: 1, roughness: 0.28, emissive: 0x3a2400, emissiveIntensity: 0.4 });
    const mesh = new THREE.InstancedMesh(geo, mat, count);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    for (let i = 0; i < count; i++) {
        const a = r() * Math.PI * 2;
        const d = Math.sqrt(r()) * radius;
        const h = Math.max(0, height * (1 - d / radius)) * (0.7 + r() * 0.3);
        e.set((r() - 0.5) * 1.2, r() * 6, (r() - 0.5) * 1.2);
        q.setFromEuler(e);
        m.compose(new THREE.Vector3(cx + Math.cos(a) * d, h + 0.01, cz + Math.sin(a) * d), q, new THREE.Vector3(1, 1, 1));
        mesh.setMatrixAt(i, m);
    }
    scene.add(mesh);
    return mesh;
}

export default {
    id: 'awakening',
    chapter: 'Chapter 3',
    title: 'The Awakening',
    ambience: { waves: 0.25, wind: 0.08, rain: 0.06, rumble: 0.2, drone: 0.4, droneHz: 55, droneCutoff: 260 },
    bloom: { strength: 0.8, radius: 0.5, threshold: 0.72 },
    exposure: 1.15,

    build(ctx) {
        const { scene, rig } = ctx;
        const r = rng(3);
        scene.background = new THREE.Color(0x050302);
        scene.fog = new THREE.FogExp2(0x0d0805, 0.045);

        // the hold
        const wood = plankTexture('#3b2617', 1);
        wood.repeat.set(4, 2);
        const room = new THREE.Mesh(new THREE.BoxGeometry(24, 7, 15), new THREE.MeshStandardMaterial({ map: wood, side: THREE.BackSide, roughness: 0.95 }));
        room.position.y = 3.5;
        scene.add(room);
        // ribs
        const ribMat = new THREE.MeshStandardMaterial({ color: 0x24160d, roughness: 1 });
        for (let x = -10; x <= 10; x += 3.3) {
            const rib = new THREE.Mesh(new THREE.TorusGeometry(7.3, 0.22, 4, 16, Math.PI), ribMat);
            rib.rotation.y = Math.PI / 2;
            rib.scale.set(1, 0.95, 1);
            rib.position.set(x, -0.2, 0);
            scene.add(rib);
            const beam = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 15), ribMat);
            beam.position.set(x, 6.6, 0);
            scene.add(beam);
        }

        scene.add(new THREE.HemisphereLight(0x4a3020, 0x050302, 0.5));

        // swinging lantern
        const pivot = new THREE.Group();
        pivot.position.set(0.5, 6.5, 0.5);
        scene.add(pivot);
        const lantern = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.45, 0.3), new THREE.MeshStandardMaterial({ color: 0x221a10, emissive: 0xffa040, emissiveIntensity: 1.1 }));
        lantern.position.y = -2.2;
        const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 2, 4), ribMat);
        rope.position.y = -1;
        const lglow = glowSprite(0xffa050, 2.2, 0.8);
        lglow.position.y = -2.2;
        const lamp = new THREE.PointLight(0xffa04a, 22, 18, 1.6);
        lamp.position.y = -2.3;
        pivot.add(rope, lantern, lglow, lamp);

        // treasure
        treasurePile(scene, r, -5.5, -3.5, 2.6, 1.2, 900);
        treasurePile(scene, r, 5.5, -4, 2.2, 1, 700);
        treasurePile(scene, r, -7, 3.5, 1.6, 0.6, 350);
        const gemColors = [0xff2050, 0x30a0ff, 0x40ff90, 0xc060ff, 0xffd040];
        for (let i = 0; i < 40; i++) {
            const c = gemColors[i % gemColors.length];
            const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.07 + r() * 0.06), new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.6, metalness: 0.3, roughness: 0.1 }));
            const pile = r() > 0.5 ? [-5.5, -3.5] : [5.5, -4];
            gem.position.set(pile[0] + (r() - 0.5) * 3.5, 0.3 + r() * 0.7, pile[1] + (r() - 0.5) * 3);
            scene.add(gem);
        }
        const chestMat = new THREE.MeshStandardMaterial({ color: 0x4a2c16, roughness: 0.8 });
        const bandMat = new THREE.MeshStandardMaterial({ color: 0x8a6a30, metalness: 0.8, roughness: 0.4 });
        [[-2.8, -5.5, 0.2], [2.5, -5.6, -0.3], [8.4, 1.5, 1.2], [-8.8, -0.5, 1.5]].forEach(([x, z, ry]) => {
            const c = new THREE.Group();
            const body = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.8, 0.9), chestMat);
            body.position.y = 0.4;
            const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 1.4, 8, 1, false, 0, Math.PI), chestMat);
            lid.rotation.z = Math.PI / 2;
            lid.position.y = 0.8;
            const band = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.85, 0.95), bandMat);
            band.position.y = 0.42;
            c.add(body, lid, band);
            c.position.set(x, 0, z);
            c.rotation.y = ry;
            scene.add(c);
        });
        // barrels
        const barrelMat = new THREE.MeshStandardMaterial({ color: 0x5a3a20, roughness: 0.9, flatShading: true });
        for (let i = 0; i < 6; i++) {
            const b = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.45, 1.2, 10), barrelMat);
            b.position.set(9 + (i % 2) * 1.1, 0.6, -5.5 + Math.floor(i / 2) * 1.1);
            scene.add(b);
        }

        // the crate and the sword
        const crate = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1, 0.9), new THREE.MeshStandardMaterial({ map: plankTexture('#5a3a22', 1), roughness: 0.9 }));
        crate.position.set(0, 0.5, 0);
        scene.add(crate);
        const sword = makeSword({ glow: 0xff3a1a, glowIntensity: 0.25 });
        sword.group.rotation.set(-Math.PI / 2, 0, -Math.PI / 2);
        sword.group.position.set(-0.5, 1.02, 0);
        sword.group.userData.markerOffset = new THREE.Vector3(0, 0.5, 0);
        scene.add(sword.group);
        // generous invisible click volume
        const hit = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.6, 0.6), new THREE.MeshBasicMaterial({ visible: false }));
        hit.position.y = 0.4;
        sword.group.add(hit);

        const lyra = makeFigure({ color: 0x3a4f63, hair: 0x2a1a10, hairLong: true });
        lyra.position.set(0.2, 0, 1.25);
        lyra.rotation.y = Math.PI;
        scene.add(lyra);
        const marla = makeFigure({ color: 0x5a4a3c, hair: 0x6a6a6a, height: 1.6 });
        marla.position.set(-2.6, 0, 1.8);
        marla.rotation.y = 2.4;
        scene.add(marla);

        // the blood filament
        const thread = new THREE.Mesh(
            new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0.15, 1.05, 0.75), new THREE.Vector3(0.1, 1.25, 0.4), new THREE.Vector3(0, 1.06, 0.02)]), 20, 0.008, 5),
            new THREE.MeshBasicMaterial({ color: 0xff2010, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })
        );
        scene.add(thread);

        const dust = makeParticles(scene, { count: 160, color: 0xffc080, size: 0.06, area: [14, 6, 10], origin: [0, 3, 0], velocity: [0.05, 0.02, 0], spread: [0.05, 0.05, 0.05], life: [5, 10], additive: true });
        const sparks = makeParticles(scene, { count: 120, color: 0xff4020, size: 0.12, area: [0.9, 0.1, 0.2], origin: [0.05, 1.05, 0], velocity: [0, 0.8, 0], spread: [0.5, 0.5, 0.5], life: [0.5, 1.6], swirl: 0.3 });
        sparks.state.emit = false;

        rig.rollFn = (t) => Math.sin(t * 0.55) * 0.035;
        const state = { pulse: 0.25, bonded: false };

        function update(dt, t) {
            pivot.rotation.z = Math.sin(t * 0.55 + 0.6) * 0.18;
            pivot.rotation.x = Math.cos(t * 0.4) * 0.06;
            lamp.intensity = 20 + Math.sin(t * 7) * 1.5 + Math.random() * 1.5;
            dust.update(dt);
            sparks.update(dt);
            const glow = state.bonded ? state.pulse + Math.sin(t * 3) * 0.3 : state.pulse * (0.7 + Math.sin(t * 2) * 0.3);
            sword.setGlow(0xff3a1a, glow);
        }

        return {
            update,
            camera: { pos: [8, 4.5, 6], look: [0, 1.5, -1] },
            beats: [
                { cam: { pos: [6.5, 3.6, 5.5], look: [0, 1.2, -1], dur: 6 }, say: 'The flagship Tempest. Below decks, Lyra and the other captives are set to cleaning Blackwood\'s treasure hold.' },
                { say: 'Gold. Jewels. Relics from a hundred plundered shores. The ship groans around them like something alive.' },
                {
                    cam: { pos: [1.7, 2.2, 1.1], look: [0, 1.05, 0], dur: 4 },
                    do: () => ctx.tween(3, (e) => (state.pulse = 0.25 + e * 0.6)),
                    say: 'And among the treasure—something plain. A sword that seems to hum, just beneath hearing.',
                },
                {
                    do: () => {
                        ctx.audio.impact();
                        ctx.shake(0.6);
                    },
                    say: 'The storm throws the Tempest sideways. Lyra falls hard. Splinters bite into her palm, drawing pinpricks of blood.',
                },
                {
                    click: {
                        targets: [sword.group],
                        hint: 'Reach for the sword',
                        onHit: async () => {
                            lyra.userData.parts.armR.rotation.x = -1.1;
                            state.bonded = true;
                            ctx.audio.bond();
                            ctx.shake(1.2);
                            ctx.flash('#ff1a0a', 1.6, 0.85);
                            sparks.state.emit = true;
                            thread.material.opacity = 1;
                            ctx.bloom.strength = 1.25;
                            await ctx.tween(1.2, (e) => (state.pulse = 0.85 + e * 1.2));
                        },
                    },
                },
                {
                    cam: { pos: [1.6, 1.8, 0.9], look: [0, 1.15, 0.2], dur: 2 },
                    do: async () => {
                        const visions = ['#ff6a10', '#60c0ff', '#ff1010'];
                        for (const c of visions) {
                            ctx.flash(c, 0.9, 0.7);
                            ctx.audio.whoosh();
                            await ctx.sleep(0.6);
                        }
                    },
                    say: 'A forge glowing with unnatural fire. A mountain splitting open. Robed figures chanting words that burn the air. A battlefield, the ground drinking blood like water.',
                },
                { who: 'sword', say: 'Finally.' },
                {
                    do: () => {
                        ctx.bloom.strength = 0.9;
                        sparks.state.emit = false;
                    },
                    who: 'sword',
                    say: 'Your name is Lyra.',
                },
                { who: 'lyra', say: "Something's wrong with that sword." },
                { who: 'sword', say: 'Nothing is wrong with me, girl. I am exactly as I was forged to be. You, however, are unexpectedly fragile.' },
                { cam: { pos: [-1.2, 1.9, 3.2], look: [0.2, 1.2, 0.6], dur: 3 }, who: 'sword', say: 'You cannot flee from me, little fish. We are bound now, you and I.' },
                { who: 'lyra', say: 'What do you mean, bound?' },
                { who: 'sword', say: 'Blood to metal. Life to purpose. The oldest magic, irreversible as death.' },
            ],
        };
    },
};
