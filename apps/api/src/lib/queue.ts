import { Queue } from 'bullmq';
import { config } from '../config.js';

export const generateQueue = new Queue('image-generation', {
  connection: { url: config.REDIS_URL },
});
