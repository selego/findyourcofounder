import { connect } from "mongoose";
const MONGO_URL = process.env.MONGO_URL;
import mongoose from "mongoose";

console.log("MONGO_URL", MONGO_URL);

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
