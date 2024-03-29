import { Router } from 'express';
import { WhatsappService } from './Whatsapp.service';
import { Whatsapp } from '../../../services/whatsapp';
import { notConnectedHandler } from '../../middlewares/notConnected.middleware';

export class WhatsappController {
  router = Router();

  constructor(whatsappClient: Whatsapp) {
    this.router.use(notConnectedHandler);
    const whatsappService = new WhatsappService(whatsappClient);
    this.router.post('/whatsapp/message', whatsappService.sendMessage);
  }
}
