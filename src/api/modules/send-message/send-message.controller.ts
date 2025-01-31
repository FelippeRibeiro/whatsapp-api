import { Router, Response, Request } from 'express';
import { SessionsManager } from '../../../structures/sessionsManager';
import { SendMessageService } from './send-message.service';
import { Whatsapp } from '../../../whatsapp';
import { awaitForInstanceConnect } from '../../middlewares/waitForInstanceConnect';
import { ZSendMessageBody } from '../../dto/send-message-dto';
import { ZodError } from 'zod';

export class SendMessageController {
  router = Router();

  constructor(private sessionManager: SessionsManager, private sendMessageService: SendMessageService) {
    this.initializeRoutes();
  }

  initializeRoutes(): void {
    this.router.use((req, res, next) => {
      const { instance: instanceName } = req.body;
      const instance = this.sessionManager.instances.get(instanceName);
      if (!instance) return res.status(404).send({ message: 'Instance not found' });
      req.body.instance = instance.instance;
      return next();
    });
    this.router.use(awaitForInstanceConnect);

    this.router.post('/send-text', this.sendMessage.bind(this));
  }

  async sendMessage(req: Request, res: Response) {
    const instance = req.body.instance as Whatsapp;
    try {
      const payload = ZSendMessageBody.parse(req.body);
      const { errors, sucess } = await this.sendMessageService.sendTextMessage(instance, payload);

      if (sucess.length && !errors.length) return res.status(200).send({ sucess });

      if (!sucess.length && errors.length) return res.status(400).send({ errors });

      if (sucess.length && errors.length) return res.status(207).json({ sucess, errors });

      return res.status(204).send();
    } catch (error) {
      if (error instanceof ZodError) res.status(400).send({ message: 'Invalid Body', status: 400, errors: JSON.parse(error.message) });
      if (error instanceof Error) res.status(500).send({ message: error.message });
    }
  }
}
