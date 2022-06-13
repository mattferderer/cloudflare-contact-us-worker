// Based off https://github.com/cloudflare/worker-sentry/blob/1b0f10005114cf41987043c928507f1adca4f25b/index.js
declare const SENTRY_DSN: string

import Toucan from 'toucan-js'

export function initSentry(event: FetchEvent): Toucan {
  const request = event.request;

  const sentry = new Toucan({
    dsn: SENTRY_DSN,
    event: event,
    allowedHeaders: [
      'user-agent',
      'cf-challenge',
      'accept-encoding',
      'accept-language',
      'cf-ray',
      'content-length',
      'content-type',
      'x-real-ip',
      'host',
    ],
    allowedSearchParams: /(.*)/,
    rewriteFrames: {
      root: '/',
    },
  });
  const colo = request.cf && request.cf.colo ? request.cf.colo : 'UNKNOWN';
  sentry.setTag('colo', colo);

  // fallback to XFF if CF-Connecting-IP is not set
  const ipAddress = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for');
  const userAgent = request.headers.get('user-agent') || '';
  sentry.setUser({ ip: ipAddress, userAgent: userAgent, colo: colo });
  return sentry;
}
