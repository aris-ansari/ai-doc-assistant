import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { sendError } from "../utils/apiResponse";
import { env } from "../config/env";

/**
 * Centralized error-handling middleware for Express.
 * Catches operational and uncaught errors, formatting them into standardized JSON API responses.
 */
export const errorMiddleware = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  let statusCode = 500;
  let message = "Internal Server Error";
  let errors: any[] = [];

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation Error";
    errors = [err.message];
  } else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token. Please log in again.";
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired. Please log in again.";
  } else if (err instanceof Error) {
    message =
      env.NODE_ENV === "development" ? err.message : "Internal Server Error";
  }

  sendError(res, statusCode, message, errors);
};
