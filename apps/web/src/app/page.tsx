import Link from "next/link";
import {Suspense} from "react";

import {BodyPicture, FactList} from "@/components/body-content";
import {prepareModel} from "@/components/solar-model/prepare";
import {SolarSystemView} from "@/components/solar-model/view";
import {cachedSanity} from "@/sanity/live";
import {SOLAR_SYSTEM_QUERY} from "@/sanity/queries";

async function loadSolarSystem() {
  const {data} = await cachedSanity({
    query: SOLAR_SYSTEM_QUERY,
    perspective: "published",
    stega: false,
  });
  return data;
}

type SolarSystem = NonNullable<Awaited<ReturnType<typeof loadSolarSystem>>>;
type Body = NonNullable<NonNullable<SolarSystem["bodies"]>[number]>;
type Moon = NonNullable<Body["moons"]>[number];
type DisplayBody = Body | Moon;

export default function Home() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex w-full max-w-3xl flex-1 px-6 py-12">
          <p className="text-sm text-zinc-500">Solar system</p>
        </main>
      }
    >
      <SolarSystemPage />
    </Suspense>
  );
}

async function SolarSystemPage() {
  const solarSystem = await loadSolarSystem();

  const model = prepareModel(solarSystem?.bodies ?? null);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-6 py-12">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-medium tracking-wide text-zinc-500 uppercase">
          Solar system
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">
          {solarSystem?.name ?? "No solar system yet"}
        </h1>
      </header>
      {model.ok ? (
        <SolarSystemView planets={model.planets} star={model.star} />
      ) : (
        <p className="text-zinc-600 dark:text-zinc-400">{model.reason}</p>
      )}
      {solarSystem?.bodies?.length ? (
        <div className="flex flex-col gap-12">
          {solarSystem.bodies.map((body) =>
            body ? <BodySection body={body} key={body._id} /> : null,
          )}
        </div>
      ) : (
        <p className="text-zinc-600 dark:text-zinc-400">
          Publish a solar system in Sanity to see it here.
        </p>
      )}
    </main>
  );
}

function BodySection({
  body,
  nested = false,
}: {
  body: DisplayBody;
  nested?: boolean;
}) {
  return (
    <article className={nested ? "border-l border-zinc-200 pl-6 dark:border-zinc-800" : ""}>
      <div className="flex flex-col gap-4">
        <BodyPicture image={body.image} name={body.name} />
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-zinc-500 capitalize">{body.kind}</p>
          <h2 className={nested ? "text-2xl font-semibold" : "text-3xl font-semibold"}>
            {body.slug ? (
              <Link className="hover:underline" href={`/bodies/${body.slug}`}>
                {body.name}
              </Link>
            ) : (
              body.name
            )}
          </h2>
          {body.description ? (
            <p className="text-lg leading-8 text-zinc-700 dark:text-zinc-300">
              {body.description}
            </p>
          ) : null}
        </div>
        <FactList facts={body.facts} />
      </div>
      {"moons" in body && body.moons?.length ? (
        <div className="mt-8 flex flex-col gap-8">
          {body.moons.map((moon) => (
            <BodySection body={moon} key={moon._id} nested />
          ))}
        </div>
      ) : null}
    </article>
  );
}

