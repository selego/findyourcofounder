import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = "https://85fa202f087f8702bbde9f8a31c34ae6@o4510681942261760.ingest.de.sentry.io/4510681944162384";

Sentry.init({
  dsn: SENTRY_DSN,
  enabled: process.env.NODE_ENV === "production",
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.2,
});
