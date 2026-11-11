// Act 7 — Adrift & Trust Forged (Chapters 12–13)
import * as THREE from 'three';
import { rng, makeSky, makeOcean, makeStars, makeFigure, makeSword, makeBoat, makeTree, makeRock, makeParticles, glowSprite } from '../helpers.js';

const STORM = { top: '#05060a', mid: '#1c2230', bottom: '#05070a' };
const NIGHT = { top: '#060a1e', mid: '#3a3a6a', bottom: '#0a1020' };

export default {
    id: 'adrift',
    chapter: 'Chapters 12 – 13',
    title: 'Adrift',
    ambience: { waves: 0.8, wind: 0.6, rain: 0.4, rumble: 0.3, drone: 0.35, droneHz: 49, droneCutoff: 300 },
    bloom: { strength: 0.9, radius: 0.6, threshold: 0.65 },

    build(ctx) {
        const { scene } = ctx;
        const r = rng(13);
        const sky = makeSky(scene, { ...STORM, exponent: 0.6 });
        const stars = makeStars(scene, { count: 2200, opacity: 0 });
        scene.fog = new THREE.Fog(0x141822, 10, 140);
        const hemi = new THREE.HemisphereLight(0x6a7a9a, 0x101420, 1.1);
        scene.add(hemi);
        const lightning = new THREE.DirectionalLight(0xc8d8ff, 0);
        lightning.position.set(20, 50, -40);
        scene.add(lightning);
        const moonLight = new THREE.DirectionalLight(0x9ab0ff, 0);
        moonLight.position.set(-30, 40, -60);
        scene.add(moonLight);

        const ocean = makeOcean(scene, { color: 0x101a24, amp: 2.2, roughness: 0.25, metalness: 0.3 });
        ocean.state.speed = 1.6;

        // the stolen boat
        const boat = makeBoat({ length: 4.6 });
        scene.add(boat);
        const crew = [
            makeFigure({ color: 0x3a4f63, hair: 0x2a1a10, hairLong: true }),
            makeFigure({ color: 0x2f4a40, hair: 0x15100c, streak: true, hairLong: true }),
            makeFigure({ color: 0x5a4028, hair: 0x1a1008, height: 1.9 }),
        ];
        crew.forEach((c, i) => {
            c.scale.multiply(new THREE.Vector3(1, 0.7, 1));
            c.position.set(-1.3 + i * 1.2, 0.05, 0);
            c.rotation.y = Math.PI / 2;
            boat.add(c);
        });
        const sword = makeSword({ glow: 0xff5a2a, glowIntensity: 1.2 });
        sword.group.position.set(-1.0, 0.75, 0.25);
        sword.group.rotation.set(0.2, 0, -0.5);
        boat.add(sword.group);

        // the oracle's guiding light on the horizon
        const guide = glowSprite(0xcfeaff, 9, 0.9);
        guide.position.set(-35, 7, -120);
        guide.userData.markerOffset = new THREE.Vector3(0, 0, 0);
        scene.add(guide);
        const guideCore = glowSprite(0xffffff, 3, 1);
        guide.add(guideCore);
        guideCore.scale.setScalar(0.35);

        const rain = makeParticles(scene, { count: 900, color: 0x8a9ab8, size: 0.14, area: [60, 4, 60], origin: [0, 20, -10], velocity: [-6, -24, 0], spread: [1, 2, 1], life: [0.7, 1.1] });

        // ---------- the island (revealed after the storm)
        const island = new THREE.Group();
        island.position.set(0, 0, -200);
        island.visible = false;
        scene.add(island);
        const land = new THREE.Mesh(new THREE.CylinderGeometry(14, 22, 4, 16, 1), new THREE.MeshStandardMaterial({ color: 0xbfa27a, roughness: 1, flatShading: true }));
        land.position.y = -1.2;
        island.add(land);
        const green = new THREE.Mesh(new THREE.CylinderGeometry(9, 12, 1.4, 12), new THREE.MeshStandardMaterial({ color: 0x3a5a2a, roughness: 1, flatShading: true }));
        green.position.set(-3, 1.2, -4);
        island.add(green);
        for (let i = 0; i < 8; i++) {
            const t = makeTree(r);
            const a = r() * Math.PI * 2;
            const d = 3 + r() * 6;
            t.position.set(-3 + Math.cos(a) * d, 1.8, -4 + Math.sin(a) * d);
            island.add(t);
        }
        for (let i = 0; i < 8; i++) {
            const rk = makeRock(r, 0.4 + r() * 0.8, 0x5a524a);
            const a = r() * Math.PI * 2;
            rk.position.set(Math.cos(a) * 13, 0.6, Math.sin(a) * 13);
            island.add(rk);
        }
        const fireGlow = glowSprite(0xff9a40, 3, 1);
        fireGlow.position.set(2, 1.4, 5);
        island.add(fireGlow);
        const fireLight = new THREE.PointLight(0xff8a3a, 0, 16, 1.6);
        fireLight.position.set(2, 1.8, 5);
        island.add(fireLight);
        const fireEmbers = makeParticles(scene, { count: 80, color: 0xff8a3a, size: 0.18, area: [0.6, 0.2, 0.6], origin: [2, 1.4, -195], velocity: [0, 1.6, 0], spread: [0.3, 0.6, 0.3], life: [0.6, 1.8], swirl: 0.3 });
        const around = [
            { fig: makeFigure({ color: 0x3a4f63, hair: 0x2a1a10, hairLong: true }), p: [3.6, 0.8, 6.2] },
            { fig: makeFigure({ color: 0x2f4a40, hair: 0x15100c, streak: true, hairLong: true }), p: [0.4, 0.8, 6.0] },
            { fig: makeFigure({ color: 0x5a4028, hair: 0x1a1008, height: 1.9 }), p: [2.2, 0.8, 3.2] },
        ];
        around.forEach(({ fig, p }) => {
            fig.scale.multiply(new THREE.Vector3(1, 0.62, 1));
            fig.position.set(...p);
            fig.lookAt(new THREE.Vector3(2, 0.8, 5));
            fig.rotation.x = 0;
            fig.rotation.z = 0;
            island.add(fig);
        });
        const islandSword = makeSword({ glow: 0xff5a2a, glowIntensity: 1.0 });
        islandSword.group.position.set(4.4, 0.75, 5.4);
        islandSword.group.rotation.z = 0.15;
        island.add(islandSword.group);

        const state = { storm: 1, strike: 2, glowColor: new THREE.Color(0xff5a2a), glow: 1.0 };
        const tmpN = new THREE.Vector3();

        function update(dt, t) {
            ocean.update(dt);
            rain.update(dt);
            fireEmbers.update(dt);
            // boat rides the swell
            const bx = 0;
            const bz = 0;
            const h = ocean.heightAt(bx, bz);
            const hx = ocean.heightAt(bx + 1.5, bz) - ocean.heightAt(bx - 1.5, bz);
            const hz = ocean.heightAt(bx, bz + 1) - ocean.heightAt(bx, bz - 1);
            boat.position.set(bx, h - 0.15, bz);
            boat.rotation.z = Math.atan2(hx, 3);
            boat.rotation.x = -Math.atan2(hz, 2);
            guide.material.opacity = 0.6 + Math.sin(t * 2) * 0.3;
            // lightning in the storm
            if (state.storm > 0.5) {
                state.strike -= dt;
                if (state.strike <= 0) {
                    state.strike = 3 + Math.random() * 5;
                    lightning.intensity = 7;
                    ctx.flash('#c8d8ff', 0.45, 0.3);
                    setTimeout(() => ctx.audio.thunder(), 150 + Math.random() * 500);
                }
            }
            lightning.intensity = Math.max(0, lightning.intensity - dt * 18);
            fireLight.intensity = island.visible ? 26 + Math.sin(t * 9) * 3 + Math.random() * 3 : 0;
            fireGlow.scale.setScalar(2.6 + Math.sin(t * 11) * 0.3);
            sword.setGlow(state.glowColor, state.glow + Math.sin(t * 2) * 0.2);
            islandSword.setGlow(state.glowColor, state.glow + Math.sin(t * 2) * 0.2);
            tmpN.set(0, 0, 0);
        }

        return {
            update,
            camera: { pos: [6, 5, 10], look: [0, 1, 0] },
            beats: [
                { cam: { pos: [5, 3.5, 8], look: [0, 1, -2], dur: 5 }, say: 'Adrift. Waves taller than the Tempest\'s masts. Three fugitives in a stolen boat, and nothing but black water in every direction.' },
                { who: 'sword', say: 'Port, now. Lean into it. Again—hold. The next one breaks early.' },
                { cam: { pos: [-1.5, 2.6, 4.5], look: [-35, 6, -120], dur: 4 }, say: 'Hours pass, or days. Exhausted, half-delirious, Lyra sees a light where no light should be.' },
                { who: 'spirit', say: 'This way, child. Follow me home.' },
                {
                    click: {
                        targets: [guide],
                        hint: "Steer toward the oracle's light",
                        onHit: async () => {
                            ctx.audio.voice('merina');
                            ctx.audio.whoosh();
                            await ctx.tween(1.2, (e) => guide.scale.setScalar(9 + e * 30));
                        },
                    },
                },
                {
                    do: async () => {
                        await ctx.ui.fade(true, 1.4);
                        // the storm breaks — switch the world to a clear night
                        state.storm = 0;
                        sky.blend(STORM, NIGHT, 1);
                        stars.material.opacity = 1;
                        rain.state.emit = false;
                        rain.points.visible = false;
                        scene.fog.color.set(0x141a30);
                        scene.fog.near = 60;
                        scene.fog.far = 380;
                        ocean.mesh.position.z = -200;
                        ocean.state.amp = 0.35;
                        ocean.state.speed = 0.7;
                        ocean.mat.color.set(0x16243e);
                        hemi.intensity = 0.5;
                        moonLight.intensity = 1.4;
                        ctx.refreshEnv();
                        guide.visible = false;
                        boat.visible = false;
                        island.visible = true;
                        ctx.audio.ambience({ waves: 0.35, wind: 0.08, fire: 0.18, drone: 0.25, droneHz: 65.4, droneCutoff: 500 }, 2);
                        ctx.setCamera([9, 4, -183], [2, 1.2, -196], 0);
                        await ctx.ui.fade(false, 1.6);
                    },
                    say: 'The storm breaks. Dawn finds them on a small island with fresh water—and no pirates at all.',
                },
                { cam: { pos: [6.2, 2.2, -189], look: [3, 1.1, -195], dur: 4 }, say: 'Days later, beside a small fire under more stars than Lyra has ever seen, the voice in her head begins to sound different. Less like metal. More like someone.' },
                { who: 'sword', say: "I would prefer to be called Kais, rather than 'the sword' or 'weapon.'" },
                { who: 'sword', say: "It represents a partial reclamation of what I was before the corruption. Kaisidor. 'Protector of Boundaries.'" },
                {
                    prompt: 'How does Lyra answer?',
                    choice: [
                        { label: '"Kais, then. It suits you."', then: [{ who: 'lyra', say: 'Kais, then. It suits you better than anything I\'ve been calling you.' }, { who: 'kais', say: 'You were calling me a great many things. I heard all of them.' }] },
                        { label: '"Then protect. Don\'t destroy."', then: [{ who: 'lyra', say: "Then be what that name means. Protect. Don't destroy." }, { who: 'kais', say: 'I do not know if I remember how. But... I would like to learn. With you.' }] },
                    ],
                },
                {
                    cam: { pos: [6.8, 1.5, -193.4], look: [4.4, 1.2, -194.7], dur: 3 },
                    do: () =>
                        ctx.tween(3, (e) => {
                            state.glowColor.set(0xff5a2a).lerp(new THREE.Color(0xffc35a), e);
                            state.glow = 1 + e * 0.6;
                        }),
                    say: 'For the first time, the red glow along the blade warms toward gold.',
                },
                { who: 'kais-gold', say: 'Thank you, Lyra. For the name—and for not letting go.' },
            ],
        };
    },
};
