import jwt, { Secret, SignOptions } from "jsonwebtoken";
export interface JwtPayload {
  userId: string;
}
const JWT_SECRET: Secret = process.env.JWT_SECRET!;

const options: SignOptions = {
  expiresIn: process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
};

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, options);
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};
