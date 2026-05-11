import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export function createComposer(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) {
  const size = new THREE.Vector2(window.innerWidth, window.innerHeight);

  const composer = new EffectComposer(renderer);
  composer.setSize(size.x, size.y);
  composer.addPass(new RenderPass(scene, camera));

  const bloom = new UnrealBloomPass(size, 0.4, 0.8, 0.0);
  composer.addPass(bloom);

  composer.addPass(new OutputPass());

  return { composer, bloom };
}
