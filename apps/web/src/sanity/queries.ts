import {defineQuery} from "next-sanity";

const imageFields = /* groq */ `
  alt,
  hotspot,
  crop,
  asset->{
    _id,
    metadata{
      lqip,
      dimensions{width, height}
    }
  }
`;

export const BODY_SLUGS_QUERY = defineQuery(/* groq */ `
  *[_type == "body" && defined(slug.current)].slug.current
`);

export const BODY_QUERY = defineQuery(/* groq */ `
  *[_type == "body" && slug.current == $slug][0]{
    _id,
    name,
    "slug": slug.current,
    kind,
    description,
    facts[]{_key, name, value},
    image{${imageFields}},
    orbits->{
      name,
      "slug": slug.current
    },
    "moons": *[_type == "body" && kind == "moon" && orbits._ref == ^._id] | order(name asc){
      _id,
      name,
      "slug": slug.current
    }
  }
`);

export const SOLAR_SYSTEM_QUERY = defineQuery(/* groq */ `
  *[_type == "solarSystem"][0]{
    _id,
    name,
    bodies[]->{
      _id,
      name,
      "slug": slug.current,
      kind,
      description,
      facts[]{_key, name, value},
      image{${imageFields}},
      "moons": *[_type == "body" && kind == "moon" && orbits._ref == ^._id] | order(name asc){
        _id,
        name,
        "slug": slug.current,
        kind,
        description,
        facts[]{_key, name, value},
        image{${imageFields}}
      }
    }
  }
`);
