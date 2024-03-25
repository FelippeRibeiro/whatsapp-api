import express, { Express } from 'express';
import multer from 'multer';
import { logger } from '../lib/logger';
import { WhatsappClient } from '../services/whatsapp';

const app = express();

app.get('/', (req, res) => {
  return res.send('Hello World!');
});

const PORT = process.env['PORT'] || 3333;

app.listen(PORT, () => {
  logger.info(`Api started PORT: ${PORT}`);
});

//FUNCTIONAL OR POO???
function startAPIWithClient(client: WhatsappClient) {}

class API {
  app: Express;

  constructor(PORT: number) {
    this.app = express();

    this.app.listen(PORT);
  }
}
