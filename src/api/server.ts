import express, { Express } from 'express';
import multer from 'multer';
import { logger } from '../lib/logger';
import { WhatsappController } from './modules/whatsapp/Whatsapp.controller';
import { Whatsapp } from '../services/whatsapp';

const PORT = process.env['PORT'] || 3333;

export class API {
  app: Express;

  constructor(PORT: number) {
    this.app = express();
    this.app.use(express.json());
    this.start();
  }
  private async start() {
    await this.loadRouters();
    this.listen(3333);
  }
  private listen(port: number) {
    this.app.listen(port, () => {
      logger.info(`Api started PORT: ${port}`);
    });
  }
  async loadRouters() {
    const whatsappClient = await Whatsapp.getInstance();
    const whatsappController = new WhatsappController(whatsappClient);
    this.app.use(whatsappController.router);
  }
}
