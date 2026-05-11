import GUI from 'lil-gui';
import * as THREE from 'three';
import type { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

type UiArgs = {
  renderer: THREE.WebGLRenderer;
  model: THREE.Object3D;
  bloom: UnrealBloomPass;
};

type UiState = {
  autoRotate: boolean;
  rotationSpeed: number;
  exposure: number;
  bloomStrength: number;
  wireframe: boolean;
};

function hasWireframe(m: THREE.Material): m is THREE.Material & { wireframe: boolean } {
  return 'wireframe' in m;
}

export function createUi({ renderer, model, bloom }: UiArgs): UiState {
  const state: UiState = {
    autoRotate: true,
    rotationSpeed: 0.15,
    exposure: 1.0,
    bloomStrength: 0.4,
    wireframe: false,
  };

  const gui = new GUI({ title: 'Scene' });
  gui.add(state, 'autoRotate').name('Auto rotate');
  gui.add(state, 'rotationSpeed', 0, 1.5, 0.05).name('Speed');
  gui.add(state, 'exposure', 0, 2, 0.05).name('Exposure').onChange((v: number) => {
    renderer.toneMappingExposure = v;
  });
  gui.add(state, 'bloomStrength', 0, 2, 0.05).name('Bloom').onChange((v: number) => {
    bloom.strength = v;
  });
  gui.add(state, 'wireframe').name('Wireframe').onChange((v: boolean) => {
    model.traverse((o) => {
      if (!(o instanceof THREE.Mesh)) return;
      const mat: THREE.Material | THREE.Material[] = o.material;
      const list = Array.isArray(mat) ? mat : [mat];
      for (const m of list) if (hasWireframe(m)) m.wireframe = v;
    });
  });

  return state;
}
