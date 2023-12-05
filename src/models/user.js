import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MODELNAME = "user";

function getUser() {
  if (mongoose.models && mongoose.models[MODELNAME]) return mongoose.models[MODELNAME];

  const userSchema = new mongoose.Schema({
    first_name: { type: String, trim: true },
    last_name: { type: String, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: String,

    city: { type: String, trim: true },
    skills: { type: [String], default: [] },
    invest: { type: Number },
    jobless_date: { type: Date },
    linkedin: { type: String, trim: true },

    last_login_at: { type: Date, default: Date.now },
    created_at: { type: Date, default: Date.now },
    
    clicks: { type: Number, default: 0 },

    motivations: { type: String, trim: true },
    business: { type: String, trim: true },
    partner: { type: String, trim: true },
  });

  userSchema.pre("save", function (next) {
    if (this.isModified("password") || this.isNew) {
      bcrypt.hash(this.password, 10, (_, hash) => {
        this.password = hash;
        return next();
      });
    } else {
      return next();
    }
  });

  userSchema.methods.comparePassword = function (p) {
    return bcrypt.compare(p, this.password || "");
  };

  return mongoose.model(MODELNAME, userSchema);
}

const User = getUser();
export default User;
