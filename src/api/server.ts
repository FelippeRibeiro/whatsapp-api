import express, { Express } from 'express';
import { logger } from '../lib/logger';
import { WhatsappController } from './modules/whatsapp/Whatsapp.controller';
import { Whatsapp } from '../services/whatsapp';
import { ErrorHandler } from './middlewares/errors.middleware';

const ENVPORT = Number(process.env['PORT']) || 3333;

export class API {
  app: Express;

  constructor(PORT?: number) {
    this.app = express();
    this.app.use(express.json());
    this.start(PORT);
  }
  private async start(PORT?: number) {
    await this.loadRouters();
    this.listen(PORT || ENVPORT);
    this.app.use(ErrorHandler);
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
