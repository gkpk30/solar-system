import {Image} from "next-sanity/image";

import {urlFor} from "@/sanity/image";

type BodyImage = {
  alt: string | null;
  asset: {
    metadata: {
      lqip: string | null;
      dimensions: {
        width: number | null;
        height: number | null;
      } | null;
    } | null;
  } | null;
} | null;

type Fact = {
  _key: string;
  name: string | null;
  value: string | null;
};

export function BodyPicture({image, name}: {image: BodyImage; name: string | null}) {
  const dimensions = image?.asset?.metadata?.dimensions;
  if (!image?.asset || !dimensions?.width || !dimensions.height) return null;

  return (
    <Image
      alt={image.alt || name || ""}
      blurDataURL={image.asset.metadata?.lqip || undefined}
      className="h-auto w-full rounded-lg bg-zinc-100 dark:bg-zinc-900"
      height={dimensions.height}
      placeholder={image.asset.metadata?.lqip ? "blur" : "empty"}
      src={urlFor(image).width(1200).url()}
      width={dimensions.width}
    />
  );
}

export function FactList({facts}: {facts: Fact[] | null}) {
  if (!facts?.length) return null;

  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {facts.map((fact) => (
        <div key={fact._key}>
          <dt className="text-sm text-zinc-500">{fact.name}</dt>
          <dd className="font-medium">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}
