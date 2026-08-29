import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './ThreeDCanvas.css';

/**
 * ThreeDCanvas Component
 * Three.js interactive 3D canvas featuring a floating glassmorphic lavender torus knot
 * and orbiting event ticket particle ring responding subtly to mouse movements.
 */
export const ThreeDCanvas = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 6;

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x8b5cf6, 4, 50);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xc4b5fd, 3, 50);
    pointLight2.position.set(-5, -5, 3);
    scene.add(pointLight2);

    // 4. Central 3D Object: TorusKnot (Festora Geometric Infinity Emblem)
    const geometry = new THREE.TorusKnotGeometry(1.2, 0.36, 128, 32);
    const material = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      roughness: 0.15,
      metalness: 0.85,
      emissive: 0x4c1d95,
      emissiveIntensity: 0.2,
      wireframe: false,
    });

    const torusKnot = new THREE.Mesh(geometry, material);
    scene.add(torusKnot);

    // 5. Orbiting Floating Particles Ring
    const particlesCount = 45;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount; i++) {
      const radius = 2.4 + Math.random() * 0.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI * 0.5;

      positions[i * 3] = radius * Math.cos(theta) * Math.cos(phi);
      positions[i * 3 + 1] = radius * Math.sin(phi);
      positions[i * 3 + 2] = radius * Math.sin(theta) * Math.cos(phi);
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      color: 0xc4b5fd,
      size: 0.08,
      transparent: true,
      opacity: 0.85,
    });

    const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particleSystem);

    // 6. Interactive Mouse Motion Target
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      mouseX = x * 0.0015;
      mouseY = y * 0.0015;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 7. Animation Loop
    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Smooth Mouse Parallax Easing
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      torusKnot.rotation.x += 0.006;
      torusKnot.rotation.y += 0.008;

      torusKnot.rotation.y += targetX * 0.5;
      torusKnot.rotation.x += targetY * 0.5;

      particleSystem.rotation.y -= 0.003;
      particleSystem.rotation.x += 0.002;

      renderer.render(scene, camera);
    };

    animate();

    // 8. Responsive Resize Listener
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="three-d-canvas-wrapper">
      <div className="canvas-container" ref={mountRef} />
      <div className="canvas-badge-3d">
        <span>Interactive 3D Emblem &bull; Move Cursor</span>
      </div>
    </div>
  );
};
