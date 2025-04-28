import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Eye, EyeState } from './Eye';

interface CartoonEyesProps {
  eyeState: EyeState;
}

const CartoonEyes = ({ eyeState }: CartoonEyesProps) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const leftEyeRef = useRef<Eye | null>(null);
  const rightEyeRef = useRef<Eye | null>(null);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Camera position
    camera.position.z = 5;

    // Add lighting
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 0, 1);
    scene.add(light);

    // Create eyes
    leftEyeRef.current = new Eye(-1.3, 0);
    rightEyeRef.current = new Eye(1.3, 0);
    scene.add(leftEyeRef.current.getGroup());
    scene.add(rightEyeRef.current.getGroup());

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      const deltaTime = clockRef.current.getDelta();

      if (leftEyeRef.current && rightEyeRef.current) {
        leftEyeRef.current.update(deltaTime);
        rightEyeRef.current.update(deltaTime);
      }

      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      if (leftEyeRef.current) {
        leftEyeRef.current.dispose();
      }
      if (rightEyeRef.current) {
        rightEyeRef.current.dispose();
      }
    };
  }, []);

  // Update eye states when eyeState prop changes
  useEffect(() => {
    if (leftEyeRef.current && rightEyeRef.current) {
      leftEyeRef.current.setState(eyeState);
      rightEyeRef.current.setState(eyeState);
    }
  }, [eyeState]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default CartoonEyes;
