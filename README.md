# Three Tokyo

Interactive 3D scene of Glen Fox's *Littlest Tokyo* diorama, rendered with Three.js. Built as a small showpiece: real-time GLB animation, image-based lighting from a procedural sky, and bloom post-processing.

## Stack
- **Three.js** — WebGL renderer, GLTF + DRACO loaders, AnimationMixer, PMREMGenerator, EffectComposer (RenderPass + UnrealBloomPass + OutputPass)
- **TypeScript** + **Vite**
- **lil-gui** for live controls (auto-rotate, exposure, bloom, wireframe)

## Features
- Animated GLB with embedded keyframe clip
- Procedural `Sky` shader baked into a PMREM environment map for IBL
- ACES Filmic tone mapping with adjustable exposure
- Bloom post-processing
- Loading overlay with progress
- Responsive, DPR-capped (max 2) for mobile

## Run locally
```bash
npm install
npm run dev
```

## Credits
- *Littlest Tokyo* model © **Glen Fox**, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
- Three.js — https://threejs.org
