import "dotenv/config";
import app from "./app";
import { connectDatabase } from "./config/database";
import { logger } from "./shared/helpers/logger";
import { verifyMailConnection } from "./shared/email/transporter";
import http from "http";
import { initializeSocket } from "./modules/socket/socket";

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const startServer = async () => {
  await connectDatabase();
  await verifyMailConnection();
  initializeSocket(server);
  server.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
  });
};

startServer();
