import * as THREE from 'three';
import type { Engine } from './engine';
import type { SceneDef, SceneInstance } from './scenes/types';

type LoaderHandle = {
  show: () => void;
  hide: () => void;
  setProgress: (p: number) => void;
  setLabel: (label: string) => void;
};

function disposeMaterial(m: THREE.Material) {
  for (const v of Object.values(m)) {
    if (v instanceof THREE.Texture) v.dispose();
  }
  m.dispose();
}

function disposeRoot(root: THREE.Object3D) {
  root.traverse((o) => {
    if (o instanceof THREE.Mesh || o instanceof THREE.Points || o instanceof THREE.LineSegments) {
      o.geometry?.dispose();
      const mat = o.material;
      if (Array.isArray(mat)) mat.forEach(disposeMaterial);
      else if (mat) disposeMaterial(mat);
    }
  });
}

export class SceneHost {
  private current: SceneInstance | null = null;
  private currentDef: SceneDef | null = null;
  private switching = false;

  constructor(private engine: Engine, private loader: LoaderHandle) {}

  get activeId() {
    return this.currentDef?.id ?? null;
  }

  async switchTo(def: SceneDef) {
    if (this.switching || this.currentDef?.id === def.id) return;
    this.switching = true;

    this.loader.setLabel(def.label);
    this.loader.setProgress(0);
    this.loader.show();

    if (this.current) {
      this.engine.scene.remove(this.current.root);
      try { this.current.dispose(); } catch (e) { console.error(e); }
      disposeRoot(this.current.root);
      this.current = null;
    }

    try {
      const inst = await def.init(
        {
          renderer: this.engine.renderer,
          camera: this.engine.camera,
          controls: this.engine.controls,
          gui: this.engine.gui,
        },
        (p) => this.loader.setProgress(p),
      );

      this.engine.scene.add(inst.root);
      this.engine.camera.position.set(...inst.cameraPos);
      this.engine.controls.target.set(...inst.cameraTarget);
      this.engine.controls.autoRotate = (inst.autoRotate ?? true) && this.engine.display.autoRotate;
      this.engine.controls.update();

      this.current = inst;
      this.currentDef = def;
      this.loader.hide();
    } catch (err) {
      console.error('Scene load failed:', err);
      this.loader.setLabel('Failed to load');
    } finally {
      this.switching = false;
    }
  }

  update(dt: number, elapsed: number) {
    this.current?.update(dt, elapsed);
  }
}
