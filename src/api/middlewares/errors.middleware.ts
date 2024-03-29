import { NextFunction, Request, Response } from 'express';
import 'express-async-errors';

export const ErrorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error) {
    console.log({ error });
    res.status(500).json({ message: error.message });
  }
};
