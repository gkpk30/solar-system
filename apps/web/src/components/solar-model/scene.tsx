"use client";

import {Billboard, OrbitControls, Text, useTexture} from "@react-three/drei";
import {Canvas, useFrame, type ThreeEvent} from "@react-three/fiber";
import {useRouter} from "next/navigation";
import {Suspense, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject} from "react";
import * as THREE from "three";

import type {ModelBody} from "./prepare";
import {ORBIT_DAYS_PER_SECOND, SPIN_DAYS_PER_SECOND} from "./scale";

function Clock({
  pausedRef,
  timeRef,
}: {
  pausedRef: RefObject<boolean>;
  timeRef: RefObject<number>;
}) {
  useFrame((_, delta) => {
    if (!pausedRef.current) timeRef.current += delta;
  });
  return null;
}

function OrbitPath({
  distance,
  eccentricity,
  inclination,
}: {
  distance: number;
  eccentricity: number;
  inclination: number;
}) {
  const line = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const stretch = Math.sqrt(Math.max(0, 1 - eccentricity * eccentricity));
    for (let step = 0; step <= 128; step += 1) {
      const angle = (step / 128) * Math.PI * 2;
      points.push(
        new THREE.Vector3(
          distance * (Math.cos(angle) - eccentricity),
          0,
          distance * stretch * Math.sin(angle),
        ),
      );
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: "#a1a1aa",
      transparent: true,
      opacity: 0.45,
    });
    return new THREE.Line(geometry, material);
  }, [distance, eccentricity]);

  useEffect(() => {
    return () => {
      line.geometry.dispose();
      line.material.dispose();
    };
  }, [line]);

  return (
    <group rotation={[THREE.MathUtils.degToRad(inclination), 0, 0]}>
      <primitive object={line} />
    </group>
  );
}

function Revolving({
  body,
  timeRef,
  children,
}: {
  body: ModelBody;
  timeRef: RefObject<number>;
  children: ReactNode;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    const orbit = body.orbit;
    if (!orbit || !ref.current) return;
    const angle =
      body.phase + (timeRef.current * ORBIT_DAYS_PER_SECOND * Math.PI * 2) / orbit.periodDays;
    const stretch = Math.sqrt(Math.max(0, 1 - orbit.eccentricity * orbit.eccentricity));
    ref.current.position.set(
      orbit.distance * (Math.cos(angle) - orbit.eccentricity),
      0,
      orbit.distance * stretch * Math.sin(angle),
    );
  });
  return <group ref={ref}>{children}</group>;
}

function Spinning({
  body,
  timeRef,
  children,
}: {
  body: ModelBody;
  timeRef: RefObject<number>;
  children: ReactNode;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!ref.current) return;
    const periodDays = body.rotationPeriodHours / 24;
    ref.current.rotation.y =
      body.phase + (timeRef.current * SPIN_DAYS_PER_SECOND * Math.PI * 2) / periodDays;
  });
  return <group ref={ref}>{children}</group>;
}

function openBody(event: ThreeEvent<MouseEvent>, slug: string, go: (slug: string) => void) {
  event.stopPropagation();
  go(slug);
}

function pointerOver(event: ThreeEvent<PointerEvent>) {
  event.stopPropagation();
  document.body.style.cursor = "pointer";
}

function pointerOut() {
  document.body.style.cursor = "auto";
}

function TexturedSphere({
  url,
  radius,
  slug,
  go,
}: {
  url: string;
  radius: number;
  slug: string;
  go: (slug: string) => void;
}) {
  const texture = useTexture(url);
  texture.colorSpace = THREE.SRGBColorSpace;
  return (
    <mesh
      onClick={(event) => openBody(event, slug, go)}
      onPointerOut={pointerOut}
      onPointerOver={pointerOver}
    >
      <sphereGeometry args={[radius, 48, 32]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
}

function BodySphere({
  body,
  go,
}: {
  body: ModelBody;
  go: (slug: string) => void;
}) {
  if (!body.textureUrl) {
    return (
      <mesh
        onClick={(event) => openBody(event, body.slug, go)}
        onPointerOut={pointerOut}
        onPointerOver={pointerOver}
      >
        <sphereGeometry args={[body.radius, 48, 32]} />
        <meshBasicMaterial color="#a1a1aa" />
      </mesh>
    );
  }

  return (
    <Suspense
      fallback={
        <mesh>
          <sphereGeometry args={[body.radius, 48, 32]} />
          <meshBasicMaterial color="#52525b" />
        </mesh>
      }
    >
      <TexturedSphere go={go} radius={body.radius} slug={body.slug} url={body.textureUrl} />
    </Suspense>
  );
}

function BodyLabel({body, go}: {body: ModelBody; go: (slug: string) => void}) {
  return (
    <Billboard position={[0, body.radius + 0.28, 0]}>
      <Text
        anchorY="bottom"
        color="white"
        fontSize={body.kind === "star" ? 2.4 : body.kind === "planet" ? 1.8 : 0.9}
        onClick={(event) => openBody(event, body.slug, go)}
        onPointerOut={pointerOut}
        onPointerOver={pointerOver}
      >
        {body.name}
      </Text>
    </Billboard>
  );
}

function Rings({body, go}: {body: ModelBody; go: (slug: string) => void}) {
  if (!body.rings) return null;
  return (
    <mesh
      onClick={(event) => openBody(event, body.slug, go)}
      onPointerOut={pointerOut}
      onPointerOver={pointerOver}
      rotation={[Math.PI / 2, 0, 0]}
    >
      <ringGeometry args={[body.rings.inner, body.rings.outer, 96]} />
      <meshBasicMaterial color="#e7e5e4" opacity={0.8} side={THREE.DoubleSide} transparent />
    </mesh>
  );
}

function PlacedBody({
  body,
  timeRef,
  go,
}: {
  body: ModelBody;
  timeRef: RefObject<number>;
  go: (slug: string) => void;
}) {
  const placed = (
    <group rotation={[THREE.MathUtils.degToRad(body.axialTiltDegrees), 0, 0]}>
      <Spinning body={body} timeRef={timeRef}>
        <BodySphere body={body} go={go} />
      </Spinning>
      <BodyLabel body={body} go={go} />
      <Rings body={body} go={go} />
      {body.moons.map((moon) => (
        <PlacedBody body={moon} go={go} key={moon.id} timeRef={timeRef} />
      ))}
    </group>
  );

  if (!body.orbit) return placed;

  return (
    <>
      <OrbitPath
        distance={body.orbit.distance}
        eccentricity={body.orbit.eccentricity}
        inclination={body.orbit.inclinationDegrees}
      />
      <group rotation={[THREE.MathUtils.degToRad(body.orbit.inclinationDegrees), 0, 0]}>
        <Revolving body={body} timeRef={timeRef}>
          {placed}
        </Revolving>
      </group>
    </>
  );
}

export function SolarSystemModel({
  star,
  planets,
}: {
  star: ModelBody;
  planets: ModelBody[];
}) {
  const router = useRouter();
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const timeRef = useRef(0);
  pausedRef.current = paused;

  function go(slug: string) {
    router.push(`/bodies/${slug}`);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="h-[28rem] overflow-hidden rounded-lg bg-zinc-950">
        <Canvas camera={{fov: 45, position: [0, 28, 70]}} dpr={[1, 1.5]}>
          <color args={["#09090b"]} attach="background" />
          <Clock pausedRef={pausedRef} timeRef={timeRef} />
          <PlacedBody body={star} go={go} timeRef={timeRef} />
          {planets.map((planet) => (
            <PlacedBody body={planet} go={go} key={planet.id} timeRef={timeRef} />
          ))}
          <OrbitControls enablePan={false} maxDistance={180} minDistance={8} />
        </Canvas>
      </div>
      <div className="flex items-center justify-between gap-4 text-sm text-zinc-600 dark:text-zinc-400">
        <p>Drag to look around. Scroll to zoom. Choose a body to open its page.</p>
        <button
          className="shrink-0 rounded-md border border-zinc-300 px-3 py-1.5 dark:border-zinc-700"
          onClick={() => setPaused((current) => !current)}
          type="button"
        >
          {paused ? "Play" : "Pause"}
        </button>
      </div>
    </div>
  );
}
