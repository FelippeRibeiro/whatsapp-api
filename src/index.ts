import 'dotenv/config';
import { join } from 'path';
import express from 'express';

import { SessionsManager } from './structures/sessionsManeger';
import './interfaces/instance.settings';
import './api/routes/sendMessage.route';
import { SendMessageController } from './api/controller/sendMessage.controller';

async function bootsrap() {
  const sessionManager = new SessionsManager(join(__dirname, '..', 'sessions'));

  const app = express();
  app.use(express.json());

  const sendMessageController = new SendMessageController(sessionManager);
  app.use('/message', sendMessageController.sendText.bind(sendMessageController));

  app.listen(process.env.PORT || 3333, () => {
    console.log(`Server listening on port ${process.env.PORT}`);
  });
}

bootsrap();

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});
