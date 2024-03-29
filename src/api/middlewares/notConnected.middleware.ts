import { NextFunction, Request, Response } from 'express';
import 'express-async-errors';
import { Whatsapp } from '../../services/whatsapp';

export const notConnectedHandler = (req: Request, res: Response, next: NextFunction) => {
  if (!Whatsapp.clientConnected) {
    return res.status(500).json({ message: 'Whatsapp client disconnected' });
  }
  next();
};
