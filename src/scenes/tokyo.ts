import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import type { SceneDef } from './types';

const DRACO_DECODER_URL = 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/';

export const tokyoScene: SceneDef = {
  id: 'tokyo',
  label: 'Littlest Tokyo',
  blurb: 'Animated GLB diorama with sky-lit IBL.',
  async init(_ctx, onProgress) {
    const draco = new DRACOLoader();
    draco.setDecoderPath(DRACO_DECODER_URL);
    const loader = new GLTFLoader();
    loader.setDRACOLoader(draco);

    const gltf = await loader.loadAsync('/models/LittlestTokyo.glb', (e) => {
      if (e.lengthComputable) onProgress((e.loaded / e.total) * 100);
    });

    const root = gltf.scene;
    root.position.set(1, 1, 0);
    root.scale.setScalar(0.01);

    const mixer = new THREE.AnimationMixer(root);
    const clip = gltf.animations[0];
    if (clip) mixer.clipAction(clip).play();

    return {
      root,
      update: (dt) => mixer.update(dt),
      dispose: () => mixer.stopAllAction(),
      cameraPos: [5, 2, 8],
      cameraTarget: [0, 0.7, 0],
      autoRotate: true,
    };
  },
};
