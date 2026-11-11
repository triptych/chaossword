// Act 1 — Village Tides (Chapter 1)
import * as THREE from 'three';
import { makeSky, makeOcean, glowSprite, makeFigure, makeShip, makeParticles } from '../helpers.js';
import { buildStillwater, animateChimes } from './stillwater.js';

function makeGull() {
    const g = new THREE.Group();
    const m = new THREE.MeshBasicMaterial({ color: 0x2a2420, side: THREE.DoubleSide });
    const wing = new THREE.PlaneGeometry(0.9, 0.18);
    wing.translate(0.45, 0, 0);
    const l = new THREE.Mesh(wing, m);
    const r = new THREE.Mesh(wing, m);
    r.rotation.y = Math.PI;
    g.add(l, r);
    g.userData = { l, r };
    return g;
}

export default {
    id: 'village',
    chapter: 'Chapter 1',
    title: 'Village Tides',
    ambience: { waves: 0.5, wind: 0.12, drone: 0.25, droneHz: 65.4, droneCutoff: 380 },
    bloom: { strength: 0.55, radius: 0.6, threshold: 0.85 },

    build(ctx) {
        const { scene } = ctx;
        makeSky(scene, { top: '#24345e', mid: '#f0a466', bottom: '#2d3a4a', exponent: 0.5 });
        scene.fog = new THREE.Fog(0xf0a466, 70, 430);

        scene.add(new THREE.HemisphereLight(0xffd6a8, 0x334055, 0.8));
        const sun = new THREE.DirectionalLight(0xffa868, 2.6);
        sun.position.set(-60, 30, -200);
        scene.add(sun);

        const sunDisc = glowSprite(0xffc070, 160, 0.95);
        sunDisc.position.set(-90, 22, -900);
        scene.add(sunDisc);
        const sunCore = glowSprite(0xfff0d0, 50, 1);
        sunCore.position.copy(sunDisc.position);
        scene.add(sunCore);

        const ocean = makeOcean(scene, { color: 0x2c5a76, amp: 0.35, roughness: 0.25, metalness: 0.2 });
        const village = buildStillwater(scene);

        const merina = makeFigure({ color: 0x6d6a7a, hair: 0xd8d8d8, height: 1.55, sash: 0x5a7a9a });
        merina.position.set(-13.4, 1.0, 14.2);
        merina.rotation.y = Math.PI + 0.6;
        scene.add(merina);

        // warm window motes / sea spray sparkle
        const motes = makeParticles(scene, { count: 120, color: 0xffd8a0, size: 0.25, area: [60, 6, 20], origin: [0, 4, 10], velocity: [0.2, 0.1, 0], spread: [0.2, 0.15, 0.2], life: [4, 8] });

        const gulls = [];
        for (let i = 0; i < 5; i++) {
            const g = makeGull();
            g.userData.phase = i * 1.3;
            g.userData.radius = 14 + i * 5;
            g.userData.h = 12 + i * 2.5;
            scene.add(g);
            gulls.push(g);
        }

        // distant pirate sail, revealed at the end
        const farShip = makeShip({ length: 18, hull: 0x14100e, sail: 0x2a1d1a, flag: 0x6a0010, lanterns: 0 });
        farShip.position.set(-120, -0.5, -230);
        farShip.rotation.y = -0.2;
        farShip.visible = false;
        scene.add(farShip);

        const state = { chimeStrength: 0.4 };

        function update(dt, t) {
            ocean.update(dt);
            motes.update(dt);
            animateChimes(village.chimes, t, state.chimeStrength);
            state.chimeStrength = Math.max(0.4, state.chimeStrength - dt * 0.4);
            gulls.forEach((g) => {
                const a = t * 0.25 + g.userData.phase;
                g.position.set(Math.cos(a) * g.userData.radius + 2, g.userData.h + Math.sin(t + g.userData.phase) * 0.6, Math.sin(a) * g.userData.radius - 6);
                g.rotation.y = -a;
                const flap = Math.sin(t * 6 + g.userData.phase) * 0.45;
                g.userData.l.rotation.x = flap;
                g.userData.r.rotation.x = -flap;
            });
            village.lyra.position.y = 1.23 + Math.sin(t * 1.2) * 0.005;
            farShip.position.y = ocean.heightAt(farShip.position.x, farShip.position.z) - 0.6;
        }

        return {
            update,
            camera: { pos: [70, 32, -90], look: [0, 4, 15] },
            beats: [
                { cam: { pos: [28, 13, -42], look: [0, 3, 14], dur: 7 }, say: 'Stillwater. A fishing village on the coast, where every day tastes of salt and nothing ever changes.' },
                { cam: { pos: [9.5, 3.1, -13.5], look: [5, 2.4, -8], dur: 4 }, say: "Lyra Nightwind hauls the nets across the weathered dock. Middle child of five—the girl no one quite remembers to look for." },
                { cam: { pos: [6.8, 2.5, -1.5], look: [-10, 3, -120], dur: 4 }, who: 'thought', say: 'There must be more than this. More than mending nets and gutting fish until my hands are permanently stained with scales.' },
                { say: 'Lately, the dreams have come every night. Drowning—while burning.' },
                {
                    cam: { pos: [-9.5, 4.2, 6], look: [-14.5, 2.4, 14.8], dur: 3.5 },
                    click: {
                        targets: [village.chimes],
                        hint: "Wind chimes sing outside the oracle's hut — touch them",
                        onHit: async () => {
                            ctx.audio.chime();
                            state.chimeStrength = 3;
                        },
                    },
                },
                { who: 'merina', say: 'You dreamed it again, didn\'t you, child? The water and the fire.' },
                { who: 'lyra', say: "They're only dreams, Merina." },
                { who: 'merina', say: 'Dreams are the tide before the storm. Something is coming for you, Lyra Nightwind—whether you are ready or not.' },
                {
                    cam: { pos: [7.2, 2.5, 0.5], look: [-110, 4, -230], dur: 5 },
                    do: () => {
                        farShip.visible = true;
                    },
                    say: 'That evening, a traveling merchant brings news: pirate sails along the coast. A captain named Blackwood, hunting for things of power.',
                },
                { who: 'thought', say: 'The old stories say something powerful was hidden near Stillwater, generations ago...' },
            ],
        };
    },
};
