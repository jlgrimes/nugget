import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';

export type EyeState = 'idle' | 'listening' | 'thinking' | 'talking-rest';

export class Eye {
  private group: THREE.Group;
  private whiteEye: THREE.Mesh;
  private currentState: EyeState = 'idle';
  private targetScale: THREE.Vector3 = new THREE.Vector3(1.2, 1.5, 1);
  private currentScale: THREE.Vector3 = new THREE.Vector3(1.2, 1.5, 1);
  private animationSpeed: number = 0.1;
  private currentGeometry: THREE.BufferGeometry;
  private currentMaterial: THREE.Material;
  private currentTween: TWEEN.Tween<THREE.Vector3> | null = null;
  private basePosition: { x: number; y: number };
  private bobTween: TWEEN.Tween<{ influence: number }> | null = null;
  private isBobbing: boolean = false;
  private currentBobAmount: number = 0.1;
  private morphTargetInfluences: number[] = [0];

  constructor(x: number, y: number = 0) {
    this.group = new THREE.Group();
    this.basePosition = { x, y };

    // Create base geometry
    const baseGeometry = new THREE.SphereGeometry(1, 32, 32);
    const positions = baseGeometry.attributes.position.array;
    const morphPositions = new Float32Array(positions.length);

    // Create morph target that moves vertices up
    for (let i = 0; i < positions.length; i += 3) {
      morphPositions[i] = positions[i]; // x stays the same
      morphPositions[i + 1] = positions[i + 1] + 0.1; // y moves up
      morphPositions[i + 2] = positions[i + 2]; // z stays the same
    }

    this.currentGeometry = baseGeometry;
    this.currentGeometry.morphAttributes.position = [
      new THREE.Float32BufferAttribute(morphPositions, 3),
    ];

    this.currentMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
    });
    this.whiteEye = new THREE.Mesh(this.currentGeometry, this.currentMaterial);
    this.whiteEye.scale.copy(this.currentScale);
    this.morphTargetInfluences = [0];
    this.whiteEye.morphTargetInfluences = this.morphTargetInfluences;
    this.group.add(this.whiteEye);

    this.group.position.set(x, y, 0);
  }

  private createAnxiousGeometry(): THREE.BufferGeometry {
    // Create a more irregular, tense shape for the anxious state
    const geometry = new THREE.BufferGeometry();
    const segments = 32;
    const vertices = [];
    const indices = [];

    // Create a base sphere but with some irregularity
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI;
      for (let j = 0; j <= segments; j++) {
        const phi = (j / segments) * 2 * Math.PI;

        // Add some noise to make it look more tense
        const noise = 0.1 * Math.sin(theta * 4) * Math.cos(phi * 3);

        const x = (1 + noise) * Math.sin(theta) * Math.cos(phi);
        const y = (1 + noise) * Math.sin(theta) * Math.sin(phi);
        const z = (1 + noise) * Math.cos(theta);

        vertices.push(x, y, z);
      }
    }

    // Create indices for the faces
    for (let i = 0; i < segments; i++) {
      for (let j = 0; j < segments; j++) {
        const a = i * (segments + 1) + j;
        const b = a + 1;
        const c = (i + 1) * (segments + 1) + j;
        const d = c + 1;

        indices.push(a, b, d);
        indices.push(a, d, c);
      }
    }

    geometry.setIndex(indices);
    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(vertices, 3)
    );
    geometry.computeVertexNormals();

    return geometry;
  }

  public getGroup(): THREE.Group {
    return this.group;
  }

  public getPosition(): { x: number; y: number } {
    return {
      x: this.group.position.x,
      y: this.group.position.y,
    };
  }

  public setPosition(x: number, y: number = 0) {
    const targetPosition = {
      x: this.basePosition.x + x,
      y: this.basePosition.y + y,
    };

    new TWEEN.Tween(this.group.position)
      .to(targetPosition, 500)
      .easing(TWEEN.Easing.Cubic.Out)
      .start();
  }

  public update(deltaTime: number) {
    TWEEN.update();
  }

  private startTween(targetScale: THREE.Vector3) {
    if (this.currentTween) {
      this.currentTween.stop();
    }

    this.currentTween = new TWEEN.Tween(this.currentScale)
      .to(targetScale, 500) // 500ms duration
      .easing(TWEEN.Easing.Cubic.Out)
      .onUpdate(() => {
        this.whiteEye.scale.copy(this.currentScale);
      })
      .start();
  }

  private startBobbing(bobAmount: number = 0.1) {
    if (this.bobTween) {
      this.bobTween.stop();
    }
    this.currentBobAmount = bobAmount;

    this.bobTween = new TWEEN.Tween({ influence: 0 })
      .to({ influence: 1 }, 2000)
      .easing(TWEEN.Easing.Sinusoidal.InOut)
      .yoyo(true)
      .repeat(Infinity)
      .onUpdate(({ influence }) => {
        this.morphTargetInfluences[0] = influence * bobAmount;
        this.whiteEye.morphTargetInfluences = this.morphTargetInfluences;
      })
      .start();
    this.isBobbing = true;
  }

  private stopBobbing() {
    if (this.bobTween) {
      this.bobTween.stop();
      this.bobTween = null;
    }
    this.isBobbing = false;
  }

  public setState(state: EyeState) {
    this.currentState = state;
    switch (state) {
      case 'idle':
        this.startTween(new THREE.Vector3(0.8, 1, 1));
        this.updateGeometry(new THREE.SphereGeometry(1, 32, 32));
        const idleOffsetX = this.basePosition.x > 0 ? -0.8 : -0.1;
        const idleOffsetY = -0.2;
        this.setPosition(idleOffsetX, idleOffsetY);
        this.startBobbing(0.15);
        break;
      case 'talking-rest':
        this.startTween(new THREE.Vector3(0.8, 1, 1));
        this.updateGeometry(new THREE.SphereGeometry(1, 32, 32));
        const talkingOffsetX = this.basePosition.x > 0 ? -0.5 : 0.1;
        this.setPosition(talkingOffsetX, 0);
        this.startBobbing(0.15);
        break;
      case 'listening':
        this.startTween(new THREE.Vector3(1, 1.3, 1));
        this.updateGeometry(new THREE.SphereGeometry(1, 32, 32));
        this.setPosition(0, 0);
        this.startBobbing(0.1);
        break;
      case 'thinking':
        this.startTween(new THREE.Vector3(0.8, 1, 1));
        const thinkingOffsetX = this.basePosition.x > 0 ? 0.5 : 1.2;
        const thinkingOffsetY = 1;
        this.setPosition(thinkingOffsetX, thinkingOffsetY);
        this.startBobbing(0.05);
        break;
    }
  }

  private updateGeometry(newGeometry: THREE.BufferGeometry) {
    // Dispose of the old geometry
    this.currentGeometry.dispose();

    // Create morph target for bobbing
    const positions = newGeometry.attributes.position.array;
    const morphPositions = new Float32Array(positions.length);

    // Create morph target that moves vertices up
    for (let i = 0; i < positions.length; i += 3) {
      morphPositions[i] = positions[i]; // x stays the same
      morphPositions[i + 1] = positions[i + 1] + 0.1; // y moves up
      morphPositions[i + 2] = positions[i + 2]; // z stays the same
    }

    newGeometry.morphAttributes.position = [
      new THREE.Float32BufferAttribute(morphPositions, 3),
    ];

    // Update the mesh with the new geometry
    this.currentGeometry = newGeometry;
    this.whiteEye.geometry = this.currentGeometry;
    this.whiteEye.morphTargetInfluences = this.morphTargetInfluences;
  }

  public getState(): EyeState {
    return this.currentState;
  }

  public dispose() {
    if (this.currentTween) {
      this.currentTween.stop();
    }
    if (this.bobTween) {
      this.bobTween.stop();
    }
    this.currentGeometry.dispose();
    this.currentMaterial.dispose();
  }
}
