import { Router } from 'express';
import { WhatsappService } from './Whatsapp.service';
import { Whatsapp } from '../../../services/whatsapp';

export class WhatsappController {
  router = Router();

  constructor(whatsappClient: Whatsapp) {
    const whatsappService = new WhatsappService(whatsappClient);
    this.router.post('/whatsapp/message', whatsappService.sendMessage);
  }
}
