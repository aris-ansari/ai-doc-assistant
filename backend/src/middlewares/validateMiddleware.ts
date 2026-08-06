import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";
import { AppError } from "../utils/AppError";

/**
 * Middleware wrapper for validating incoming HTTP request bodies, queries, and params against Zod schemas.
 */
export const validate = (schema: AnyZodObject) => {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map(
          (err) => `${err.path.join(".")}: ${err.message}`,
        );
        return next(
          new AppError(`Validation failed: ${messages.join(", ")}`, 400),
        );
      }
      next(error);
    }
  };
};
