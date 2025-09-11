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

app.use(
  cors({
    credentials: true,
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://findyourcofounder.nl/"]
        : ["http://localhost:3000", "http://localhost:3001"],
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
