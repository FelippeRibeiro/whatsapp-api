import { SessionsManager } from '../../../structures/sessionsManager';
import { SendMessageController } from './send-message.controller';
import { SendMessageService } from './send-message.service';

export class SendMessageModule {
  router;
  constructor(sessionManager: SessionsManager) {
    const service = new SendMessageService();
    const controller = new SendMessageController(sessionManager, service);
    this.router = controller.router;
  }
}
