import {defineLive, type StrictDefinedFetchType} from "next-sanity/live";

import {client} from "./client";

const token = process.env.SANITY_API_READ_TOKEN;

export const {sanityFetch, SanityLive} = defineLive({
  client,
  serverToken: token || false,
  browserToken: token || false,
  strict: true,
});

export const cachedSanity: StrictDefinedFetchType = async (options) => {
  "use cache";
  return sanityFetch(options);
};
