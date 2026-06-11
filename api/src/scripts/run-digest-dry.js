require("dotenv").config();
require("../services/mongo");
const { runWeeklyDigest } = require("../jobs/weekly-digest");

(async () => {
  try {
    await runWeeklyDigest({ dryRun: true });
  } catch (e) {
    console.error("dry run threw:", e);
    process.exit(1);
  }
  process.exit(0);
})();
