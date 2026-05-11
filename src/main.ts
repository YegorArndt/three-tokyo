import * as THREE from 'three';
import { createEngine } from './engine';
import { SceneHost } from './host';
import { mountPanel } from './panel';

const canvas = document.querySelector<HTMLCanvasElement>('#app');
if (!canvas) throw new Error('Canvas #app not found');

const loaderEl = document.querySelector<HTMLDivElement>('#loader');
const loaderFill = document.querySelector<HTMLDivElement>('#loader-fill');
const loaderText = document.querySelector<HTMLDivElement>('#loader-text');
if (!loaderEl || !loaderFill || !loaderText) throw new Error('Loader DOM missing');

const loader = {
  show: () => loaderEl.classList.remove('done'),
  hide: () => loaderEl.classList.add('done'),
  setProgress: (p: number) => {
    loaderFill.style.width = `${p}%`;
    const label = loaderEl.dataset.label ?? 'Loading';
    loaderText.textContent = `${label} ${Math.floor(p)}%`;
  },
  setLabel: (label: string) => {
    loaderEl.dataset.label = label;
  },
};

const engine = createEngine(canvas);
const host = new SceneHost(engine, loader);
mountPanel({ onSelect: (def) => void host.switchTo(def) });

const clock = new THREE.Clock();
engine.renderer.setAnimationLoop(() => {
  const dt = clock.getDelta();
  const elapsed = clock.getElapsedTime();
  host.update(dt, elapsed);
  engine.controls.update();
  engine.composer.render();
  engine.stats.update();
});
