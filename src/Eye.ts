import * as THREE from 'three';

export type EyeState =
  | 'normal'
  | 'surprised'
  | 'sleepy'
  | 'angry'
  | 'anxious'
  | 'idle'
  | 'listening';

export class Eye {
  private group: THREE.Group;
  private whiteEye: THREE.Mesh;
  private currentState: EyeState = 'normal';
  private targetScale: THREE.Vector3 = new THREE.Vector3(1.2, 1.5, 1);
  private currentScale: THREE.Vector3 = new THREE.Vector3(1.2, 1.5, 1);
  private animationSpeed: number = 0.1;
  private currentGeometry: THREE.BufferGeometry;
  private currentMaterial: THREE.Material;

  constructor(x: number) {
    this.group = new THREE.Group();

    // Create white part of the eye
    this.currentGeometry = new THREE.SphereGeometry(1, 32, 32);
    this.currentMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.whiteEye = new THREE.Mesh(this.currentGeometry, this.currentMaterial);
    this.whiteEye.scale.copy(this.currentScale);
    this.group.add(this.whiteEye);

    this.group.position.x = x;
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

  private createListeningGeometry(): THREE.BufferGeometry {
    // Create a more focused, alert shape for the listening state
    const geometry = new THREE.BufferGeometry();
    const segments = 32;
    const vertices = [];
    const indices = [];

    // Create a base sphere but with some focus
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI;
      for (let j = 0; j <= segments; j++) {
        const phi = (j / segments) * 2 * Math.PI;

        // Add some focus to the front of the eye
        const focus = 0.05 * Math.cos(phi) * Math.sin(theta);

        const x = (1 + focus) * Math.sin(theta) * Math.cos(phi);
        const y = (1 + focus) * Math.sin(theta) * Math.sin(phi);
        const z = (1 + focus) * Math.cos(theta);

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
        this.updateGeometry(new THREE.SphereGeometry(1, 32, 32));
        break;
      case 'surprised':
        this.targetScale.set(1.2, 2, 1);
        this.updateGeometry(new THREE.SphereGeometry(1, 32, 32));
        break;
      case 'sleepy':
        this.targetScale.set(1.2, 0.8, 1);
        this.updateGeometry(new THREE.SphereGeometry(1, 32, 32));
        break;
      case 'angry':
        this.targetScale.set(1.5, 1.2, 1);
        this.updateGeometry(new THREE.SphereGeometry(1, 32, 32));
        break;
      case 'anxious':
        this.targetScale.set(1.1, 1.3, 1);
        this.updateGeometry(this.createAnxiousGeometry());
        break;
      case 'idle':
        this.targetScale.set(1.1, 1.1, 1);
        this.updateGeometry(new THREE.SphereGeometry(1, 32, 32));
        break;
      case 'listening':
        this.targetScale.set(1.3, 1.4, 1);
        this.updateGeometry(this.createListeningGeometry());
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
    this.currentGeometry.dispose();
    this.currentMaterial.dispose();
  }
}
