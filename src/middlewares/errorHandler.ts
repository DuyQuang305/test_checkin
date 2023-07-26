import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { Message } from '../common/constant/message';

export default function errorHandler(
  err,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const errStatus = err.statusCode || 500;
  const errMsg = err.message || 'Something went wrong';
  res.status(errStatus).json({
    success: false,
    status: errStatus,
    message: errMsg,
  });
}
