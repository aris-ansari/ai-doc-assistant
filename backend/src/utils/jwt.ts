import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";

export interface TokenPayload {
  userId: string;
}

/**
 * Generates signed access and refresh JWT tokens for a given user ID.
 */
export const generateTokens = (
  userId: string,
): { accessToken: string; refreshToken: string } => {
  const payload: TokenPayload = { userId };

  const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET as Secret, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"],
  });

  const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET as Secret, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"],
  });

  return { accessToken, refreshToken };
};

/**
 * Verifies an access token and returns its decoded payload.
 */
export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET as Secret) as TokenPayload;
};

/**
 * Verifies a refresh token and returns its decoded payload.
 */
export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET as Secret) as TokenPayload;
};
