import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, MeshWobbleMaterial } from '@react-three/drei';
import * as THREE from 'three';

function AnimatedSphere({ position, color, speed, distort, size }: {
  position: [number, number, number];
  color: string;
  speed: number;
  distort: number;
  size: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    meshRef.current.position.y = position[1] + Math.sin(t * speed * 0.5) * 0.3;
    meshRef.current.rotation.x = t * speed * 0.15;
    meshRef.current.rotation.z = t * speed * 0.1;
  });

  return (
    <Float speed={speed} rotationIntensity={0.4} floatIntensity={0.6}>
      <mesh ref={meshRef} position={position}>
        <icosahedronGeometry args={[size, 1]} />
        <MeshDistortMaterial
          color={color}
          transparent
          opacity={0.35}
          distort={distort}
          speed={speed * 0.8}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
    </Float>
  );
}

function AnimatedTorus({ position, color, speed, size }: {
  position: [number, number, number];
  color: string;
  speed: number;
  size: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    meshRef.current.rotation.x = t * speed * 0.2;
    meshRef.current.rotation.y = t * speed * 0.3;
    meshRef.current.position.y = position[1] + Math.cos(t * speed * 0.4) * 0.2;
  });

  return (
    <Float speed={speed * 0.7} rotationIntensity={0.6} floatIntensity={0.4}>
      <mesh ref={meshRef} position={position}>
        <torusGeometry args={[size, size * 0.35, 16, 32]} />
        <MeshWobbleMaterial
          color={color}
          transparent
          opacity={0.25}
          factor={0.3}
          speed={speed}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>
    </Float>
  );
}

function FloatingParticles() {
  const particlesRef = useRef<THREE.Points>(null!);

  const { positions, colors } = useMemo(() => {
    const count = 120;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const primaryColor = new THREE.Color('hsl(162, 63%, 41%)');
    const accentColor = new THREE.Color('hsl(36, 95%, 56%)');

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;

      const c = Math.random() > 0.5 ? primaryColor : accentColor;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    return { positions, colors };
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    particlesRef.current.rotation.y = t * 0.02;
    particlesRef.current.rotation.x = Math.sin(t * 0.01) * 0.1;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

function GlowRing({ position, color, size }: {
  position: [number, number, number];
  color: string;
  size: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    meshRef.current.rotation.x = Math.PI * 0.5 + Math.sin(t * 0.3) * 0.2;
    meshRef.current.rotation.z = t * 0.15;
  });

  return (
    <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position}>
        <torusGeometry args={[size, 0.02, 16, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} />
      </mesh>
    </Float>
  );
}

export function HeroScene() {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} color="#ffffff" />
        <pointLight position={[-3, 2, 2]} intensity={0.5} color="hsl(162, 63%, 41%)" />
        <pointLight position={[3, -1, 3]} intensity={0.3} color="hsl(36, 95%, 56%)" />

        {/* Main shapes */}
        <AnimatedSphere position={[-3.2, 0.5, -1]} color="hsl(162, 63%, 50%)" speed={1.2} distort={0.4} size={0.9} />
        <AnimatedSphere position={[3.5, -0.3, -2]} color="hsl(36, 95%, 60%)" speed={0.8} distort={0.3} size={0.7} />
        <AnimatedSphere position={[-1.5, -1.5, -1.5]} color="hsl(162, 50%, 40%)" speed={1} distort={0.5} size={0.5} />

        <AnimatedTorus position={[2.8, 1.2, -1.5]} color="hsl(162, 63%, 45%)" speed={1.1} size={0.6} />
        <AnimatedTorus position={[-2.5, -1, -2]} color="hsl(36, 80%, 55%)" speed={0.9} size={0.45} />

        {/* Glow rings */}
        <GlowRing position={[0, 0, -3]} color="hsl(162, 63%, 41%)" size={2.5} />
        <GlowRing position={[1, -0.5, -2.5]} color="hsl(36, 95%, 56%)" size={1.5} />

        {/* Floating particles */}
        <FloatingParticles />
      </Canvas>
    </div>
  );
}
