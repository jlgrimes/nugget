import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Eye, EyeState } from './Eye';

const CartoonEyes = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [currentState, setCurrentState] = useState<EyeState>('idle');
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

  // Update eye states when currentState changes
  useEffect(() => {
    if (leftEyeRef.current && rightEyeRef.current) {
      leftEyeRef.current.setState(currentState);
      rightEyeRef.current.setState(currentState);
    }
  }, [currentState]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          display: 'flex',
          gap: '10px',
          zIndex: 1,
        }}
      >
        {(['idle', 'listening', 'thinking'] as EyeState[]).map(state => (
          <button
            key={state}
            onClick={() => setCurrentState(state)}
            style={{
              padding: '8px 16px',
              backgroundColor: currentState === state ? '#4CAF50' : '#f0f0f0',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              color: currentState === state ? 'white' : 'black',
            }}
          >
            {state.charAt(0).toUpperCase() + state.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CartoonEyes;
