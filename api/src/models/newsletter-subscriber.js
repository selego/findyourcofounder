const mongoose = require("mongoose");

const MODELNAME = "newsletter_subscriber";

const Schema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, trim: true },
  source: { type: String, enum: ["footer"], default: "footer" },
  created_at: { type: Date, default: Date.now },
  unsubscribed_at: { type: Date, default: null },
  last_sent_at: { type: Date, default: null },
});

Schema.index({ email: 1 }, { unique: true });
Schema.index({ unsubscribed_at: 1 });

module.exports = mongoose.model(MODELNAME, Schema);
