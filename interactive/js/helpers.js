// Shared low-poly builders used by every scene.
import * as THREE from 'three';

// ------------------------------------------------------------------ random

export function rng(seed = 1) {
    let a = seed >>> 0;
    return function () {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export const lerp = (a, b, t) => a + (b - a) * t;
export const clamp01 = (v) => Math.min(1, Math.max(0, v));
export const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// ---------------------------------------------------------------- textures

let _glowTex = null;
export function glowTexture() {
    if (_glowTex) return _glowTex;
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d');
    const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, 'rgba(255,255,255,1)');
    grd.addColorStop(0.2, 'rgba(255,255,255,0.75)');
    grd.addColorStop(0.5, 'rgba(255,255,255,0.18)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 128);
    _glowTex = new THREE.CanvasTexture(c);
    _glowTex.colorSpace = THREE.SRGBColorSpace;
    _glowTex.userData.shared = true;
    return _glowTex;
}

function canvasTexture(w, h, draw) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
}

export function plankTexture(base = '#4a2f1d', repeat = 1) {
    const t = canvasTexture(256, 256, (g, w, h) => {
        g.fillStyle = base;
        g.fillRect(0, 0, w, h);
        const r = rng(7);
        for (let y = 0; y < h; y += 32) {
            g.fillStyle = `rgba(0,0,0,${0.15 + r() * 0.2})`;
            g.fillRect(0, y, w, 2);
            for (let i = 0; i < 30; i++) {
                g.fillStyle = `rgba(${r() > 0.5 ? '255,220,180' : '0,0,0'},${r() * 0.06})`;
                g.fillRect(r() * w, y + r() * 30, 20 + r() * 80, 1);
            }
            g.fillStyle = 'rgba(0,0,0,0.3)';
            g.fillRect(r() * w, y, 2, 32);
        }
    });
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat, repeat);
    return t;
}

function flameTexture() {
    return canvasTexture(64, 512, (g, w, h) => {
        g.fillStyle = '#000';
        g.fillRect(0, 0, w, h);
        g.lineCap = 'round';
        // central fuller
        g.strokeStyle = 'rgba(255,255,255,0.55)';
        g.lineWidth = 3;
        g.beginPath();
        g.moveTo(w / 2, h);
        g.lineTo(w / 2, h * 0.12);
        g.stroke();
        // flowing flame tracery
        for (let k = 0; k < 4; k++) {
            g.strokeStyle = `rgba(255,255,255,${0.9 - k * 0.15})`;
            g.lineWidth = 2;
            g.beginPath();
            for (let y = h; y > h * 0.1; y -= 4) {
                const x = w / 2 + Math.sin(y * 0.045 + k * 1.7) * (8 + k * 4) * (y / h);
                if (y === h) g.moveTo(x, y);
                else g.lineTo(x, y);
            }
            g.stroke();
        }
    });
}

function runeTexture(seed = 3) {
    return canvasTexture(1024, 1024, (g, w) => {
        const c = w / 2;
        const r = rng(seed);
        g.clearRect(0, 0, w, w);
        g.strokeStyle = '#fff';
        g.fillStyle = '#fff';
        g.translate(c, c);
        const ring = (rad, lw) => {
            g.lineWidth = lw;
            g.beginPath();
            g.arc(0, 0, rad, 0, Math.PI * 2);
            g.stroke();
        };
        ring(500, 6);
        ring(470, 2);
        ring(330, 4);
        ring(180, 3);
        // runic ticks between outer rings
        for (let i = 0; i < 72; i++) {
            g.save();
            g.rotate((i / 72) * Math.PI * 2);
            g.lineWidth = 3;
            g.beginPath();
            const len = 10 + r() * 14;
            g.moveTo(0, -478);
            g.lineTo(0, -478 + len);
            if (r() > 0.5) {
                g.moveTo(-6, -470);
                g.lineTo(6, -462);
            }
            g.stroke();
            g.restore();
        }
        // two interlocked squares = 8 point star
        g.lineWidth = 4;
        for (let s = 0; s < 2; s++) {
            g.save();
            g.rotate(s * Math.PI / 4);
            g.strokeRect(-330 / Math.SQRT2, -330 / Math.SQRT2, 660 / Math.SQRT2, 660 / Math.SQRT2);
            g.restore();
        }
        // triangle
        g.beginPath();
        for (let i = 0; i <= 3; i++) {
            const a = (i / 3) * Math.PI * 2 - Math.PI / 2;
            g.lineTo(Math.cos(a) * 330, Math.sin(a) * 330);
        }
        g.stroke();
        // nodes
        for (let i = 0; i < 4; i++) {
            const a = (i / 4) * Math.PI * 2 - Math.PI / 2;
            g.beginPath();
            g.arc(Math.cos(a) * 400, Math.sin(a) * 400, 40, 0, Math.PI * 2);
            g.stroke();
        }
    });
}

function netTexture() {
    const t = canvasTexture(128, 128, (g, w, h) => {
        g.clearRect(0, 0, w, h);
        g.strokeStyle = 'rgba(210,190,150,0.9)';
        g.lineWidth = 2;
        for (let i = -w; i < w * 2; i += 16) {
            g.beginPath();
            g.moveTo(i, 0);
            g.lineTo(i + h, h);
            g.moveTo(i, h);
            g.lineTo(i + h, 0);
            g.stroke();
        }
    });
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(4, 2);
    return t;
}

// -------------------------------------------------------------- environment

export function makeSky(scene, { top = '#1b2a55', mid = '#e79a5a', bottom = '#1a2030', exponent = 0.55 } = {}) {
    const uniforms = {
        top: { value: new THREE.Color(top) },
        mid: { value: new THREE.Color(mid) },
        bottom: { value: new THREE.Color(bottom) },
        exponent: { value: exponent },
    };
    const mat = new THREE.ShaderMaterial({
        uniforms,
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        vertexShader: /* glsl */ `
            varying vec3 vP;
            void main() {
                vP = normalize(position);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }`,
        fragmentShader: /* glsl */ `
            uniform vec3 top; uniform vec3 mid; uniform vec3 bottom; uniform float exponent;
            varying vec3 vP;
            void main() {
                float h = vP.y;
                vec3 c = h > 0.0
                    ? mix(mid, top, pow(clamp(h, 0.0, 1.0), exponent))
                    : mix(mid, bottom, pow(clamp(-h * 4.0, 0.0, 1.0), 0.5));
                gl_FragColor = vec4(c, 1.0);
                #include <colorspace_fragment>
            }`,
    });
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(1500, 32, 16), mat);
    mesh.renderOrder = -10;
    scene.add(mesh);
    scene.userData.sky = mesh;
    const tmp = { top: new THREE.Color(), mid: new THREE.Color(), bottom: new THREE.Color() };
    return {
        mesh,
        uniforms,
        /** Blend toward another palette (t: 0..1) */
        blend(from, to, t) {
            for (const k of ['top', 'mid', 'bottom']) {
                tmp[k].set(from[k]).lerp(new THREE.Color(to[k]), t);
                uniforms[k].value.copy(tmp[k]);
            }
        },
    };
}

export function makeOcean(scene, { color = 0x2f5d7a, size = 900, seg = 140, amp = 0.5, emissive = 0x000000, roughness = 0.3, metalness = 0.15, y = 0 } = {}) {
    const geo = new THREE.PlaneGeometry(size, size, seg, seg);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    const base = Float32Array.from(pos.array);
    const mat = new THREE.MeshStandardMaterial({ color, roughness, metalness, flatShading: true, emissive });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = y;
    scene.add(mesh);
    const state = { amp, speed: 1, time: 0 };

    const h = (x, z, t) =>
        Math.sin(x * 0.08 + t * 0.9) * 0.6 +
        Math.sin(z * 0.11 - t * 1.1 + x * 0.03) * 0.5 +
        Math.sin((x + z) * 0.21 + t * 1.7) * 0.22;

    return {
        mesh,
        mat,
        state,
        heightAt(x, z) {
            return h(x, z, state.time) * state.amp + y;
        },
        update(dt) {
            state.time += dt * state.speed;
            const a = state.amp;
            const t = state.time;
            const arr = pos.array;
            for (let i = 0; i < arr.length; i += 3) arr[i + 1] = h(base[i], base[i + 2], t) * a;
            pos.needsUpdate = true;
        },
    };
}

export function makeStars(scene, { count = 1500, radius = 1200, size = 2.2, opacity = 1 } = {}) {
    const r = rng(42);
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        const u = r() * Math.PI * 2;
        const v = Math.acos(r() * 0.95);
        p[i * 3] = Math.sin(v) * Math.cos(u) * radius;
        p[i * 3 + 1] = Math.cos(v) * radius;
        p[i * 3 + 2] = Math.sin(v) * Math.sin(u) * radius;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(p, 3));
    const mat = new THREE.PointsMaterial({ color: 0xffffff, size, sizeAttenuation: false, transparent: true, opacity, depthWrite: false, fog: false });
    const pts = new THREE.Points(geo, mat);
    scene.add(pts);
    return pts;
}

export function glowSprite(color = 0xffaa55, size = 2, opacity = 1) {
    const mat = new THREE.SpriteMaterial({
        map: glowTexture(),
        color,
        transparent: true,
        opacity,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        fog: false,
    });
    const s = new THREE.Sprite(mat);
    s.scale.set(size, size, 1);
    return s;
}

/**
 * Additive particle system (embers, sparks, rain, motes).
 * Particles fade by tinting their vertex colour toward black.
 */
export function makeParticles(scene, {
    count = 200,
    color = 0xff7a30,
    size = 0.3,
    area = [10, 1, 10],
    origin = [0, 0, 0],
    velocity = [0, 2, 0],
    spread = [0.6, 0.6, 0.6],
    life = [1, 3],
    gravity = 0,
    swirl = 0,
    additive = true,
    prewarm = true,
} = {}) {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    const age = new Float32Array(count);
    const lifeArr = new Float32Array(count);
    const base = new THREE.Color(color);
    const state = { origin: new THREE.Vector3(...origin), area: [...area], emit: true, intensity: 1 };

    const reset = (i) => {
        pos[i * 3] = state.origin.x + (Math.random() - 0.5) * state.area[0];
        pos[i * 3 + 1] = state.origin.y + (Math.random() - 0.5) * state.area[1];
        pos[i * 3 + 2] = state.origin.z + (Math.random() - 0.5) * state.area[2];
        vel[i * 3] = velocity[0] + (Math.random() - 0.5) * 2 * spread[0];
        vel[i * 3 + 1] = velocity[1] + (Math.random() - 0.5) * 2 * spread[1];
        vel[i * 3 + 2] = velocity[2] + (Math.random() - 0.5) * 2 * spread[2];
        age[i] = 0;
        lifeArr[i] = life[0] + Math.random() * (life[1] - life[0]);
    };
    for (let i = 0; i < count; i++) {
        reset(i);
        if (prewarm) age[i] = Math.random() * lifeArr[i];
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const mat = new THREE.PointsMaterial({
        size,
        map: glowTexture(),
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    });
    const points = new THREE.Points(geo, mat);
    points.frustumCulled = false;
    scene.add(points);

    let t = 0;
    return {
        points,
        state,
        setColor(c) {
            base.set(c);
        },
        update(dt) {
            t += dt;
            for (let i = 0; i < count; i++) {
                age[i] += dt;
                if (age[i] > lifeArr[i]) {
                    if (state.emit) reset(i);
                    else {
                        col[i * 3] = col[i * 3 + 1] = col[i * 3 + 2] = 0;
                        continue;
                    }
                }
                vel[i * 3 + 1] -= gravity * dt;
                let vx = vel[i * 3];
                let vz = vel[i * 3 + 2];
                if (swirl) {
                    vx += Math.sin(t * 1.3 + i) * swirl;
                    vz += Math.cos(t * 1.1 + i * 0.7) * swirl;
                }
                pos[i * 3] += vx * dt;
                pos[i * 3 + 1] += vel[i * 3 + 1] * dt;
                pos[i * 3 + 2] += vz * dt;
                const k = age[i] / lifeArr[i];
                const f = Math.min(1, k * 6) * (1 - k) * state.intensity;
                col[i * 3] = base.r * f;
                col[i * 3 + 1] = base.g * f;
                col[i * 3 + 2] = base.b * f;
            }
            geo.attributes.position.needsUpdate = true;
            geo.attributes.color.needsUpdate = true;
        },
    };
}

// ------------------------------------------------------------------ people

/**
 * A stylised low-poly person. Height ~1.7 units.
 */
export function makeFigure({
    color = 0x46607a,
    skin = 0xd9a77c,
    hair = 0x2a1a10,
    height = 1.7,
    emissive = 0x000000,
    emissiveIntensity = 0,
    opacity = 1,
    hairLong = false,
    streak = false,
    sash = null,
    braids = false,
} = {}) {
    const g = new THREE.Group();
    const s = height / 1.7;
    const mat = (c) =>
        new THREE.MeshStandardMaterial({
            color: c,
            roughness: 0.8,
            flatShading: true,
            emissive,
            emissiveIntensity,
            transparent: opacity < 1,
            opacity,
            depthWrite: opacity >= 1,
        });

    const robe = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.32, 1.05, 8), mat(color));
    robe.position.y = 0.53;
    const chest = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.17, 0.42, 8), mat(color));
    chest.position.y = 1.25;
    const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.13, 1), mat(skin));
    head.position.y = 1.58;
    const hairM = new THREE.Mesh(new THREE.SphereGeometry(0.145, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.6), mat(hair));
    hairM.position.y = 1.6;
    hairM.rotation.x = -0.25;
    g.add(robe, chest, head, hairM);
    if (hairLong) {
        const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.05, 0.42, 6), mat(hair));
        tail.position.set(0, 1.38, -0.1);
        g.add(tail);
    }
    if (braids) {
        for (const x of [-0.09, 0.09]) {
            const b = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.02, 0.6, 5), mat(hair));
            b.position.set(x, 1.3, -0.08);
            g.add(b);
        }
    }
    if (streak) {
        const st = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.03, 0.22), mat(0xf4f4f4));
        st.position.set(0.05, 1.735, 0.0);
        g.add(st);
    }
    if (sash) {
        const sh = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.03, 4, 10), mat(sash));
        sh.rotation.x = Math.PI / 2;
        sh.position.y = 1.06;
        g.add(sh);
    }
    const armGeo = new THREE.CylinderGeometry(0.05, 0.045, 0.62, 6);
    armGeo.translate(0, -0.31, 0);
    const armL = new THREE.Mesh(armGeo, mat(color));
    const armR = new THREE.Mesh(armGeo, mat(color));
    armL.position.set(-0.24, 1.42, 0);
    armR.position.set(0.24, 1.42, 0);
    armL.rotation.z = 0.12;
    armR.rotation.z = -0.12;
    g.add(armL, armR);
    g.scale.setScalar(s);
    g.userData.parts = { head, robe, chest, armL, armR, hair: hairM };
    return g;
}

// ------------------------------------------------------------------- props

/**
 * The Chaos Sword. Blade points +Y from the guard at the origin.
 */
export function makeSword({ length = 1.1, glow = 0xff3a1a, glowIntensity = 0.8, light = true } = {}) {
    const g = new THREE.Group();
    const bladeGeo = new THREE.BoxGeometry(0.09, length, 0.016, 1, 12, 1);
    const p = bladeGeo.attributes.position;
    const tip = length * 0.16;
    for (let i = 0; i < p.count; i++) {
        const y = p.getY(i) + length / 2;
        if (y > length - tip) {
            const k = 1 - (y - (length - tip)) / tip;
            p.setX(i, p.getX(i) * Math.max(0.02, k));
        }
    }
    bladeGeo.translate(0, length / 2, 0);
    bladeGeo.computeVertexNormals();
    const bladeMat = new THREE.MeshStandardMaterial({
        color: 0xa7adb5,
        metalness: 0.95,
        roughness: 0.25,
        emissive: new THREE.Color(glow),
        emissiveIntensity: glowIntensity,
        emissiveMap: flameTexture(),
    });
    const blade = new THREE.Mesh(bladeGeo, bladeMat);
    const iron = new THREE.MeshStandardMaterial({ color: 0x2d2a2a, metalness: 0.8, roughness: 0.4 });
    const goldM = new THREE.MeshStandardMaterial({ color: 0xb08d3a, metalness: 0.9, roughness: 0.35 });
    const guard = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.045, 0.06), iron);
    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.03), new THREE.MeshStandardMaterial({ color: 0x400000, emissive: new THREE.Color(glow), emissiveIntensity: 1.5 }));
    gem.position.z = 0.035;
    const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.024, 0.24, 8), new THREE.MeshStandardMaterial({ color: 0x3b2418, roughness: 0.9 }));
    grip.position.y = -0.14;
    const pommel = new THREE.Mesh(new THREE.IcosahedronGeometry(0.042, 0), goldM);
    pommel.position.y = -0.28;
    g.add(blade, guard, gem, grip, pommel);
    let pl = null;
    if (light) {
        pl = new THREE.PointLight(glow, 4 * glowIntensity, 6, 2);
        pl.position.y = length * 0.5;
        g.add(pl);
    }
    const c = new THREE.Color();
    return {
        group: g,
        blade,
        light: pl,
        setGlow(color, intensity) {
            c.set(color);
            bladeMat.emissive.copy(c);
            bladeMat.emissiveIntensity = intensity;
            gem.material.emissive.copy(c);
            if (pl) {
                pl.color.copy(c);
                pl.intensity = 4 * intensity;
            }
        },
    };
}

export function makeHut(r, { wall = 0x6b4a32, roof = 0x9a8048, windowGlow = 0xffb060, glow = 1 } = {}) {
    const g = new THREE.Group();
    const w = 3 + r() * 1.6;
    const d = 2.6 + r() * 1.2;
    const h = 2 + r() * 0.6;
    const walls = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color: wall, roughness: 0.95, flatShading: true }));
    walls.position.y = h / 2;
    const roofM = new THREE.Mesh(new THREE.ConeGeometry(1, 1.9, 4), new THREE.MeshStandardMaterial({ color: roof, roughness: 1, flatShading: true }));
    roofM.rotation.y = Math.PI / 4;
    roofM.scale.set(w * 0.82, 1, d * 0.82);
    roofM.position.y = h + 0.9;
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.3, 0.05), new THREE.MeshStandardMaterial({ color: 0x24160d }));
    door.position.set(-w * 0.2, 0.65, d / 2 + 0.02);
    const win = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 0.05), new THREE.MeshStandardMaterial({ color: 0x000000, emissive: windowGlow, emissiveIntensity: glow }));
    win.position.set(w * 0.22, h * 0.6, d / 2 + 0.02);
    g.add(walls, roofM, door, win);
    g.userData = { w, d, h, roof: roofM, walls, win };
    return g;
}

function taperedHull(L, H, W, color) {
    const geo = new THREE.BoxGeometry(L, H, W, 8, 2, 2);
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
        const x = p.getX(i) / (L / 2); // -1 stern .. 1 bow
        const y = p.getY(i) / (H / 2); // -1 keel .. 1 deck
        let z = p.getZ(i);
        // narrower toward the keel
        z *= y < 0 ? 0.35 : 1;
        // pointed bow, slightly narrowed stern
        if (x > 0.35) z *= Math.max(0.03, 1 - (x - 0.35) / 0.65);
        if (x < -0.8) z *= 0.85;
        // sheer: bow and stern rise
        const rise = Math.pow(Math.abs(x), 3) * H * 0.35;
        p.setY(i, p.getY(i) + (y > 0 ? rise : rise * 0.4));
        // bow rakes forward at deck level
        if (x > 0.6 && y > 0) p.setX(i, p.getX(i) + H * 0.35 * (x - 0.6));
        p.setZ(i, z);
    }
    geo.computeVertexNormals();
    return new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, roughness: 0.85, flatShading: true }));
}

/**
 * Sailing ship along +X (bow). Deck at y ≈ hullHeight * 0.5.
 */
export function makeShip({ length = 16, hull = 0x2b1a12, sail = 0xe8dcc0, sailOpacity = 1, masts = 2, lanterns = 2, lanternColor = 0xffa040, flag = 0x8a1020, emissiveSail = 0 } = {}) {
    const g = new THREE.Group();
    const H = length * 0.2;
    const W = length * 0.26;
    const hullM = taperedHull(length, H, W, hull);
    g.add(hullM);
    const deckY = H / 2;
    const deck = new THREE.Mesh(new THREE.BoxGeometry(length * 0.8, 0.12, W * 0.85), new THREE.MeshStandardMaterial({ color: 0x5c3f28, roughness: 0.9, map: plankTexture('#5c3f28', 2) }));
    deck.position.set(-length * 0.06, deckY - 0.05, 0);
    g.add(deck);
    // stern castle
    const castle = new THREE.Mesh(new THREE.BoxGeometry(length * 0.2, H * 0.55, W * 0.82), new THREE.MeshStandardMaterial({ color: hull, roughness: 0.85, flatShading: true }));
    castle.position.set(-length * 0.38, deckY + H * 0.27, 0);
    g.add(castle);

    const mastMat = new THREE.MeshStandardMaterial({ color: 0x3a2618, roughness: 0.9 });
    const sailMat = new THREE.MeshStandardMaterial({
        color: sail,
        roughness: 0.95,
        side: THREE.DoubleSide,
        transparent: sailOpacity < 1,
        opacity: sailOpacity,
        emissive: sail,
        emissiveIntensity: emissiveSail,
        flatShading: true,
    });
    const sails = [];
    const mastXs = masts === 1 ? [0.05] : masts === 2 ? [-0.12, 0.2] : [-0.22, 0.04, 0.26];
    mastXs.forEach((mx, i) => {
        const mh = length * (i === 1 && masts === 3 ? 0.95 : 0.8);
        const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, mh, 6), mastMat);
        mast.position.set(mx * length, deckY + mh / 2, 0);
        g.add(mast);
        for (let k = 0; k < 2; k++) {
            const sw = W * (1.5 - k * 0.35);
            const sh = mh * 0.32;
            const sg = new THREE.PlaneGeometry(sw, sh, 4, 3);
            const sp = sg.attributes.position;
            for (let j = 0; j < sp.count; j++) {
                const u = sp.getX(j) / (sw / 2);
                const v = sp.getY(j) / (sh / 2);
                sp.setZ(j, (1 - u * u) * 0.5 + (1 - v * v) * 0.2);
            }
            sg.computeVertexNormals();
            const s = new THREE.Mesh(sg, sailMat);
            s.rotation.y = Math.PI / 2;
            s.position.set(mx * length + 0.25, deckY + mh * (0.38 + k * 0.36), 0);
            g.add(s);
            sails.push(s);
            const yard = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, sw * 1.05, 5), mastMat);
            yard.rotation.x = Math.PI / 2;
            yard.position.set(mx * length + 0.2, s.position.y + sh / 2, 0);
            g.add(yard);
        }
        if (flag && i === mastXs.length - 1) {
            const f = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.8), new THREE.MeshStandardMaterial({ color: flag, side: THREE.DoubleSide, emissive: flag, emissiveIntensity: 0.2 }));
            f.position.set(mx * length - 0.7, deckY + mh + 0.3, 0);
            g.add(f);
            g.userData.flag = f;
        }
    });
    // bowsprit
    const bs = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, length * 0.3, 5), mastMat);
    bs.rotation.z = -Math.PI / 2 + 0.35;
    bs.position.set(length * 0.58, deckY + H * 0.35, 0);
    g.add(bs);

    const lights = [];
    for (let i = 0; i < lanterns; i++) {
        const sp = glowSprite(lanternColor, 2.2);
        sp.position.set(-length * 0.45 + i * length * 0.5, deckY + H * 0.8, (i % 2 ? 1 : -1) * W * 0.4);
        g.add(sp);
        lights.push(sp);
    }
    g.userData.sails = sails;
    g.userData.deckY = deckY;
    g.userData.lanterns = lights;
    g.userData.length = length;
    return g;
}

export function makeBoat({ length = 4.5, color = 0x5a3b24 } = {}) {
    const g = new THREE.Group();
    const hull = taperedHull(length, 0.8, 1.6, color);
    g.add(hull);
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.08, 1.2), new THREE.MeshStandardMaterial({ color: 0x7a5636 }));
    seat.position.set(0, 0.3, 0);
    g.add(seat);
    return g;
}

export function makeRuneCircle(radius = 6, color = 0xff3030, opacity = 0.9, seed = 3) {
    const tex = runeTexture(seed);
    const mat = new THREE.MeshBasicMaterial({
        map: tex,
        color,
        transparent: true,
        opacity,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
    });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(radius * 2, radius * 2), mat);
    m.rotation.x = -Math.PI / 2;
    return m;
}

export function makeNetRack() {
    const g = new THREE.Group();
    const post = new THREE.MeshStandardMaterial({ color: 0x4a3322, roughness: 1 });
    for (const x of [-2, 2]) {
        const p = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 2.2, 5), post);
        p.position.set(x, 1.1, 0);
        g.add(p);
    }
    const net = new THREE.Mesh(
        new THREE.PlaneGeometry(4, 1.8, 6, 3),
        new THREE.MeshStandardMaterial({ map: netTexture(), transparent: true, side: THREE.DoubleSide, alphaTest: 0.3, roughness: 1 })
    );
    const np = net.geometry.attributes.position;
    for (let i = 0; i < np.count; i++) np.setZ(i, Math.sin((np.getX(i) / 2 + 1) * Math.PI) * 0.15);
    net.position.y = 1.2;
    g.add(net);
    return g;
}

export function makeTree(r, { trunk = 0x5a4030, leaf = 0x2f6a3a } = {}) {
    const g = new THREE.Group();
    const h = 3 + r() * 2;
    const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.4, h * 0.5, 0), new THREE.Vector3(0.9, h, 0.1));
    const t = new THREE.Mesh(new THREE.TubeGeometry(curve, 6, 0.13, 5), new THREE.MeshStandardMaterial({ color: trunk, roughness: 1, flatShading: true }));
    g.add(t);
    const lm = new THREE.MeshStandardMaterial({ color: leaf, roughness: 0.9, flatShading: true, side: THREE.DoubleSide });
    for (let i = 0; i < 6; i++) {
        const leafG = new THREE.ConeGeometry(0.35, 2.2, 3);
        leafG.translate(0, 1.1, 0);
        const l = new THREE.Mesh(leafG, lm);
        l.position.set(0.9, h, 0.1);
        l.rotation.set(Math.PI / 2 - 0.5, (i / 6) * Math.PI * 2, 0, 'YXZ');
        l.scale.set(1, 1, 0.25);
        g.add(l);
    }
    g.rotation.y = r() * Math.PI * 2;
    return g;
}

export function makeRock(r, size = 1, color = 0x56514c) {
    const geo = new THREE.IcosahedronGeometry(size, 0);
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
        p.setXYZ(i, p.getX(i) * (0.8 + r() * 0.4), p.getY(i) * (0.6 + r() * 0.4), p.getZ(i) * (0.8 + r() * 0.4));
    }
    geo.computeVertexNormals();
    return new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, roughness: 1, flatShading: true }));
}

// --------------------------------------------------------------- artifacts

export const ARTIFACT_COLORS = {
    chalice: 0x4aa8ff,
    feather: 0xfff1b8,
    root: 0x7ccf5a,
    sword: 0xffc35a,
};

export function makeArtifact(kind) {
    const g = new THREE.Group();
    const color = ARTIFACT_COLORS[kind];
    let mat;
    if (kind === 'chalice') {
        const pts = [
            [0.0, 0], [0.32, 0], [0.34, 0.05], [0.1, 0.12], [0.06, 0.5], [0.1, 0.56],
            [0.3, 0.68], [0.38, 0.95], [0.36, 1.0], [0.3, 0.75], [0.0, 0.62],
        ].map(([x, y]) => new THREE.Vector2(x, y));
        mat = new THREE.MeshStandardMaterial({ color: 0xc8d0dc, metalness: 0.95, roughness: 0.2, emissive: color, emissiveIntensity: 0.4 });
        const m = new THREE.Mesh(new THREE.LatheGeometry(pts, 16), mat);
        m.position.y = -0.5;
        g.add(m);
        for (let i = 0; i < 6; i++) {
            const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.04), new THREE.MeshStandardMaterial({ color: 0x103060, emissive: color, emissiveIntensity: 2 }));
            const a = (i / 6) * Math.PI * 2;
            gem.position.set(Math.cos(a) * 0.33, 0.33, Math.sin(a) * 0.33);
            g.add(gem);
        }
    } else if (kind === 'feather') {
        const s = new THREE.Shape();
        s.moveTo(0, -0.7);
        s.quadraticCurveTo(0.22, -0.1, 0.12, 0.45);
        s.quadraticCurveTo(0.05, 0.7, 0, 0.75);
        s.quadraticCurveTo(-0.14, 0.3, -0.1, -0.2);
        s.quadraticCurveTo(-0.05, -0.5, 0, -0.7);
        mat = new THREE.MeshStandardMaterial({ color: 0xe8dcb0, metalness: 0.9, roughness: 0.25, emissive: color, emissiveIntensity: 0.4, side: THREE.DoubleSide });
        const m = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.02, bevelEnabled: true, bevelSize: 0.01, bevelThickness: 0.01, bevelSegments: 1 }), mat);
        m.rotation.z = 0.35;
        g.add(m);
        const quill = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.5, 4), mat);
        quill.rotation.z = 0.35;
        g.add(quill);
    } else if (kind === 'root') {
        const pts = [];
        for (let i = 0; i <= 10; i++) {
            const y = -0.8 + i * 0.16;
            pts.push(new THREE.Vector3(Math.sin(i * 1.3) * 0.12, y, Math.cos(i * 1.1) * 0.12));
        }
        mat = new THREE.MeshStandardMaterial({ color: 0x5a4330, roughness: 0.9, flatShading: true, emissive: color, emissiveIntensity: 0.15 });
        const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 30, 0.07, 5), mat);
        g.add(m);
        for (let i = 0; i < 5; i++) {
            const st = new THREE.Mesh(new THREE.IcosahedronGeometry(0.06 + Math.random() * 0.03, 0), new THREE.MeshStandardMaterial({ color: 0x203018, emissive: color, emissiveIntensity: 1.6, flatShading: true }));
            const p = pts[2 + i * 2];
            st.position.copy(p).add(new THREE.Vector3(0.06, 0, 0.04));
            g.add(st);
        }
    } else {
        const sw = makeSword({ glow: color, glowIntensity: 1.2, light: false });
        sw.group.position.y = -0.5;
        sw.group.scale.setScalar(1.1);
        g.add(sw.group);
        g.userData.sword = sw;
    }
    const halo = glowSprite(color, 2.6, 0.7);
    g.add(halo);
    g.userData.halo = halo;
    g.userData.color = color;
    g.userData.mat = mat;
    return g;
}

// -------------------------------------------------------------- dispose

export function disposeScene(scene) {
    scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        const mats = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
        for (const m of mats) {
            for (const k of ['map', 'emissiveMap', 'alphaMap']) {
                if (m[k] && !m[k].userData.shared) m[k].dispose();
            }
            m.dispose();
        }
    });
}
