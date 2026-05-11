import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import type { SceneDef } from './types';

export const soldierScene: SceneDef = {
  id: 'soldier',
  label: 'Soldier',
  blurb: 'Skinned mesh with cross-fading clips (Idle / Walk / Run).',
  async init({ gui }, onProgress) {
    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync('/models/Soldier.glb', (e) => {
      if (e.lengthComputable) onProgress((e.loaded / e.total) * 100);
    });

    const root = new THREE.Group();
    const model = gltf.scene;
    model.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.castShadow = true;
      }
    });
    root.add(model);

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(8, 64),
      new THREE.MeshStandardMaterial({ color: 0x222933, roughness: 0.95, metalness: 0.0 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    root.add(ground);

    const mixer = new THREE.AnimationMixer(model);
    const actions: Record<string, THREE.AnimationAction> = {};
    for (const clip of gltf.animations) {
      const action = mixer.clipAction(clip);
      action.enabled = true;
      action.setEffectiveWeight(0);
      action.play();
      actions[clip.name] = action;
    }

    const clipNames = gltf.animations.map((c) => c.name);
    const initial = clipNames.includes('Walk') ? 'Walk' : (clipNames[0] ?? '');
    if (initial && actions[initial]) actions[initial].setEffectiveWeight(1);

    let current = initial;
    const state = { clip: initial };

    const folder = gui.addFolder('Soldier');
    folder.add(state, 'clip', clipNames).name('Clip').onChange((next: string) => {
      const from = actions[current];
      const to = actions[next];
      if (!to || from === to) return;
      to.reset().setEffectiveWeight(1).play();
      if (from) from.crossFadeTo(to, 0.4, true);
      current = next;
    });

    return {
      root,
      update: (dt) => mixer.update(dt),
      dispose: () => {
        mixer.stopAllAction();
        folder.destroy();
      },
      cameraPos: [3, 2, 5],
      cameraTarget: [0, 1, 0],
      autoRotate: true,
    };
  },
};
