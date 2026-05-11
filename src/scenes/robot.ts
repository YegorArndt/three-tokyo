import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import type { SceneDef } from './types';

const STATES = ['Idle', 'Walking', 'Running', 'Dance', 'Death', 'Sitting', 'Standing'] as const;
const EMOTES = ['Jump', 'Yes', 'No', 'Wave', 'Punch', 'ThumbsUp'] as const;

export const robotScene: SceneDef = {
  id: 'robot',
  label: 'Robot Expressive',
  blurb: 'Skeletal animation with state machine + one-shot emotes.',
  async init({ gui }, onProgress) {
    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync('/models/RobotExpressive/RobotExpressive.glb', (e) => {
      if (e.lengthComputable) onProgress((e.loaded / e.total) * 100);
    });

    const root = new THREE.Group();
    const model = gltf.scene;
    root.add(model);

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(6, 64),
      new THREE.MeshStandardMaterial({ color: 0x1a1f28, roughness: 0.9 }),
    );
    ground.rotation.x = -Math.PI / 2;
    root.add(ground);

    const mixer = new THREE.AnimationMixer(model);
    const actions = new Map<string, THREE.AnimationAction>();
    for (const clip of gltf.animations) {
      const action = mixer.clipAction(clip);
      if (clip.name === 'Death') action.clampWhenFinished = true;
      if ((EMOTES as readonly string[]).includes(clip.name)) {
        action.setLoop(THREE.LoopOnce, 1);
        action.clampWhenFinished = true;
      }
      actions.set(clip.name, action);
    }

    let activeState = 'Walking';
    actions.get(activeState)?.play();

    const restore = () => {
      const next = actions.get(activeState);
      if (next) next.reset().fadeIn(0.2).play();
    };

    mixer.addEventListener('finished', restore);

    const ctrl = {
      state: activeState,
      emote: '— pick —',
      playEmote: () => {
        const target = ctrl.emote;
        const a = actions.get(target);
        if (!a) return;
        const current = actions.get(activeState);
        if (current) current.fadeOut(0.2);
        a.reset().fadeIn(0.2).play();
      },
    };

    const folder = gui.addFolder('Robot');
    folder.add(ctrl, 'state', [...STATES]).name('State').onChange((next: string) => {
      const from = actions.get(activeState);
      const to = actions.get(next);
      if (!to || from === to) return;
      to.reset().setEffectiveWeight(1).fadeIn(0.3).play();
      if (from) from.fadeOut(0.3);
      activeState = next;
    });
    folder.add(ctrl, 'emote', ['— pick —', ...EMOTES]).name('Emote');
    folder.add(ctrl, 'playEmote').name('Play emote');

    return {
      root,
      update: (dt) => mixer.update(dt),
      dispose: () => {
        mixer.removeEventListener('finished', restore);
        mixer.stopAllAction();
        folder.destroy();
      },
      cameraPos: [3, 2.5, 5],
      cameraTarget: [0, 1, 0],
      autoRotate: true,
    };
  },
};
