"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function DustParticles({ count = 200 }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 20;
      const y = (Math.random() - 0.5) * 20;
      const z = (Math.random() - 0.5) * 10 - 5;
      const speed = Math.random() * 0.01 + 0.002;
      const factor = Math.random() * 100;
      temp.push({ x, y, z, speed, factor });
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    if (!mesh.current) return;
    
    particles.forEach((particle, i) => {
      const t = state.clock.elapsedTime * particle.speed + particle.factor;
      
      // Slow drifting motion
      dummy.position.set(
        particle.x + Math.sin(t) * 2,
        particle.y + Math.cos(t * 0.8) * 2,
        particle.z
      );
      dummy.rotation.set(t, t, t);
      
      // Subtle pulsing scale
      const s = 0.5 + Math.sin(t * 2) * 0.2;
      dummy.scale.set(s, s, s);
      
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <circleGeometry args={[0.02, 8]} />
      <meshBasicMaterial color="#FF7A1A" transparent opacity={0.15} blending={THREE.AdditiveBlending} depthWrite={false} />
    </instancedMesh>
  );
}

export function Particles() {
  return (
    <div className="fixed inset-0 pointer-events-none -z-40">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <DustParticles />
      </Canvas>
    </div>
  );
}
