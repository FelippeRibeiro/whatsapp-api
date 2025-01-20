import { Router } from 'express';

import { SendMessageController } from '../controller/sendMessage.controller';

export class SendMessageRouter {
  router = Router();

  constructor(private controller: SendMessageController) {
    this.initializeRoutes();
  }

  initializeRoutes(): void {
    this.router.post('/send-text', this.controller.sendText);
  }
}
