// Act 5 — Dreams of Fire (Chapters 8–9)
import * as THREE from 'three';
import { rng, makeSky, makeOcean, makeFigure, makeSword, makeRock, makeParticles, glowSprite } from '../helpers.js';

const ECHOES = [
    {
        name: 'Hakon the Red',
        pos: [-7, 3.2, -4],
        fig: { color: 0x5a1010, height: 2.05, hair: 0x6a1a0a },
        line: 'Hakon the Red. Seven coastal kingdoms conquered. He died starving himself, certain every meal was poisoned.',
        note: 110,
    },
    {
        name: 'Lady Vestra',
        pos: [0, 5.2, -9],
        fig: { color: 0x3a0a2a, height: 1.75, hair: 0x1a0a10, hairLong: true },
        line: 'Lady Vestra sought the sword to protect her people. In the end, she bled them in rituals to feed its power.',
        note: 130.8,
    },
    {
        name: 'Thorne the Wanderer',
        pos: [7, 3.6, -4.5],
        fig: { color: 0x2a2a2a, height: 1.85, hair: 0x2a2018 },
        line: 'Thorne the Wanderer held it twenty-three years, longer than any other. His last act was to hide it where he hoped no one would ever find it.',
        note: 164.8,
    },
];

export default {
    id: 'dreams',
    chapter: 'Chapters 8 – 9',
    title: 'Dreams of Fire',
    ambience: { waves: 0.15, wind: 0.25, fire: 0.25, drone: 0.75, droneHz: 41.2, droneCutoff: 520 },
    bloom: { strength: 1.1, radius: 0.75, threshold: 0.55 },
    exposure: 1.0,

    build(ctx) {
        const { scene } = ctx;
        const r = rng(5);
        makeSky(scene, { top: '#0e0208', mid: '#6a0c10', bottom: '#050002', exponent: 0.4 });
        scene.fog = new THREE.FogExp2(0x2a0508, 0.016);
        scene.add(new THREE.HemisphereLight(0xff5040, 0x100004, 0.8));
        const key = new THREE.DirectionalLight(0xff7050, 1.2);
        key.position.set(0, 20, -30);
        scene.add(key);

        // the sea she drowns in, under a burning sky
        const ocean = makeOcean(scene, { color: 0x14040a, amp: 0.25, emissive: 0x200204, roughness: 0.1, metalness: 0.6, y: -2 });

        // a colossal ghost of the sword, hanging in the sky
        const ghost = makeSword({ glow: 0xff2a10, glowIntensity: 1.6, light: false });
        ghost.group.scale.setScalar(26);
        ghost.group.position.set(0, 44, -70);
        ghost.group.rotation.z = Math.PI;
        ghost.group.traverse((o) => o.material && (o.material.fog = false));
        scene.add(ghost.group);

        // floating rocks
        const center = makeRock(r, 2.4, 0x2a1a1a);
        center.scale.set(1.3, 0.5, 1.3);
        center.position.set(0, 0, 3);
        scene.add(center);
        const lyra = makeFigure({ color: 0x3a4f63, hair: 0x2a1a10, hairLong: true, emissive: 0x3a1410, emissiveIntensity: 1 });
        const lyraLight = new THREE.PointLight(0xff8060, 14, 8, 1.5);
        lyraLight.position.set(1.5, 3, 5);
        scene.add(lyraLight);
        lyra.position.set(0, 1, 3);
        lyra.rotation.y = Math.PI;
        scene.add(lyra);

        const echoes = ECHOES.map((e, i) => {
            const rock = makeRock(r, 1.6, 0x241414);
            rock.scale.set(1.2, 0.45, 1.2);
            rock.position.set(e.pos[0], e.pos[1] - 0.7, e.pos[2]);
            scene.add(rock);
            const fig = makeFigure({ ...e.fig, emissive: 0xff2a10, emissiveIntensity: 0.6, opacity: 0.55 });
            fig.position.set(...e.pos);
            fig.rotation.y = Math.atan2(-e.pos[0], 3 - e.pos[2]);
            const halo = glowSprite(0xff3018, 4, 0.5);
            halo.position.y = 1.2;
            fig.add(halo);
            fig.userData.halo = halo;
            fig.userData.markerOffset = new THREE.Vector3(0, 1.1, 0);
            fig.userData.base = e.pos[1];
            fig.userData.phase = i * 2;
            fig.userData.echo = e;
            const hit = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.4, 1.4), new THREE.MeshBasicMaterial({ visible: false }));
            hit.position.y = 1;
            fig.add(hit);
            scene.add(fig);
            return { fig, rock };
        });

        const merina = makeFigure({ color: 0xbfe6ff, hair: 0xffffff, height: 1.55, emissive: 0x9fd6ff, emissiveIntensity: 1.2, opacity: 0 });
        merina.position.set(-1.6, 1, 1.4);
        merina.rotation.y = 2.6;
        const mHalo = glowSprite(0xbfe6ff, 3.2, 0);
        mHalo.position.y = 1;
        merina.add(mHalo);
        scene.add(merina);
        const mLight = new THREE.PointLight(0x9fd6ff, 0, 14, 1.5);
        mLight.position.set(-1.6, 2.5, 1.4);
        scene.add(mLight);

        const embers = makeParticles(scene, { count: 500, color: 0xff5a20, size: 0.25, area: [40, 2, 40], origin: [0, -2, -5], velocity: [0, 1.6, 0], spread: [0.4, 0.8, 0.4], life: [4, 9], swirl: 0.5 });
        const motes = makeParticles(scene, { count: 80, color: 0xbfe6ff, size: 0.18, area: [3, 3, 3], origin: [-1.6, 2, 1.4], velocity: [0, 0.4, 0], spread: [0.3, 0.3, 0.3], life: [1.5, 3] });
        motes.state.emit = false;

        const state = { ghost: 1.6 };

        function update(dt, t) {
            ocean.update(dt);
            embers.update(dt);
            motes.update(dt);
            ghost.setGlow(state.gold ? 0xffc35a : 0xff2a10, state.ghost + Math.sin(t * 1.2) * 0.3);
            ghost.group.position.y = 44 + Math.sin(t * 0.3) * 1.5;
            echoes.forEach(({ fig, rock }) => {
                const y = fig.userData.base + Math.sin(t * 0.8 + fig.userData.phase) * 0.3;
                fig.position.y = y;
                rock.position.y = y - 0.7;
                rock.rotation.y += dt * 0.05;
            });
            center.position.y = Math.sin(t * 0.6) * 0.1;
            lyra.position.y = center.position.y + 1;
            merina.position.y = 1.05 + Math.sin(t * 1.1) * 0.08;
        }

        return {
            update,
            camera: { pos: [0, 4, 18], look: [0, 3, -10] },
            beats: [
                { cam: { pos: [0, 3.2, 11], look: [0, 2.6, -6], dur: 6 }, say: "In Lyra's dreams, the sword's memories bleed into her own. She drowns, and burns, and wakes, and sleeps again." },
                { who: 'sword', say: 'You should not be here. These memories are mine.' },
                { say: 'But the memories are not silent. They are full of faces—every hand that ever held the blade.' },
                {
                    cam: { pos: [0, 4.2, 9], look: [0, 3.8, -6], dur: 3 },
                    click: {
                        targets: echoes.map((e) => e.fig),
                        all: true,
                        hint: "Touch the echoes of the sword's past wielders",
                        onHit: async (fig) => {
                            const e = fig.userData.echo;
                            ctx.audio.note(e.note, 0.15, 3);
                            ctx.audio.whoosh();
                            fig.userData.halo.material.opacity = 1;
                            fig.userData.halo.scale.setScalar(7);
                            ctx.flash('#ff3a1a', 0.8, 0.35);
                            await ctx.say('echo', e.line, { label: e.name });
                            fig.userData.halo.scale.setScalar(4);
                            fig.userData.halo.material.opacity = 0.25;
                        },
                    },
                },
                { who: 'thought', say: 'Every one of them was changed by it. Every one of them lost.' },
                {
                    cam: { pos: [1.5, 2.6, 6.5], look: [-1, 2.1, 1.8], dur: 3 },
                    do: async () => {
                        ctx.audio.voice('merina');
                        motes.state.emit = true;
                        await ctx.tween(2, (e) => {
                            merina.traverse((o) => {
                                if (o.material && o.material !== mHalo.material) o.material.opacity = e * 0.75;
                            });
                            mHalo.material.opacity = e * 0.4;
                            mLight.intensity = e * 10;
                        });
                    },
                    say: 'Then—cool light, like moonlight on still water.',
                },
                { who: 'spirit', say: 'Little one. You were never meant to carry this alone.' },
                { who: 'lyra', say: 'Merina? You... you died. I watched the roof come down.' },
                { who: 'spirit', say: 'What is left of me came with you. Not for long. Ask it, child. Ask it what it was before the blood. Ask its name.' },
                { cam: { pos: [0, 2.4, 7], look: [0, 6, -60], dur: 4 }, who: 'lyra', say: 'What were you? Before all of this?' },
                {
                    do: async () => {
                        state.gold = true;
                        ctx.audio.bell(196);
                        ctx.flash('#ffd46b', 1.6, 0.5);
                        await ctx.tween(2, (e) => (state.ghost = 1.6 + e * 0.8));
                    },
                    who: 'sword',
                    say: '...Kaisidor. In the old tongue: Protector of Boundaries. I had... forgotten.',
                },
                {
                    do: async () => {
                        state.gold = false;
                        ctx.audio.thunder();
                        ctx.shake(0.6);
                        ctx.flash('#ffffff', 0.5, 0.6);
                    },
                    say: 'Thunder tears the dream apart. Lyra wakes to a storm battering the fleet—and to a captain who has seen far too much.',
                },
            ],
        };
    },
};
