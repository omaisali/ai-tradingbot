import cors from 'cors';
import { ENV } from '../config/env';

export const corsMiddleware = cors({
  origin: ENV.CORS_ORIGIN,
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
});