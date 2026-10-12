import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { env } from "../../config/env";
import { UnauthorizedError } from "../errors/unauthorized.error";
export interface JwtPayload {
  userId: string;
  tokenType: "access" | "refresh";
  exp?: number;
}
const JWT_SECRET: Secret = process.env.JWT_SECRET!;

const durationToMilliseconds = (duration: string): number => {
  const match = /^(\d+)(ms|s|m|h|d)$/i.exec(duration);
  if (!match) {
    throw new Error("JWT_REFRESH_EXPIRES_IN must use ms, s, m, h, or d units.");
  }

  const unitMilliseconds: Record<string, number> = {
    ms: 1,
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  return Number(match[1]) * unitMilliseconds[match[2].toLowerCase()];
};

export const REFRESH_TOKEN_COOKIE_MAX_AGE = durationToMilliseconds(
  env.jwtRefreshExpiresIn,
);

export const generateAccessToken = (userId: string): string => {
  return jwt.sign({ userId, tokenType: "access" }, JWT_SECRET, {
    expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"],
  });
};

export const generateRefreshToken = (
  userId: string,
  expiresAt?: number,
): string => {
  if (expiresAt !== undefined) {
    return jwt.sign(
      { userId, tokenType: "refresh", exp: expiresAt },
      JWT_SECRET,
    );
  }

  return jwt.sign({ userId, tokenType: "refresh" }, JWT_SECRET, {
    expiresIn: env.jwtRefreshExpiresIn as SignOptions["expiresIn"],
  });
};

const verifyToken = (
  token: string,
  tokenType: JwtPayload["tokenType"],
): JwtPayload => {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    if (payload.tokenType !== tokenType || typeof payload.userId !== "string") {
      throw new UnauthorizedError("Invalid authentication token.");
    }
    return payload;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw error;
    }
    throw new UnauthorizedError("Invalid or expired authentication token.");
  }
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return verifyToken(token, "access");
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  const payload = verifyToken(token, "refresh");
  if (typeof payload.exp !== "number") {
    throw new UnauthorizedError("Invalid refresh token.");
  }
  return payload;
};
