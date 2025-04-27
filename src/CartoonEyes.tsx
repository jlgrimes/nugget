import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const CartoonEyes = () => {
  const mountRef = useRef<HTMLDivElement>(null);

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

    // Create eyes
    const createEye = (x: number) => {
      const group = new THREE.Group();

      // White part of the eye (oval shape)
      const whiteGeometry = new THREE.SphereGeometry(1, 32, 32);
      const whiteMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const whiteEye = new THREE.Mesh(whiteGeometry, whiteMaterial);
      // Scale to create oval shape (wider than tall)
      whiteEye.scale.set(1.2, 1.5, 1);
      group.add(whiteEye);

      // Black part of the eye (pupil)
      const blackGeometry = new THREE.SphereGeometry(0.3, 32, 32);
      const blackMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
      const blackEye = new THREE.Mesh(blackGeometry, blackMaterial);
      blackEye.position.z = 0.5;
      // Scale pupil to match oval shape
      blackEye.scale.set(1.5, 1, 1);
      group.add(blackEye);

      group.position.x = x;
      return group;
    };

    // Add eyes to scene
    const leftEye = createEye(-1.5);
    const rightEye = createEye(1.5);
    scene.add(leftEye);
    scene.add(rightEye);

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);

      // Make eyes follow mouse
      const mouseX = (window.innerWidth / 2) * 2 - 1;
      const mouseY = -(window.innerHeight / 2) * 2 + 1;

      leftEye.children[1].position.x = mouseX * 0.3;
      leftEye.children[1].position.y = mouseY * 0.3;
      rightEye.children[1].position.x = mouseX * 0.3;
      rightEye.children[1].position.y = mouseY * 0.3;

      renderer.render(scene, camera);
    };

    // Mouse move handler
    const handleMouseMove = (event: MouseEvent) => {
      const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

      leftEye.children[1].position.x = mouseX * 0.3;
      leftEye.children[1].position.y = mouseY * 0.3;
      rightEye.children[1].position.x = mouseX * 0.3;
      rightEye.children[1].position.y = mouseY * 0.3;
    };

    window.addEventListener('mousemove', handleMouseMove);
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
      window.removeEventListener('mousemove', handleMouseMove);
      mountRef.current?.removeChild(renderer.domElement);
      scene.remove(leftEye);
      scene.remove(rightEye);
      leftEye.children.forEach(child => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
        }
      });
      rightEye.children.forEach(child => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
        }
      });
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100%', height: '100vh' }} />;
};

export default CartoonEyes;
