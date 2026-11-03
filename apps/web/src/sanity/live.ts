import {cacheLife} from "next/cache";
import {defineLive, type StrictDefinedFetchType} from "next-sanity/live";

import {client} from "./client";

const token = process.env.SANITY_API_READ_TOKEN;

export const {sanityFetch, SanityLive} = defineLive({
  client,
  serverToken: token || false,
  browserToken: token || false,
  strict: true,
});

// Published edits show up on the next request after this window, without a new deploy.
const publishedContentCache = {
  stale: 0,
  revalidate: 30,
  expire: 60,
};

export const cachedSanity: StrictDefinedFetchType = async (options) => {
  "use cache";
  const result = await sanityFetch(options);
  // sanityFetch sets a year-long lifetime. The shorter one wins, so call this after.
  cacheLife(publishedContentCache);
  return result;
};
