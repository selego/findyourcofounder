const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MODELNAME = "cofounder";

const Schema = new mongoose.Schema({
  app_country: { type: String, trim: true },
  first_name: { type: String, trim: true },
  last_name: { type: String, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  slug: String,
  password: String,
  forgot_password_reset_token: String,
  forgot_password_reset_expires: Date,

  city: { type: String, trim: true },
  skills: { type: [String], default: [] },
  invest: { type: Number },
  jobless_date: { type: Date },
  linkedin: { type: String, trim: true },

  last_login_at: { type: Date, default: Date.now },
  created_at: { type: Date, default: Date.now },

  approved: { type: Boolean, default: true },

  clicks: { type: Number, default: 0 },

  motivations: { type: String, trim: true },
  business: { type: String, trim: true },
  partner: { type: String, trim: true },
  deleted_at: { type: Date },
});

Schema.pre("save", function (next) {
  if (this.isModified("password") || this.isNew) {
    bcrypt.hash(this.password, 10, (e, hash) => {
      this.password = hash;
      return next();
    });
  } else {
    return next();
  }
});

Schema.methods.comparePassword = function (p) {
  return bcrypt.compare(p, this.password || "");
};

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
