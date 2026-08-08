import type { Response } from "express";

interface SuccessResponseParams<T> {
  res: Response;
  statusCode?: number;
  message: string;
  data?: T;
}

export const sendSuccess = <T>({
  res,
  statusCode = 200,
  message,
  data = {} as T,
}: SuccessResponseParams<T>): Response => {
  return res.status(statusCode).json({
    success: true,
    statusCode,
    message,
    data,
  });
};

export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  errors: string[] = [],
): Response => {
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors,
  });
};
