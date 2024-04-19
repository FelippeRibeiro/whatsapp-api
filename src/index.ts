import 'dotenv/config';

import { API } from './api/server';

const Server = new API(3333);

process.on('uncaughtException', (e) => {
  console.error('uncaughtException', e.message);
});

process.on('unhandledRejection', (e) => {
  console.log('unhandledRejection', e);
});
