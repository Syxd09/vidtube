import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial, PerspectiveCamera } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

function CoreGeometry() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      meshRef.current.rotation.z += 0.003;
      
      // Pointer Tracking (Kinetic Response)
      const { x, y } = state.pointer;
      meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, x * 0.4, 0.1);
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, y * 0.4, 0.1);
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, -y * 0.3, 0.1);
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, x * 0.3, 0.1);
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <Sphere ref={meshRef} args={[1.2, 64, 64]}>
        <MeshDistortMaterial
          color="#3b82f6"
          speed={3}
          distort={0.4}
          radius={1}
          metalness={0.8}
          roughness={0.2}
          emissive="#1d4ed8"
          emissiveIntensity={2}
          transparent
          opacity={0.6}
        />
      </Sphere>
      <Sphere args={[1.22, 32, 32]}>
        <meshBasicMaterial color="#60a5fa" wireframe transparent opacity={0.15} />
      </Sphere>
      <Sphere args={[1.4, 16, 16]}>
        <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.05} />
      </Sphere>
    </Float>
  );
}

export default function NeuralCore() {
  const dataNodes = [
    { label: "SYMMETRY_LOAD", val: "0.98", top: "20%", left: "15%" },
    { label: "VECTOR_STATE", val: "ACTIVE", top: "25%", right: "12%" },
    { label: "QUANTUM_LINK", val: "STABLE", bottom: "30%", left: "18%" },
    { label: "NEURAL_FLUX", val: "4.2 GHZ", bottom: "22%", right: "14%" },
  ];

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      {/* Floating Data HUD Nodes */}
      <div className="absolute inset-0 z-10 w-full h-full max-w-[800px] max-h-[800px] m-auto opacity-40">
        {dataNodes.map((node, i) => (
          <div 
            key={i} 
            className="absolute text-[8px] font-mono text-primary/50 tracking-widest flex flex-col items-start gap-1 p-2 border-l border-primary/20 backdrop-blur-sm bg-primary/5 rounded-r-lg"
            style={{ 
              top: node.top, 
              left: node.left, 
              right: node.right, 
              bottom: node.bottom 
            }}
          >
            <span className="font-black text-primary/30 uppercase">{node.label}</span>
            <span className="text-white font-bold">{node.val}</span>
            <motion.div 
               animate={{ width: ["0%", "100%", "0%"] }}
               transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
               className="h-[1px] bg-primary/40"
            />
          </div>
        ))}
      </div>

      {/* 2D Tactical Rings Layer */}
      <div className="absolute inset-0 flex items-center justify-center">
        {[
            { size: 400, duration: 20, dash: "4 12", opacity: 0.1, reverse: false },
            { size: 480, duration: 40, dash: "8 24", opacity: 0.05, reverse: true },
            { size: 550, duration: 60, dash: "1 40", opacity: 0.03, reverse: false },
            { size: 650, duration: 90, dash: "2 100", opacity: 0.02, reverse: true },
        ].map((ring, i) => (
            <motion.div
                key={i}
                initial={{ rotate: 0, opacity: 0, scale: 0.8 }}
                animate={{ 
                    rotate: ring.reverse ? -360 : 360, 
                    opacity: ring.opacity,
                    scale: 1
                }}
                transition={{ 
                    rotate: { repeat: Infinity, duration: ring.duration, ease: "linear" },
                    opacity: { duration: 2 },
                    scale: { duration: 2 }
                }}
                style={{
                    width: ring.size,
                    height: ring.size,
                    border: `1px dashed #3b82f6`,
                    borderRadius: '50%',
                    position: 'absolute',
                }}
            />
        ))}

        {/* Tactical Crosshair SVG */}
        <svg width="600" height="600" className="absolute opacity-15">
            <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
                    <stop offset="50%" stopColor="#3b82f6" stopOpacity="1" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
            </defs>
            <circle cx="300" cy="300" r="290" stroke="url(#grad1)" strokeWidth="0.5" fill="none" opacity="0.3" />
            <line x1="300" y1="50" x2="300" y2="100" stroke="#3b82f6" strokeWidth="1" />
            <line x1="300" y1="500" x2="300" y2="550" stroke="#3b82f6" strokeWidth="1" />
            <line x1="50" y1="300" x2="100" y2="300" stroke="#3b82f6" strokeWidth="1" />
            <line x1="500" y1="300" x2="550" y2="300" stroke="#3b82f6" strokeWidth="1" />
        </svg>
      </div>

      {/* 3D Core Canvas Layer */}
      <div className="w-[800px] h-[800px] opacity-90 mix-blend-screen">
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 0, 5]} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={2} color="#3b82f6" />
          <pointLight position={[-10, -10, -10]} intensity={1.5} color="#7c3aed" />
          <CoreGeometry />
        </Canvas>
      </div>

      {/* High-Fidelity Labels */}
      <div className="absolute flex flex-col items-center gap-2 mt-[480px]">
          <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.5em] animate-pulse">Neural_Sync_Active</span>
              <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_#3b82f6]" />
          </div>
          <div className="text-[8px] font-mono text-white/20 uppercase tracking-widest">
              Core // Sector // 7G // Uplink // 100%
          </div>
      </div>
    </div>
  );
}
