import "dotenv/config";
import app from "./app";
import { connectDatabase } from "./config/database";
import { logger } from "./shared/helpers/logger";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDatabase();

  app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
  });
};

startServer();
