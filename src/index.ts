import './interfaces/instance.settings';
import { join } from 'path';

import { SessionsManager } from './structures/sessionsManeger';

const sessionManager = new SessionsManager(join(__dirname, '..', 'sessions'));

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});
