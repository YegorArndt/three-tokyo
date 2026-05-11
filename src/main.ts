import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { createScene } from './scene';
import { loadModel } from './loader';
import { createComposer } from './postprocessing';
import { createUi } from './ui';

const canvas = document.querySelector<HTMLCanvasElement>('#app');
if (!canvas) throw new Error('Canvas #app not found');

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

const { scene, camera, controls } = createScene(renderer);
const { composer, bloom } = createComposer(renderer, scene, camera);

const stats = new Stats();
stats.dom.style.cssText = 'position:fixed;top:8px;left:8px;opacity:0.7;';
document.body.appendChild(stats.dom);

const loaderEl = document.querySelector<HTMLDivElement>('#loader');
const loaderFill = document.querySelector<HTMLDivElement>('#loader-fill');
const loaderText = document.querySelector<HTMLDivElement>('#loader-text');

const { model, mixer } = await loadModel((p) => {
  if (loaderFill) loaderFill.style.width = `${p}%`;
  if (loaderText) loaderText.textContent = `Loading ${Math.floor(p)}%`;
});
scene.add(model);
loaderEl?.classList.add('done');

const ui = createUi({ renderer, model, bloom });

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const dt = clock.getDelta();
  mixer.update(dt);
  if (ui.autoRotate) model.rotation.y += dt * ui.rotationSpeed;
  controls.update();
  composer.render();
  stats.update();
});
