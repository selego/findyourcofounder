/* eslint-disable no-undef */
const ENVIRONMENT = process.env.ENVIRONMENT || "development";
const PORT = process.env.PORT || 8080;
const MONGODB_ENDPOINT = process.env.MONGODB_ENDPOINT;
const SECRET = process.env.SECRET || "not-so-secret";
const APP_URL = ENVIRONMENT === "production" ? "https://findyourcofounder.nl/" : "http://localhost:3000";
const SENTRY_DSN = process.env.SENTRY_DSN || "";

const SENDINBLUE_API_KEY = "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";

const CONFIG = {
  ENVIRONMENT,
  PORT,
  MONGODB_ENDPOINT,
  SECRET,
  APP_URL,
  SENTRY_DSN,
  SENDINBLUE_API_KEY,
};

if (ENVIRONMENT === "development") console.log(CONFIG);

module.exports = CONFIG;
