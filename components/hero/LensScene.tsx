"use client";

import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const BLADE_COUNT = 9;
const CHAMPAGNE = "#8f2f42";
const CHAMPAGNE_LIGHT = "#a8465a";

function bladeShape(): THREE.Shape {
  const shape = new THREE.Shape();
  // An elongated, gently curved blade reminiscent of a real aperture blade.
  shape.moveTo(0, 0);
  shape.lineTo(2.6, 0.55);
  shape.quadraticCurveTo(3.2, 0.05, 2.6, -0.55);
  shape.lineTo(0, 0);
  return shape;
}

function ApertureBlades({ openness }: { openness: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const shape = useMemo(() => bladeShape(), []);
  const geometry = useMemo(
    () =>
      new THREE.ExtrudeGeometry(shape, {
        depth: 0.08,
        bevelEnabled: true,
        bevelThickness: 0.02,
        bevelSize: 0.02,
        bevelSegments: 2,
      }),
    [shape]
  );

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.z += delta * 0.05;
    }
  });

  const blades = useMemo(
    () =>
      Array.from({ length: BLADE_COUNT }, (_, i) => {
        const angle = (i / BLADE_COUNT) * Math.PI * 2;
        return { angle, key: i };
      }),
    []
  );

  return (
    <group ref={groupRef}>
      {blades.map(({ angle, key }) => (
        <group key={key} rotation={[0, 0, angle]}>
          <mesh
            geometry={geometry}
            position={[0.9 + openness * 0.55, 0, 0]}
            rotation={[0, 0, -0.65 + openness * 0.9]}
          >
            <meshStandardMaterial
              color={key % 2 === 0 ? CHAMPAGNE : "#1a1a1c"}
              metalness={0.75}
              roughness={0.28}
              emissive={CHAMPAGNE}
              emissiveIntensity={0.05}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function LensBarrel() {
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3.4, 0.14, 24, 96]} />
        <meshStandardMaterial color="#0f0f10" metalness={0.9} roughness={0.35} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3.4, 0.03, 16, 96]} />
        <meshStandardMaterial
          color={CHAMPAGNE_LIGHT}
          metalness={0.6}
          roughness={0.2}
          emissive={CHAMPAGNE}
          emissiveIntensity={0.4}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[2.85, 64]} />
        <meshPhysicalMaterial
          color="#050506"
          metalness={0.2}
          roughness={0.05}
          clearcoat={1}
          transparent
          opacity={0.75}
        />
      </mesh>
    </group>
  );
}

function Scene() {
  const [openness, setOpenness] = useState(0);
  const start = useRef<number | null>(null);

  useFrame(({ clock }) => {
    if (start.current === null) start.current = clock.getElapsedTime();
    const t = clock.getElapsedTime() - start.current;
    const progress = Math.min(t / 2.2, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    setOpenness(eased);
  });

  return (
    <group rotation={[0.5, 0, 0]}>
      <LensBarrel />
      <ApertureBlades openness={openness} />
      <ambientLight intensity={0.35} />
      <pointLight position={[6, 6, 8]} intensity={45} color={CHAMPAGNE_LIGHT} />
      <pointLight position={[-6, -4, 4]} intensity={20} color="#ffffff" />
    </group>
  );
}

/**
 * Signature hero element: a procedurally built camera aperture that opens
 * on load (blades sweeping outward) and drifts in a slow, ambient rotation.
 * Built entirely from primitive Three.js geometry — no external model
 * assets required, so it works offline and needs no CDN allowlisting.
 */
export function LensScene() {
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 9], fov: 42 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
