import * as THREE from 'three';
import type { SceneDef } from './types';

const VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  attribute float aSeed;
  varying float vMix;
  void main() {
    vec3 p = position;
    float t = uTime + aSeed * 6.2831;
    p.x += sin(t * 0.6 + p.y * 0.4) * 0.6;
    p.y += cos(t * 0.5 + p.z * 0.4) * 0.6;
    p.z += sin(t * 0.4 + p.x * 0.4) * 0.6;
    vMix = 0.5 + 0.5 * sin(t * 0.3);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (300.0 / -mv.z);
  }
`;

const FRAGMENT = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying float vMix;
  void main() {
    vec2 d = gl_PointCoord - 0.5;
    float r = dot(d, d);
    if (r > 0.25) discard;
    float alpha = smoothstep(0.25, 0.0, r);
    vec3 col = mix(uColorA, uColorB, vMix);
    gl_FragColor = vec4(col, alpha);
  }
`;

export const particlesScene: SceneDef = {
  id: 'particles',
  label: 'Particle Storm',
  blurb: '100k GPU-animated points. Pure shader, zero CPU work per frame.',
  async init({ gui }, onProgress) {
    onProgress(100);

    const COUNT = 100_000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(COUNT * 3);
    const seeds = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      const r = Math.cbrt(Math.random()) * 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      seeds[i] = Math.random();
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));

    const uniforms = {
      uTime: { value: 0 },
      uSize: { value: 1.4 },
      uColorA: { value: new THREE.Color('#5ac8ff') },
      uColorB: { value: new THREE.Color('#ff6ad5') },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geometry, material);
    const root = new THREE.Group();
    root.add(points);

    const folder = gui.addFolder('Particles');
    folder.add(uniforms.uSize, 'value', 0.2, 4, 0.05).name('Point size');
    folder.addColor({ a: '#5ac8ff' }, 'a').name('Color A').onChange((v: string) => uniforms.uColorA.value.set(v));
    folder.addColor({ b: '#ff6ad5' }, 'b').name('Color B').onChange((v: string) => uniforms.uColorB.value.set(v));

    return {
      root,
      update: (_dt, elapsed) => {
        uniforms.uTime.value = elapsed;
      },
      dispose: () => {
        geometry.dispose();
        material.dispose();
        folder.destroy();
      },
      cameraPos: [0, 0, 12],
      cameraTarget: [0, 0, 0],
      autoRotate: true,
    };
  },
};
