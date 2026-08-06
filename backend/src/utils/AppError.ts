export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Indicates predicted, operational errors (e.g., validation, not found) vs programming bugs

    Error.captureStackTrace(this, this.constructor);
  }
}
