import { router } from "@/lib/tanstack-router";
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://0a901d9b12fdee2b7a3ba5658040e423@o4508233911959552.ingest.de.sentry.io/4511681496023120",
  dataCollection: {
    // To disable sending user data and HTTP bodies, uncomment the lines below. For more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/react/configuration/options/#dataCollection
    // userInfo: false,
    // httpBodies: []
  },
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
    Sentry.tanstackRouterBrowserTracingIntegration(router),
  ],
  // Tracing
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.,
  // Enable logs to be sent to Sentry
  enableLogs: true,
});
Sentry.metrics.count("button_click", 1);
Sentry.metrics.gauge("page_load_time", 150);
Sentry.metrics.distribution("response_time", 200);
