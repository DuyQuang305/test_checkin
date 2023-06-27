import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { Message } from '../common/constant/message';

export default function error(
  error: ErrorRequestHandler,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  res.status(500).send(Message.SomethingWrong + error.name);
}
