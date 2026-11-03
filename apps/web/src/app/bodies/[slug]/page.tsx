import type {Metadata} from "next";
import Link from "next/link";
import {Suspense} from "react";
import {notFound} from "next/navigation";

import {BodyPicture, FactList} from "@/components/body-content";
import {client} from "@/sanity/client";
import {cachedSanity} from "@/sanity/live";
import {BODY_QUERY, BODY_SLUGS_QUERY} from "@/sanity/queries";

async function loadBody(slug: string) {
  const {data} = await cachedSanity({
    query: BODY_QUERY,
    params: {slug},
    perspective: "published",
    stega: false,
  });
  return data;
}

export async function generateStaticParams() {
  const slugs = await client.fetch(BODY_SLUGS_QUERY);
  return slugs.map((slug) => ({slug}));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{slug: string}>;
}): Promise<Metadata> {
  const body = await loadBody((await params).slug);
  return {title: body?.name ?? "Body"};
}

export default function BodyPage({params}: {params: Promise<{slug: string}>}) {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex w-full max-w-3xl flex-1 px-6 py-12">
          <p className="text-sm font-medium text-zinc-500">Solar system</p>
        </main>
      }
    >
      <PublishedBody params={params} />
    </Suspense>
  );
}

async function PublishedBody({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params;
  const body = await loadBody(slug);
  if (!body) notFound();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
      <Link className="text-sm font-medium text-zinc-500 hover:underline" href="/">
        Solar system
      </Link>
      <article className="flex flex-col gap-4">
        <BodyPicture image={body.image} name={body.name} />
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-zinc-500 capitalize">{body.kind}</p>
          <h1 className="text-4xl font-semibold tracking-tight">{body.name}</h1>
          {body.orbits?.slug ? (
            <p className="text-zinc-600 dark:text-zinc-400">
              Orbits{" "}
              <Link className="font-medium hover:underline" href={`/bodies/${body.orbits.slug}`}>
                {body.orbits.name}
              </Link>
            </p>
          ) : null}
          {body.description ? (
            <p className="text-lg leading-8 text-zinc-700 dark:text-zinc-300">
              {body.description}
            </p>
          ) : null}
        </div>
        <FactList facts={body.facts} />
      </article>
      {body.moons?.length ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-semibold">Moons</h2>
          <ul className="flex flex-col gap-2">
            {body.moons.map((moon) =>
              moon.slug ? (
                <li key={moon._id}>
                  <Link className="text-lg hover:underline" href={`/bodies/${moon.slug}`}>
                    {moon.name}
                  </Link>
                </li>
              ) : null,
            )}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
