import { NextFunction, Request, Response } from 'express';
import { Whatsapp } from '../../whatsapp';
import { delay } from 'baileys';

export async function awaitForInstanceConnect(req: Request, res: Response, next: NextFunction) {
  const instance = req.body.instance as Whatsapp;

  const connected = await Promise.race([delay(30000).then(() => false), instance.waitForClientConnection().then(() => true)]);

  if (connected) return next();
  return res.status(503).send({
    message: 'Instance not connected and takes too long to connected',
    status: 503,
  });
}
