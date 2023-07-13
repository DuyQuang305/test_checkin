import { Request, Response } from 'express';

export default function createResponse(
  res: Response,
  statusCode: number,
  success: boolean,
  message: string,
  data?: object | number | string,
  numberOfRecords?: number,
  numberOfPages?: number
) {
  return res.status(statusCode).json({ statusCode, success, message, data, numberOfRecords, numberOfPages });
}
