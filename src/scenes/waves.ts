import * as THREE from 'three';
import type { SceneDef } from './types';

type ShaderRef = THREE.WebGLProgramParametersWithUniforms;

export const wavesScene: SceneDef = {
  id: 'waves',
  label: 'Wave Field',
  blurb: 'Vertex-shader displaced plane lit by the sky environment.',
  async init({ gui }, onProgress) {
    onProgress(100);

    const geometry = new THREE.PlaneGeometry(40, 40, 256, 256);
    geometry.rotateX(-Math.PI / 2);

    const material = new THREE.MeshPhysicalMaterial({
      color: 0x0a3a66,
      metalness: 0.4,
      roughness: 0.15,
      envMapIntensity: 1.4,
    });

    const params = {
      amplitude: 0.6,
      frequency: 0.35,
      speed: 0.8,
    };

    let shaderRef: ShaderRef | null = null;
    material.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = { value: 0 };
      shader.uniforms.uAmp = { value: params.amplitude };
      shader.uniforms.uFreq = { value: params.frequency };
      shader.uniforms.uSpeed = { value: params.speed };

      shader.vertexShader = shader.vertexShader
        .replace(
          'void main() {',
          /* glsl */ `
            uniform float uTime;
            uniform float uAmp;
            uniform float uFreq;
            uniform float uSpeed;

            float waveHeight(vec2 p, float t) {
              return (
                sin(p.x * uFreq + t) * cos(p.y * uFreq * 1.3 + t * 0.7) +
                sin((p.x + p.y) * uFreq * 0.6 + t * 1.1) * 0.5
              ) * uAmp;
            }
            void main() {
          `,
        )
        .replace(
          '#include <beginnormal_vertex>',
          /* glsl */ `
            float t = uTime * uSpeed;
            float eps = 0.15;
            float h = waveHeight(position.xz, t);
            float hx = waveHeight(position.xz + vec2(eps, 0.0), t);
            float hz = waveHeight(position.xz + vec2(0.0, eps), t);
            vec3 objectNormal = normalize(vec3(h - hx, eps, h - hz));
          `,
        )
        .replace(
          '#include <begin_vertex>',
          /* glsl */ `
            vec3 transformed = position;
            transformed.y += waveHeight(position.xz, uTime * uSpeed);
          `,
        );

      shaderRef = shader;
    };

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = -0.5;

    const root = new THREE.Group();
    root.add(mesh);

    const folder = gui.addFolder('Waves');
    folder.add(params, 'amplitude', 0, 2, 0.05).onChange((v: number) => {
      if (shaderRef) shaderRef.uniforms.uAmp.value = v;
    });
    folder.add(params, 'frequency', 0.05, 1, 0.01).onChange((v: number) => {
      if (shaderRef) shaderRef.uniforms.uFreq.value = v;
    });
    folder.add(params, 'speed', 0, 3, 0.05).onChange((v: number) => {
      if (shaderRef) shaderRef.uniforms.uSpeed.value = v;
    });
    folder.addColor({ c: '#0a3a66' }, 'c').name('Color').onChange((v: string) => material.color.set(v));

    return {
      root,
      update: (_dt, elapsed) => {
        if (shaderRef) shaderRef.uniforms.uTime.value = elapsed;
      },
      dispose: () => {
        geometry.dispose();
        material.dispose();
        folder.destroy();
      },
      cameraPos: [0, 4, 10],
      cameraTarget: [0, 0, 0],
      autoRotate: false,
    };
  },
};
