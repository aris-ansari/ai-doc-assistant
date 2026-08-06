import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { verifyAccessToken } from "../utils/jwt";
import { asyncHandler } from "../utils/asyncHandler";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
  };
}

/**
 * Middleware to verify access token from HttpOnly cookies or Authorization header.
 * Attaches decoded user identity to the request object.
 */
export const authenticate = asyncHandler(
  async (
    req: AuthenticatedRequest,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    let token: string | undefined;

    if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    } else if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw new AppError("Authentication required. Please log in.", 401);
    }

    try {
      const decoded = verifyAccessToken(token);
      req.user = { userId: decoded.userId };
      next();
    } catch {
      throw new AppError("Invalid or expired access token", 401);
    }
  },
);
