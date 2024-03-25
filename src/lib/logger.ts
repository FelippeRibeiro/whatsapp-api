import pino from 'pino';

export const logger = pino({
  level: process.env['LOGGER_LEVEL'] || 'silent',
});
