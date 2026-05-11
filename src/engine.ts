import * as THREE from 'three';
import GUI from 'lil-gui';
import Stats from 'three/addons/libs/stats.module.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Sky } from 'three/addons/objects/Sky.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export type Engine = ReturnType<typeof createEngine>;

export function createEngine(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(5, 2, 8);

  const sky = new Sky();
  sky.scale.setScalar(450000);
  const u = sky.material.uniforms;
  u['turbidity'].value = 0;
  u['rayleigh'].value = 1.2;
  u['mieCoefficient'].value = 0.005;
  u['mieDirectionalG'].value = 0.7;
  u['sunPosition'].value.set(-0.8, 0.19, 0.56);
  scene.add(sky);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(scene).texture;

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.target.set(0, 0.7, 0);
  controls.minDistance = 1.5;
  controls.maxDistance = 40;
  controls.maxPolarAngle = Math.PI / 2 - 0.02;
  controls.autoRotateSpeed = 0.6;

  const composer = new EffectComposer(renderer);
  composer.setSize(window.innerWidth, window.innerHeight);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.15,
    0.8,
    0.0,
  );
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  const stats = new Stats();
  stats.dom.style.cssText = 'position:fixed;top:8px;right:8px;left:auto;opacity:0.7;';
  document.body.appendChild(stats.dom);

  const gui = new GUI({ title: 'Controls' });
  const display = {
    exposure: 1.0,
    bloom: 0.15,
    autoRotate: true,
  };
  const globalFolder = gui.addFolder('Global');
  globalFolder.add(display, 'exposure', 0, 2, 0.05).onChange((v: number) => {
    renderer.toneMappingExposure = v;
  });
  globalFolder.add(display, 'bloom', 0, 2, 0.05).onChange((v: number) => {
    bloom.strength = v;
  });
  globalFolder.add(display, 'autoRotate').name('Auto rotate').onChange((v: boolean) => {
    controls.autoRotate = v;
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
  });

  return { renderer, scene, camera, controls, composer, bloom, stats, gui, display };
}
