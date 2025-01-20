import { RequestHandler, Router, RouterOptions, Request, Response } from 'express';
import { Whatsapp } from '../../whatsapp';
import { SessionsManager } from '../../structures/sessionsManeger';

export class SendMessageController {
  constructor(private sessionsManager: SessionsManager) {}
  sendText(req: Request, res: Response) {
    const instanceName = req.body['instance'];
    const instance = this.sessionsManager.instances.get(instanceName);
    if (!instance) throw new Error('Instance not found');
    console.log('Message sent!');
    res.send('OK');
  }
}
