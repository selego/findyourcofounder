import { connect } from "mongoose";
const MONGO_URL = process.env.MONGO_URL || "mongodb+srv://selegoff:PyUgkMIXpK9ctyRA@prod.3vzc2zi.mongodb.net/db";
import mongoose from "mongoose";

// TODO: remove unused
const connectMongoDB = async () => {
  if (!MONGO_URL) {
    console.log("ERROR CONNEXION. MONGO URL EMPTY");
    return;
  }

  try {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to MongoDB.");
  } catch (error) {
    console.log(error);
  }
};

export default connectMongoDB;
