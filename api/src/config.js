/* eslint-disable no-undef */
const ENVIRONMENT = process.env.ENVIRONMENT || "development";
const PORT = process.env.PORT || 8080;
const MONGODB_ENDPOINT = process.env.MONGODB_ENDPOINT;
const SECRET = process.env.SECRET || "not-so-secret";
const APP_URL = ENVIRONMENT === "production" ? "https://findyourcofounder.nl/" : "http://localhost:3000";
const SENTRY_DSN = process.env.SENTRY_DSN || "";

const BREVO_KEY = process.env.BREVO_KEY || "";

const CONFIG = {
  ENVIRONMENT,
  PORT,
  MONGODB_ENDPOINT,
  SECRET,
  APP_URL,
  SENTRY_DSN,
  BREVO_KEY,
};

if (ENVIRONMENT === "development") console.log(CONFIG);

module.exports = CONFIG;
