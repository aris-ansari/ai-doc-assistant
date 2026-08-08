import { Request, Response } from "express";
import { authService } from "../services/authService.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AuthenticatedRequest } from "../middlewares/authMiddleware.js";
import { env } from "../config/env.js";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const,
};

export class AuthController {
  register = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { name, email, password } = req.body;
      const { user, accessToken, refreshToken } = await authService.register(
        name,
        email,
        password,
      );

      res.cookie("accessToken", accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 15 * 60 * 1000,
      });
      res.cookie("refreshToken", refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      sendSuccess({
        res,
        statusCode: 201,
        message: "User registered successfully",
        data: { user },
      });
    },
  );

  login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.login(
      email,
      password,
    );

    res.cookie("accessToken", accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    sendSuccess({
      res,
      message: "Login successful",
      data: { user },
    });
  });

  refresh = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
    const tokens = await authService.refreshAccessToken(refreshToken);

    res.cookie("accessToken", tokens.accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", tokens.refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    sendSuccess({
      res,
      message: "Tokens refreshed successfully",
      data: {},
    });
  });

  logout = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    res.clearCookie("accessToken", COOKIE_OPTIONS);
    res.clearCookie("refreshToken", COOKIE_OPTIONS);

    sendSuccess({
      res,
      message: "Logged out successfully",
    });
  });

  getMe = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const user = await authService.getCurrentUser(req.user!.userId);

      sendSuccess({
        res,
        message: "Fetched profile successfully",
        data: { user },
      });
    },
  );
}

export const authController = new AuthController();
