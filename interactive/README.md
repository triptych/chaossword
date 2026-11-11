# The Chaos Sword — Interactive Movie

A scene-by-scene interactive 3D movie of *The Chaos Sword*, built with
vanilla HTML, CSS and JavaScript plus [three.js](https://threejs.org/) (loaded
from a CDN through an import map — no build step, no npm install).

## Running it

ES modules need to be served over HTTP (opening `index.html` straight from the
file system won't work). From the repository root:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000/interactive/>.

## Controls

| Input | Action |
| --- | --- |
| Click / tap, <kbd>Space</kbd>, <kbd>Enter</kbd> | Advance dialogue |
| <kbd>1</kbd>–<kbd>3</kbd> | Pick a choice |
| <kbd>A</kbd> | Toggle autoplay (also auto-solves the interactions) |
| <kbd>M</kbd> | Mute |
| <kbd>Esc</kbd> | Scene menu |

## The ten scenes

| # | Scene | Chapters | Interaction |
| --- | --- | --- | --- |
| 1 | Village Tides | 1 | Ring Merina's wind chimes |
| 2 | Blood and Blade | 2 | Choose: hide, or run for Merina's hut |
| 3 | The Awakening | 3 | Reach for the sword — the blood bond |
| 4 | Unexpected Allies | 4–6 | Hold to form a boundary and catch the falling boy |
| 5 | Dreams of Fire | 8–9 | Touch the echoes of Hakon, Vestra and Thorne |
| 6 | Ritual Betrayal | 11 | Hold on so the bond isn't severed |
| 7 | Adrift | 12–13 | Steer for the oracle's light; answer Kais |
| 8 | Harbor Defense | 14–21 | Mini-game: click incoming fire to raise shields |
| 9 | Balance Restored | 22–23 | Purify the Chalice, Feather and Root |
| 10 | Protector of Boundaries | 24 | Finale |

## Structure

```
interactive/
├── index.html          page shell, import map, overlays
├── style.css           captions, title cards, menus (letterboxed, responsive)
└── js/
    ├── main.js         renderer, bloom, camera rig, act runner, interactions
    ├── ui.js           typewriter captions, choices, prompts, fades
    ├── audio.js        Web Audio synthesis (waves, fire, storm, drones, bells)
    ├── helpers.js      low-poly builders: ocean, sky, ships, figures, sword, artifacts
    └── scenes/         one module per act + index.js (the running order)
```

Each scene module exports `{ title, chapter, ambience, bloom, build(ctx) }`.
`build` populates `ctx.scene` and returns `{ update(dt, t), camera, beats }`.
A beat is a plain object, so adding a moment is just adding a line:

```js
{ cam: { pos: [x, y, z], look: [x, y, z], dur: 3 }, who: 'kais-gold', say: 'To boundaries.' }
{ click: { targets: [mesh], hint: 'Touch it', onHit: async () => {} } }
{ hold:  { hint: 'Hold on', duration: 3, onProgress: (p) => {} } }
{ prompt: 'What does Lyra do?', choice: [{ label: '…', then: [/* beats */] }] }
{ game: (ctx, signal) => promise }
```

All sound is generated in code, so there are no audio files to download.
