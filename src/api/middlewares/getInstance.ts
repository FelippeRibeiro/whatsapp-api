import { NextFunction, Request, Response } from 'express';
import { SessionsManager } from '../../structures/sessionsManager';

export function getInstance(sessionManager: SessionsManager) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const instanceName = req.body.instance || req.params.instance;
    const instance = sessionManager.instances.get(instanceName);
    if (!instance) return res.status(404).send({ message: 'Instance not found' });
    req.body.instance = instance.instance;
    return next();
  };
}
