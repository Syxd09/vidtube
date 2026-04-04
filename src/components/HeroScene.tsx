import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float, Stars, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

function Orb({ color, size, speed, distort, position, opacity = 0.5 }: { 
  color: string, 
  size: number, 
  speed: number, 
  distort: number,
  position: [number, number, number],
  opacity?: number
}) {
  const mesh = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!mesh.current) return;
    mesh.current.rotation.x = state.clock.getElapsedTime() * 0.1;
    mesh.current.rotation.y = state.clock.getElapsedTime() * 0.15;
  });

  return (
    <Float speed={speed} rotationIntensity={0.2} floatIntensity={0.4}>
      <Sphere ref={mesh} args={[size, 64, 64]} position={position}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={distort}
          speed={speed}
          roughness={0.1}
          metalness={1}
          emissive={color}
          emissiveIntensity={0.2}
          transparent
          opacity={opacity}
        />
      </Sphere>
    </Float>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#3B82F6" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8B5CF6" />
      
      {/* Subtle Background Field */}
      <Orb position={[4, 2, -5]} size={2} speed={1} distort={0.2} color="#1E40AF" opacity={0.1} />
      <Orb position={[-4, -2, -6]} size={2.5} speed={0.8} distort={0.3} color="#581C87" opacity={0.1} />
      
      {/* Small Accents */}
      <Orb position={[2, -1, -2]} size={0.3} speed={2} distort={0.5} color="#60A5FA" opacity={0.3} />
      <Orb position={[-2, 1, -1]} size={0.2} speed={3} distort={0.4} color="#C084FC" opacity={0.3} />

      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />
      <Environment preset="night" />
    </>
  );
}

export const HeroScene = () => {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="aurora-container">
        <div className="aurora-blob bg-blue-600/20 w-[1000px] h-[1000px] -top-1/2 -left-1/4" />
        <div className="aurora-blob bg-purple-600/20 w-[800px] h-[800px] -bottom-1/2 -right-1/4" />
      </div>
      
      <Canvas
        camera={{ position: [0, 0, 10], fov: 45 }}
        style={{ background: 'transparent' }}
        dpr={[1, 2]}
      >
        <Scene />
      </Canvas>
      
      <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/20 to-black/80 pointer-events-none" />
    </div>
  );
};
