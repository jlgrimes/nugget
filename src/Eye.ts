import * as THREE from 'three';

export type EyeState = 'normal' | 'surprised' | 'sleepy' | 'angry' | 'anxious';

export class Eye {
  private group: THREE.Group;
  private whiteEye: THREE.Mesh;
  private currentState: EyeState = 'normal';
  private targetScale: THREE.Vector3 = new THREE.Vector3(1.2, 1.5, 1);
  private currentScale: THREE.Vector3 = new THREE.Vector3(1.2, 1.5, 1);
  private animationSpeed: number = 0.1;

  constructor(x: number) {
    this.group = new THREE.Group();

    // Create white part of the eye
    const whiteGeometry = new THREE.SphereGeometry(1, 32, 32);
    const whiteMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.whiteEye = new THREE.Mesh(whiteGeometry, whiteMaterial);
    this.whiteEye.scale.copy(this.currentScale);
    this.group.add(this.whiteEye);

    this.group.position.x = x;
  }

  public getGroup(): THREE.Group {
    return this.group;
  }

  public update(deltaTime: number) {
    // Smoothly interpolate current scale to target scale
    this.currentScale.lerp(this.targetScale, this.animationSpeed);
    this.whiteEye.scale.copy(this.currentScale);
  }

  public setState(state: EyeState) {
    this.currentState = state;
    switch (state) {
      case 'normal':
        this.targetScale.set(1.2, 1.5, 1);
        break;
      case 'surprised':
        this.targetScale.set(1.2, 2, 1);
        break;
      case 'sleepy':
        this.targetScale.set(1.2, 0.8, 1);
        break;
      case 'angry':
        this.targetScale.set(1.5, 1.2, 1);
        break;
      case 'anxious':
        this.targetScale.set(1.1, 1.3, 1); // Slightly smaller and more tense
        break;
    }
  }

  public getState(): EyeState {
    return this.currentState;
  }

  public dispose() {
    this.whiteEye.geometry.dispose();
  }
}
