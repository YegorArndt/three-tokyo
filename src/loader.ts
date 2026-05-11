import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

const MODEL_URL = '/models/LittlestTokyo.glb';
const DRACO_DECODER_URL = 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/';

export async function loadModel(onProgress: (percent: number) => void) {
  const draco = new DRACOLoader();
  draco.setDecoderPath(DRACO_DECODER_URL);

  const loader = new GLTFLoader();
  loader.setDRACOLoader(draco);

  const gltf = await loader.loadAsync(MODEL_URL, (e) => {
    if (e.lengthComputable) onProgress((e.loaded / e.total) * 100);
  });

  const model = gltf.scene;
  model.position.set(1, 1, 0);
  model.scale.setScalar(0.01);

  const mixer = new THREE.AnimationMixer(model);
  const firstClip = gltf.animations[0];
  if (firstClip) mixer.clipAction(firstClip).play();

  return { model, mixer };
}
