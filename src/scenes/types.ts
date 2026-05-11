import type * as THREE from 'three';
import type GUI from 'lil-gui';
import type { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export type SceneCtx = {
  renderer: THREE.WebGLRenderer;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  gui: GUI;
};

export type SceneInstance = {
  root: THREE.Object3D;
  update: (dt: number, elapsed: number) => void;
  dispose: () => void;
  cameraPos: [number, number, number];
  cameraTarget: [number, number, number];
  autoRotate?: boolean;
};

export type SceneDef = {
  id: string;
  label: string;
  blurb: string;
  init: (ctx: SceneCtx, onProgress: (p: number) => void) => Promise<SceneInstance>;
};
