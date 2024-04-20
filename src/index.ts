import 'dotenv/config';

import { API } from './api/server';
import { Jobs } from './services/jobs/jobs';

const Server = new API(3333);
new Jobs().setJobs();

process.on('uncaughtException', (e) => {
  console.error('uncaughtException', e.message);
});

process.on('unhandledRejection', (e) => {
  console.log('unhandledRejection', e);
});
