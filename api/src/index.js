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
    ? ["https://findyourcofounder.nl", "https://findyourcofounder.nl/"]
    : ["http://localhost:3000", "http://localhost:3001"];

console.log("🔧 CORS Configuration:");
console.log("  - Environment:", ENVIRONMENT);
console.log("  - Allowed origins:", allowedOrigins);

// Log incoming requests for CORS debugging (only in development or when needed)
if (ENVIRONMENT === "development") {
  app.use((req, res, next) => {
    console.log("📨 Incoming request:");
    console.log("  - Method:", req.method);
    console.log("  - Path:", req.path);
    console.log("  - Origin header:", req.headers.origin || "NOT SET");
    console.log("  - Referer header:", req.headers.referer || "NOT SET");
    console.log("  - Host header:", req.headers.host || "NOT SET");
    console.log("  - User-Agent:", req.headers["user-agent"]?.substring(0, 50) || "NOT SET");
    next();
  });
}

app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      if (ENVIRONMENT === "development") {
        console.log("🔍 CORS check - origin:", origin);
      }

      // Allow requests with no origin (like mobile apps, Postman, or server-to-server)
      if (!origin) {
        if (ENVIRONMENT === "development") {
          console.log("✅ CORS: Request allowed (no origin header)");
        }
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        if (ENVIRONMENT === "development") {
          console.log("✅ CORS: Request allowed (origin in whitelist)");
        }
        callback(null, true);
      } else {
        // Always log blocked requests, even in production
        console.log("❌ CORS: Request BLOCKED (origin not in whitelist)");
        console.log("   Received origin:", origin);
        console.log("   Allowed origins:", allowedOrigins);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "App-Country"],
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
