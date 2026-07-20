import mongoose from "mongoose";
import { logger } from "../shared/helpers/logger";

export const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);

    logger.info("Connected to MongoDB");
  } catch (error) {
    logger.error("Failed to connect to MongoDB");
    process.exit(1);
  }
};
