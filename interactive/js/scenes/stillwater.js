// Shared set: the fishing village of Stillwater (Acts 1 & 2).
import * as THREE from 'three';
import { rng, makeHut, makeNetRack, makeFigure, makeRock, plankTexture } from '../helpers.js';

export const HUT_SPOTS = [
    [-22, 24, 0.3], [-13, 30, -0.2], [-4, 26, 0.1], [9, 29, -0.35], [18, 23, 0.2], [27, 30, -0.1], [-30, 31, 0.4], [3, 36, 0],
];
export const MERINA_HUT = [-15, 17, 0.5];

export function buildStillwater(scene, { night = false } = {}) {
    const r = rng(11);

    // beach + land
    const sand = new THREE.Mesh(
        new THREE.BoxGeometry(900, 4, 90, 90, 1, 12),
        new THREE.MeshStandardMaterial({ color: night ? 0x3a3026 : 0xcdb38a, roughness: 1, flatShading: true })
    );
    const sp = sand.geometry.attributes.position;
    for (let i = 0; i < sp.count; i++) {
        if (sp.getY(i) > 0) sp.setY(i, sp.getY(i) + Math.max(0, (sp.getZ(i) + 45) / 90) * 4 + r() * 0.3);
    }
    sand.geometry.computeVertexNormals();
    sand.position.set(0, -1.6, 55);
    scene.add(sand);

    const grass = new THREE.Mesh(
        new THREE.BoxGeometry(900, 2, 60, 60, 1, 6),
        new THREE.MeshStandardMaterial({ color: night ? 0x1d261a : 0x6d7f45, roughness: 1, flatShading: true })
    );
    grass.position.set(0, 1.9, 86);
    scene.add(grass);
    // rolling hills behind the village
    const hillMat = new THREE.MeshStandardMaterial({ color: night ? 0x141a12 : 0x5d6e3c, roughness: 1, flatShading: true });
    for (let i = 0; i < 14; i++) {
        const hill = new THREE.Mesh(new THREE.SphereGeometry(1, 9, 6), hillMat);
        hill.scale.set(40 + r() * 50, 14 + r() * 22, 30 + r() * 20);
        hill.position.set(-420 + i * 65 + r() * 20, -2, 120 + r() * 40);
        scene.add(hill);
    }

    // huts
    const huts = HUT_SPOTS.map(([x, z, ry]) => {
        const h = makeHut(r, { glow: night ? 0 : 1.2 });
        h.position.set(x, 0.4 + (z - 10) * 0.044, z);
        h.rotation.y = ry + Math.PI;
        scene.add(h);
        return h;
    });

    // Merina's hut — smaller, with herbs and wind chimes
    const merina = makeHut(r, { wall: 0x5a4a3a, roof: 0x6f7a48, glow: night ? 0 : 1.6, windowGlow: 0x9fd0ff });
    merina.position.set(MERINA_HUT[0], 0.4 + (MERINA_HUT[1] - 10) * 0.044, MERINA_HUT[1]);
    merina.rotation.y = MERINA_HUT[2] + Math.PI;
    merina.scale.setScalar(0.85);
    scene.add(merina);

    const chimes = new THREE.Group();
    const chimeMat = new THREE.MeshStandardMaterial({ color: 0xd9c9a0, metalness: 0.8, roughness: 0.25, emissive: 0x6a5530, emissiveIntensity: 0.3 });
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.1, 5), chimeMat);
    bar.rotation.z = Math.PI / 2;
    chimes.add(bar);
    const rods = [];
    for (let i = 0; i < 6; i++) {
        const len = 0.5 + (i % 3) * 0.15 + r() * 0.1;
        const geo = new THREE.CylinderGeometry(0.022, 0.022, len, 6);
        geo.translate(0, -len / 2 - 0.05, 0);
        const rod = new THREE.Mesh(geo, chimeMat);
        rod.position.x = -0.5 + i * 0.2;
        chimes.add(rod);
        rods.push(rod);
    }
    // hang under the eave, in front of the door
    chimes.position.set(-0.6, 2.45, merina.userData.d / 2 + 0.55);
    merina.add(chimes);
    chimes.userData.rods = rods;
    chimes.userData.markerOffset = new THREE.Vector3(0, -0.35, 0);
    // big invisible hit box makes the chimes easy to click
    const hit = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.4, 0.8), new THREE.MeshBasicMaterial({ visible: false }));
    hit.position.y = -0.4;
    chimes.add(hit);

    // dock
    const dock = new THREE.Group();
    const plank = new THREE.Mesh(new THREE.BoxGeometry(3, 0.25, 26), new THREE.MeshStandardMaterial({ map: plankTexture('#6a4a30', 3), roughness: 0.95 }));
    plank.position.set(0, 1.1, 0);
    dock.add(plank);
    const postMat = new THREE.MeshStandardMaterial({ color: 0x3b2a1c, roughness: 1 });
    for (let z = -12; z <= 12; z += 4) {
        for (const x of [-1.4, 1.4]) {
            const p = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.18, 4, 6), postMat);
            p.position.set(x, -0.6, z);
            dock.add(p);
        }
    }
    dock.position.set(5, 0, 2);
    scene.add(dock);

    // nets drying
    const nets = [];
    [[-6, 15, 0.2], [12, 16, -0.4], [-26, 17, 0.6]].forEach(([x, z, ry]) => {
        const n = makeNetRack();
        n.position.set(x, 0.5, z);
        n.rotation.y = ry;
        scene.add(n);
        nets.push(n);
    });

    // rocks along the shore
    for (let i = 0; i < 18; i++) {
        const rk = makeRock(r, 0.6 + r() * 1.6, night ? 0x2a2622 : 0x6e665c);
        rk.position.set(-60 + r() * 120, 0, 9 + r() * 4);
        if (Math.abs(rk.position.x - 5) < 4) rk.position.x += 8;
        scene.add(rk);
    }

    // boats pulled up on the sand
    const boatMat = new THREE.MeshStandardMaterial({ color: 0x5b3c25, roughness: 0.9, flatShading: true });
    for (const [x, z, ry] of [[-16, 12, 1.2], [20, 13, 1.8], [-36, 13, 1.4]]) {
        const b = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.5, 4, 6, 1, true, 0, Math.PI), boatMat);
        b.material.side = THREE.DoubleSide;
        b.rotation.set(Math.PI / 2, ry, Math.PI);
        b.position.set(x, 0.9, z);
        scene.add(b);
    }

    // Lyra at the end of the dock
    const lyra = makeFigure({ color: 0x3f5c7a, hair: 0x3a2416, hairLong: true, sash: 0x8a6a3a });
    lyra.position.set(5, 1.23, -8);
    lyra.rotation.y = Math.PI;
    scene.add(lyra);

    return { huts, merina, chimes, dock, nets, lyra };
}

export function animateChimes(chimes, t, strength = 1) {
    chimes.userData.rods.forEach((rod, i) => {
        rod.rotation.z = Math.sin(t * 2.2 + i * 1.3) * 0.12 * strength;
        rod.rotation.x = Math.cos(t * 1.7 + i) * 0.08 * strength;
    });
}
