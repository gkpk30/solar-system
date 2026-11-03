"use client";

import dynamic from "next/dynamic";

import type {ModelBody} from "./prepare";

const SolarSystemModel = dynamic(
  () => import("./scene").then((mod) => mod.SolarSystemModel),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[28rem] items-center justify-center rounded-lg bg-zinc-950">
        <p className="text-sm text-zinc-400">Solar system</p>
      </div>
    ),
  },
);

export function SolarSystemView({star, planets}: {star: ModelBody; planets: ModelBody[]}) {
  return <SolarSystemModel planets={planets} star={star} />;
}
