import nodemailer from "nodemailer";
import { logger } from "../helpers/logger";

export const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
  //   from: process.env.MAIL_FROM,
});

export const verifyMailConnection = async () => {
  logger.info("Starting SMTP verification...");

  try {
    logger.info("Calling transporter.verify()...");

    await transporter.verify();

    logger.info("SMTP verification completed.");
  } catch (error) {
    logger.error("SMTP verification failed.");
    console.error(error);
    throw error;
  }
};
