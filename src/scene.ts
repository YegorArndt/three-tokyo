import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Sky } from 'three/addons/objects/Sky.js';

export function createScene(renderer: THREE.WebGLRenderer) {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(5, 2, 8);

  const sky = new Sky();
  sky.scale.setScalar(450000);
  const u = sky.material.uniforms;
  u['turbidity'].value = 0;
  u['rayleigh'].value = 3;
  u['mieCoefficient'].value = 0.005;
  u['mieDirectionalG'].value = 0.7;
  u['sunPosition'].value.set(-0.8, 0.19, 0.56);
  scene.add(sky);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(scene).texture;

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.target.set(0, 0.7, 0);
  controls.minDistance = 3;
  controls.maxDistance = 20;
  controls.maxPolarAngle = Math.PI / 2 - 0.05;
  controls.update();

  return { scene, camera, controls };
}
