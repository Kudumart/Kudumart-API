import * as Sentry from "@sentry/node";

Sentry.init({
	dsn: "https://6983a94d1dea63bc2bfbecc5c0c06e23@o4509724637003776.ingest.us.sentry.io/4509724642050048",

	environment: process.env.NODE_ENV,

	sendDefaultPii: true,
});
