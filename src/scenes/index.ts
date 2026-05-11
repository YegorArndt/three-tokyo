import { tokyoScene } from './tokyo';
import { soldierScene } from './soldier';
import { robotScene } from './robot';
import { particlesScene } from './particles';
import { wavesScene } from './waves';
import type { SceneDef } from './types';

export const scenes: SceneDef[] = [
  tokyoScene,
  soldierScene,
  robotScene,
  particlesScene,
  wavesScene,
];

export const scenesById = new Map(scenes.map((s) => [s.id, s]));
