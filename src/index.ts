import { initSentry } from "./logger";
import { handleRequest } from './handler'

addEventListener("fetch", (event) => {
  const sentry = initSentry(event);
  event.respondWith(handleRequest(event.request, sentry));
});