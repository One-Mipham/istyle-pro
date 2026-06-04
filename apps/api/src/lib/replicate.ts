import Replicate from 'replicate';
import { config } from '../config.js';

export const replicate = new Replicate({ auth: config.REPLICATE_API_TOKEN });
