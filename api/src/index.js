/* eslint-disable no-undef */
require("dotenv").config();
const cors = require("cors");
const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const { initSentry, setupErrorHandler } = require("./services/sentry");
const { PORT, ENVIRONMENT, APP_URL } = require("./config");

const app = express();
initSentry(app);

if (ENVIRONMENT === "development") {
  app.use(morgan("tiny"));
}

require("./services/mongo");

const allowedOrigins =
  ENVIRONMENT === "production"
    ? [
        "https://findyourcofounder.nl",
        "https://findyourcofounder.nl/",
        "https://www.findyourcofounder.es",
        "https://www.findyourcofounder.es/",
      ]
    : ["http://localhost:3000", "http://localhost:3001"];

console.log("🔧 CORS Configuration:");
console.log("  - Environment:", ENVIRONMENT);
console.log("  - Allowed origins:", allowedOrigins);

app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      // Log pour production aussi (temporairement pour debug)
      console.log("📥 Incoming request from origin:", origin);

      // Allow requests with no origin
      if (!origin) {
        console.log("✅ Request allowed (no origin)");
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        console.log("✅ Request allowed (origin in whitelist)");
        callback(null, true);
      } else {
        console.log("❌ CORS BLOCKED");
        console.log("   Received origin:", origin);
        console.log("   Allowed origins:", allowedOrigins);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "App-Country",
      "cache-control",
      "x-requested-with",
      "accept",
      "origin",
    ],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    maxAge: 86400, // 24 heures
  }),
);
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const lastDeployedAt = new Date();
app.get("/", async (req, res) => {
  res.status(200).send({
    name: "api",
    environment: ENVIRONMENT,
    last_deployed_at: lastDeployedAt.toLocaleString(),
  });
});

app.use("/user", require("./controllers/user"));
app.use("/file", require("./controllers/file"));
app.use("/cofounder", require("./controllers/cofounder"));

setupErrorHandler(app);
require("./services/passport")(app);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
