import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere, Torus, Box, Icosahedron, Environment, Stars, Trail } from "@react-three/drei";
import { useRef, useMemo, useCallback } from "react";
import * as THREE from "three";

function FloatingOrb({ position, color, speed = 1, size = 1 }: { position: [number, number, number]; color: string; speed?: number; size?: number }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * speed * 0.3) * 0.3;
      ref.current.rotation.y += 0.005 * speed;
      const s = 1 + Math.sin(state.clock.elapsedTime * speed * 0.5) * 0.05;
      ref.current.scale.setScalar(s);
    }
  });

  return (
    <Float speed={speed} rotationIntensity={0.4} floatIntensity={1.5}>
      <Trail width={2} length={6} color={color} attenuation={(w) => w * w}>
        <Sphere ref={ref} args={[size, 64, 64]} position={position}>
          <MeshDistortMaterial color={color} roughness={0.15} metalness={0.85} distort={0.35} speed={2.5} emissive={color} emissiveIntensity={0.15} />
        </Sphere>
      </Trail>
    </Float>
  );
}

function FloatingRing({ position, color, speed = 1 }: { position: [number, number, number]; color: string; speed?: number }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * speed * 0.2;
      ref.current.rotation.z = Math.sin(state.clock.elapsedTime * speed * 0.15) * 0.5;
    }
  });

  return (
    <Float speed={speed * 0.8} rotationIntensity={0.6} floatIntensity={1}>
      <Torus ref={ref} args={[1, 0.12, 16, 64]} position={position}>
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.95} emissive={color} emissiveIntensity={0.1} />
      </Torus>
    </Float>
  );
}

function FloatingCube({ position, color, speed = 1 }: { position: [number, number, number]; color: string; speed?: number }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * speed * 0.15;
      ref.current.rotation.y = state.clock.elapsedTime * speed * 0.2;
    }
  });

  return (
    <Float speed={speed * 0.6} rotationIntensity={0.8} floatIntensity={0.8}>
      <Box ref={ref} args={[0.8, 0.8, 0.8]} position={position}>
        <meshStandardMaterial color={color} roughness={0.1} metalness={0.95} wireframe emissive={color} emissiveIntensity={0.2} />
      </Box>
    </Float>
  );
}

function FloatingGem({ position, color, speed = 1 }: { position: [number, number, number]; color: string; speed?: number }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * speed * 0.3;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * speed * 0.2) * 0.4;
    }
  });

  return (
    <Float speed={speed} rotationIntensity={0.5} floatIntensity={1.2}>
      <Trail width={1.5} length={4} color={color} attenuation={(w) => w * w}>
        <Icosahedron ref={ref} args={[0.7, 1]} position={position}>
          <meshStandardMaterial color={color} roughness={0.08} metalness={0.92} flatShading emissive={color} emissiveIntensity={0.12} />
        </Icosahedron>
      </Trail>
    </Float>
  );
}

function HorizonRing({ radius = 3, speed = 0.3, color = "#e8634a" }: { radius?: number; speed?: number; color?: string }) {
  const ref = useRef<THREE.Group>(null);
  const dotRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * speed;
    }
    if (dotRef.current) {
      const angle = state.clock.elapsedTime * speed * 2;
      dotRef.current.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
    }
  });

  return (
    <group ref={ref} rotation={[Math.PI / 4, 0, Math.PI / 6]}>
      <Torus args={[radius, 0.015, 8, 128]} rotation={[Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color={color} transparent opacity={0.2} />
      </Torus>
      <Sphere ref={dotRef} args={[0.08, 16, 16]}>
        <meshBasicMaterial color={color} />
      </Sphere>
    </group>
  );
}

function Particles() {
  const count = 350;
  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const palette = [
      new THREE.Color("#e8634a"),
      new THREE.Color("#2bb5a0"),
      new THREE.Color("#8b5cf6"),
      new THREE.Color("#f59e0b"),
    ];
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 25;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 25;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 25;
      const c = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return { positions: pos, colors: col };
  }, []);

  const ref = useRef<THREE.Points>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.015;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.008) * 0.15;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} vertexColors transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}

function MouseCamera() {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3(0, 0, 8));

  const handlePointerMove = useCallback((e: THREE.Event) => {
    // empty — mouse tracking via useFrame
  }, []);

  useFrame((state) => {
    const x = (state.pointer.x * 0.5);
    const y = (state.pointer.y * 0.3);
    target.current.set(x, y, 8);
    camera.position.lerp(target.current, 0.02);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

export default function Scene3D({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }} dpr={[1, 1.5]}>
        <fog attach="fog" args={["hsl(230, 15%, 8%)", 8, 25]} />
        <ambientLight intensity={0.25} />
        <pointLight position={[5, 5, 5]} intensity={1.2} color="#e8634a" distance={20} decay={2} />
        <pointLight position={[-5, -3, 3]} intensity={0.8} color="#2bb5a0" distance={18} decay={2} />
        <pointLight position={[0, 5, -5]} intensity={0.5} color="#8b5cf6" distance={15} decay={2} />
        <pointLight position={[3, -4, 2]} intensity={0.4} color="#f59e0b" distance={12} decay={2} />

        <FloatingOrb position={[-3, 1.5, -2]} color="#e8634a" speed={0.8} size={0.9} />
        <FloatingOrb position={[3.5, -1, -3]} color="#2bb5a0" speed={1.2} size={0.6} />
        <FloatingOrb position={[0, 3, -4]} color="#8b5cf6" speed={0.6} size={0.5} />
        <FloatingOrb position={[-1.5, -2.5, -5]} color="#f59e0b" speed={0.9} size={0.4} />

        <FloatingRing position={[-2, -2, -1]} color="#e8634a" speed={0.7} />
        <FloatingRing position={[4, 2, -3]} color="#2bb5a0" speed={0.9} />

        <FloatingCube position={[2, -1.5, -2]} color="#e8634a" speed={1} />
        <FloatingCube position={[-4, 0, -4]} color="#8b5cf6" speed={0.5} />

        <FloatingGem position={[1, 2.5, -1]} color="#2bb5a0" speed={0.8} />
        <FloatingGem position={[-1.5, -3, -3]} color="#e8634a" speed={1.1} />

        <HorizonRing radius={4} speed={0.15} color="#e8634a" />
        <HorizonRing radius={5.5} speed={-0.1} color="#2bb5a0" />

        <Stars radius={30} depth={50} count={1500} factor={3} saturation={0.5} fade speed={0.5} />
        <Particles />
        <MouseCamera />
      </Canvas>
    </div>
  );
}
