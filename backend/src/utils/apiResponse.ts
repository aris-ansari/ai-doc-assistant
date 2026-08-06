import { Response } from "express";

interface SuccessResponseParams<T> {
  res: Response;
  statusCode?: number;
  message: string;
  data?: T;
}

/**
 * Sends a standardized success HTTP response.
 */
export const sendSuccess = <T>({
  res,
  statusCode = 200,
  message,
  data = {} as T,
}: SuccessResponseParams<T>): Response => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Sends a standardized error HTTP response.
 */
export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  errors: any[] = [],
): Response => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};
