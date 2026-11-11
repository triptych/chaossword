// Act 10 — Protector of Boundaries (Chapter 24)
import * as THREE from 'three';
import { rng, makeSky, makeOcean, makeShip, makeFigure, makeSword, makeHut, makeParticles, glowSprite } from '../helpers.js';

export default {
    id: 'protector',
    chapter: 'Chapter 24',
    title: 'Protector of Boundaries',
    ambience: { waves: 0.55, wind: 0.25, drone: 0.3, droneHz: 87.3, droneCutoff: 900 },
    bloom: { strength: 0.75, radius: 0.65, threshold: 0.75 },

    build(ctx) {
        const { scene } = ctx;
        const r = rng(24);
        makeSky(scene, { top: '#3a6ab0', mid: '#ffd29a', bottom: '#3a5a78', exponent: 0.45 });
        scene.fog = new THREE.Fog(0xf2c89a, 90, 650);
        scene.add(new THREE.HemisphereLight(0xffe6c8, 0x3a5060, 1.2));
        const sun = new THREE.DirectionalLight(0xffcf90, 2.6);
        sun.position.set(-80, 50, -160);
        scene.add(sun);
        const sunDisc = glowSprite(0xffd890, 140, 0.9);
        sunDisc.position.set(-200, 60, -900);
        scene.add(sunDisc);

        const ocean = makeOcean(scene, { color: 0x2a6a8a, amp: 0.55, roughness: 0.2, metalness: 0.25 });
        ocean.state.speed = 1.3;

        // the Boundary
        const ship = makeShip({ length: 30, hull: 0x3a2a1c, sail: 0xf4efe4, masts: 2, flag: 0x1d4f9a, lanterns: 0 });
        ship.position.y = -0.5;
        scene.add(ship);
        const deckY = ship.userData.deckY - 0.5;

        const lyra = makeFigure({ color: 0x2a4a7a, hair: 0x2a1a10, hairLong: true, sash: 0xd4af37 });
        lyra.position.set(10, ship.userData.deckY + 0.1, 0);
        lyra.rotation.y = Math.PI / 2;
        ship.add(lyra);
        const sword = makeSword({ glow: 0xffc35a, glowIntensity: 1.3 });
        sword.group.position.set(0.32, 0.35, -0.05);
        sword.group.rotation.set(Math.PI, 0, 0.08);
        lyra.add(sword.group);
        const nari = makeFigure({ color: 0x1d3a6a, hair: 0x15100c, streak: true, hairLong: true, sash: 0xd4af37 });
        nari.position.set(-2, ship.userData.deckY, 2);
        nari.rotation.y = 1.2;
        ship.add(nari);

        // distant coast with villages to rebuild
        const coast = new THREE.Group();
        const hill = new THREE.Mesh(new THREE.CylinderGeometry(60, 90, 14, 18, 1), new THREE.MeshStandardMaterial({ color: 0x7a8a50, roughness: 1, flatShading: true }));
        hill.position.y = -4;
        coast.add(hill);
        for (let i = 0; i < 9; i++) {
            const h = makeHut(r, { glow: 0.4 });
            const a = (r() - 0.5) * 1.6;
            h.position.set(Math.sin(a) * 55, 3, Math.cos(a) * 55);
            h.rotation.y = a;
            coast.add(h);
        }
        coast.position.set(60, 0, 190);
        scene.add(coast);

        const wake = makeParticles(scene, { count: 220, color: 0xffffff, size: 0.5, area: [2, 0.2, 6], origin: [16, 0.4, 0], velocity: [-6, 0.6, 0], spread: [1, 0.4, 2.5], life: [1, 2.5], gravity: 1, additive: true });
        wake.state.intensity = 0.6;

        // the Oracle's Spirit, one last time
        const spirit = makeFigure({ color: 0xbfe6ff, hair: 0xffffff, height: 1.55, emissive: 0x9fd6ff, emissiveIntensity: 1.4, opacity: 0 });
        spirit.position.set(16, deckY + 0.6, 2.2);
        spirit.rotation.y = -2.2;
        scene.add(spirit);
        const sHalo = glowSprite(0xbfe6ff, 3.2, 0);
        sHalo.position.y = 1;
        spirit.add(sHalo);
        const motes = makeParticles(scene, { count: 200, color: 0xbfe6ff, size: 0.25, area: [1, 2, 1], origin: [16, deckY + 1.6, 2.2], velocity: [0, 1.2, 0], spread: [0.8, 0.6, 0.8], life: [1.5, 3.5], swirl: 0.6 });
        motes.state.emit = false;

        const gulls = [];
        for (let i = 0; i < 4; i++) {
            const g = new THREE.Group();
            const m = new THREE.MeshBasicMaterial({ color: 0x3a3430, side: THREE.DoubleSide });
            const wing = new THREE.PlaneGeometry(0.9, 0.18);
            wing.translate(0.45, 0, 0);
            const L = new THREE.Mesh(wing, m);
            const R = new THREE.Mesh(wing, m);
            R.rotation.y = Math.PI;
            g.add(L, R);
            g.userData = { L, R, ph: i * 1.7 };
            scene.add(g);
            gulls.push(g);
        }

        function setSpirit(o) {
            spirit.traverse((m) => {
                if (m.material && m.material !== sHalo.material) m.material.opacity = o * 0.75;
            });
            sHalo.material.opacity = o * 0.45;
        }

        function update(dt, t) {
            ocean.update(dt);
            wake.update(dt);
            motes.update(dt);
            ship.position.y = -0.5 + Math.sin(t * 0.7) * 0.2;
            ship.rotation.x = Math.sin(t * 0.55) * 0.02;
            ship.rotation.z = Math.sin(t * 0.4) * 0.015;
            ship.userData.sails.forEach((s, i) => (s.scale.z = 1.05 + Math.sin(t * 1.1 + i) * 0.06));
            if (ship.userData.flag) ship.userData.flag.rotation.y = Math.sin(t * 3) * 0.3;
            coast.position.x -= dt * 1.2;
            sword.setGlow(new THREE.Color(0xffc35a).lerp(new THREE.Color(0x8ac8ff), 0.5 + Math.sin(t * 0.8) * 0.5), 1.3 + Math.sin(t * 2) * 0.2);
            gulls.forEach((g) => {
                const a = t * 0.3 + g.userData.ph;
                g.position.set(Math.cos(a) * 16 + 6, 18 + Math.sin(t + g.userData.ph) * 1.2, Math.sin(a) * 16);
                g.rotation.y = -a;
                const f = Math.sin(t * 6 + g.userData.ph) * 0.45;
                g.userData.L.rotation.x = f;
                g.userData.R.rotation.x = -f;
            });
        }

        return {
            update,
            camera: { pos: [60, 30, -50], look: [0, 4, 0] },
            beats: [
                { cam: { pos: [34, 12, -26], look: [0, 6, 0], dur: 7 }, say: 'After the battle, the Alliance gives her a title. Not "weapon." Not "wielder." Protector of Boundaries.' },
                { say: 'The four artifacts are reforged into what they were always meant to be. Thorn carries the Root of Stone home to his people. Nari stays on with the Alliance, a diplomat now—though she still argues like a pirate.' },
                {
                    cam: { pos: [14.5, deckY + 2.4, -4.5], look: [12, deckY + 1.6, 1], dur: 4 },
                    do: () => ctx.tween(2.5, (e) => setSpirit(e)),
                    say: 'And at the prow of the Boundary, one last time, a familiar light.',
                },
                { who: 'spirit', say: 'You were never forgettable, Lyra. You only needed to be seen. Now—let an old woman rest.' },
                { who: 'lyra', say: "Thank you, Merina. For seeing what I couldn't see in myself." },
                {
                    do: async () => {
                        motes.state.emit = true;
                        ctx.audio.voice('merina');
                        ctx.audio.bell(523.3);
                        await ctx.tween(3, (e) => setSpirit(1 - e));
                        motes.state.emit = false;
                    },
                    say: 'The light scatters like sea spray into the sun—and is gone.',
                },
                { cam: { pos: [7, deckY + 2.2, -1.6], look: [60, 6, 10], dur: 4 }, say: 'Lyra looks out to sea. Not with longing, the way she used to on the dock at Stillwater. With purpose.' },
                { who: 'lyra', say: 'To boundaries, then. Not as walls, but as places of meeting.' },
                { who: 'kais-gold', say: 'To boundaries. And to those who protect them.' },
                { cam: { pos: [-30, 30, -60], look: [10, 4, 10], dur: 8 }, say: 'Together, the girl from the fishing village and the sword that forgot its name sail on—toward villages waiting to be rebuilt, and a future shaped by balance rather than domination.' },
            ],
        };
    },
};
