import 'dotenv/config';
import { join } from 'path';
import express from 'express';

import { SessionsManager } from './structures/sessionsManager';
import './interfaces/instance.settings';

import { SendMessageModule } from './api/modules/send-message/send-message.module';

async function bootstrap() {
  const sessionManager = new SessionsManager(join(__dirname, '..', 'sessions'));

  const app = express();
  app.use(express.json());

  const sendMessageModule = new SendMessageModule(sessionManager);
  app.use('/message', sendMessageModule.router);

  app.listen(process.env.PORT || 3333, () => {
    console.log(`🚩 Server listening on port ${process.env.PORT}`);
  });
}

bootstrap();

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});
