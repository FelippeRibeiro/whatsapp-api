import Express from 'express';
import multer from 'multer';
import { logger } from '../lib/logger';

const app = Express();

app.get('/', (req, res) => {
  return res.send('Hello World!');
});

const PORT = process.env['PORT'] || 3333;

app.listen(PORT, () => {
  logger.info(`Api started PORT: ${PORT}`);
});
