import * as THREE from 'three';

export type EyeState = 'normal' | 'surprised' | 'sleepy' | 'angry';

export class Eye {
  private group: THREE.Group;
  private whiteEye: THREE.Mesh;
  private pupil: THREE.Mesh;
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

    // Create pupil
    const pupilGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    const pupilMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    this.pupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    this.pupil.position.z = 0.5;
    this.pupil.scale.copy(this.currentScale);
    this.group.add(this.pupil);

    this.group.position.x = x;
  }

  public getGroup(): THREE.Group {
    return this.group;
  }

  public update(deltaTime: number) {
    // Smoothly interpolate current scale to target scale
    this.currentScale.lerp(this.targetScale, this.animationSpeed);
    this.whiteEye.scale.copy(this.currentScale);
    this.pupil.scale.copy(this.currentScale);
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
    }
  }

  public getState(): EyeState {
    return this.currentState;
  }

  public lookAt(x: number, y: number) {
    // Constrain pupil movement within the eye
    const maxX = 0.3;
    const maxY = 0.3;

    this.pupil.position.x = THREE.MathUtils.clamp(x * 0.3, -maxX, maxX);
    this.pupil.position.y = THREE.MathUtils.clamp(y * 0.3, -maxY, maxY);
  }

  public dispose() {
    this.whiteEye.geometry.dispose();
    this.pupil.geometry.dispose();
  }
}
