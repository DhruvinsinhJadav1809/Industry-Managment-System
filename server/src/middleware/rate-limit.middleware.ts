import rateLimit, { ipKeyGenerator } from "express-rate-limit";

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 500, // Max 50 requests

  standardHeaders: "draft-7",
  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 3,

  standardHeaders: "draft-7",
  legacyHeaders: false,

  keyGenerator: (req) => {
    const email = String(req.body?.email ?? "")
      .trim()
      .toLowerCase();

    const ip = ipKeyGenerator(req.ip ?? "unknown");

    return `${email}:${ip}`;
  },

  message: {
    success: false,
    message: "Too many login attempts. Please try again later.",
  },
});
