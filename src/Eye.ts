import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';

export type EyeState =
  | 'idle'
  | 'surprised'
  | 'sleepy'
  | 'angry'
  | 'anxious'
  | 'listening';

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
  private bobTween: TWEEN.Tween<THREE.Vector3> | null = null;
  private isBobbing: boolean = false;

  constructor(x: number, y: number = 0) {
    this.group = new THREE.Group();
    this.basePosition = { x, y };

    // Create white part of the eye
    this.currentGeometry = new THREE.SphereGeometry(1, 32, 32);
    this.currentMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.whiteEye = new THREE.Mesh(this.currentGeometry, this.currentMaterial);
    this.whiteEye.scale.copy(this.currentScale);
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
      .easing(TWEEN.Easing.Quadratic.Out)
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
      .easing(TWEEN.Easing.Quadratic.Out)
      .onUpdate(() => {
        this.whiteEye.scale.copy(this.currentScale);
      })
      .start();
  }

  private startBobbing() {
    if (this.bobTween) {
      this.bobTween.stop();
    }

    const startY = this.group.position.y;
    this.bobTween = new TWEEN.Tween(this.group.position)
      .to({ y: startY + 0.1 }, 2000)
      .easing(TWEEN.Easing.Sinusoidal.InOut)
      .yoyo(true)
      .repeat(Infinity)
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
        this.startBobbing();
        break;
      case 'listening':
        this.startTween(new THREE.Vector3(1.2, 1.5, 1));
        this.updateGeometry(new THREE.SphereGeometry(1, 32, 32));
        const offset = this.basePosition.x > 0 ? 0.2 : -0.2;
        this.setPosition(offset, 0);
        this.startBobbing();
        break;
      case 'surprised':
        this.stopBobbing();
        this.startTween(new THREE.Vector3(1.2, 2, 1));
        this.updateGeometry(new THREE.SphereGeometry(1, 32, 32));
        this.setPosition(0, 0);
        break;
      case 'sleepy':
        this.stopBobbing();
        this.startTween(new THREE.Vector3(1.2, 0.8, 1));
        this.updateGeometry(new THREE.SphereGeometry(1, 32, 32));
        this.setPosition(0, 0);
        break;
      case 'angry':
        this.stopBobbing();
        this.startTween(new THREE.Vector3(1.5, 1.2, 1));
        this.updateGeometry(new THREE.SphereGeometry(1, 32, 32));
        this.setPosition(0, 0);
        break;
      case 'anxious':
        this.stopBobbing();
        this.startTween(new THREE.Vector3(1.1, 1.3, 1));
        this.updateGeometry(this.createAnxiousGeometry());
        this.setPosition(0, 0);
        break;
    }
  }

  private updateGeometry(newGeometry: THREE.BufferGeometry) {
    // Dispose of the old geometry
    this.currentGeometry.dispose();

    // Update the mesh with the new geometry
    this.currentGeometry = newGeometry;
    this.whiteEye.geometry = this.currentGeometry;
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
