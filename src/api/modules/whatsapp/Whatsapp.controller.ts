import { Router } from 'express';
import { WhatsappService } from './Whatsapp.service';
import { Whatsapp } from '../../../services/whatsapp';
import { notConnectedHandler } from '../../middlewares/notConnected.middleware';
import multer from 'multer';
const upload = multer();
export class WhatsappController {
  router = Router();

  constructor(whatsappClient: Whatsapp) {
    this.router.use(notConnectedHandler);
    const whatsappService = new WhatsappService(whatsappClient);
    this.router.post('/whatsapp/message', whatsappService.sendMessage);
    this.router.post('/whatsapp/file', upload.fields([{ name: 'file', maxCount: 1 }, { name: 'message' }, { name: 'to' }]), whatsappService.sendFile);
  }
}
