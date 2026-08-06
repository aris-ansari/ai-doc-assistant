import { Request, Response, NextFunction } from "express";

/**
 * Wraps async Express route handlers to automatically catch errors and pass them to the NextFunction.
 * This eliminates the need for repetitive try-catch blocks in every controller method.
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>,
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
