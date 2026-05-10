import { defaultCache } from "@serwist/next/worker";
import { Serwist } from "serwist";

const swSelf = self as typeof self & {
  __SW_MANIFEST: Array<{ url: string; revision?: string }>;
};

const serwist = new Serwist({
  precacheEntries: swSelf.__SW_MANIFEST,
  runtimeCaching: defaultCache
});

serwist.addEventListeners();
