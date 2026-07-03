import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';

const app = express();

app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Restaurant Reservation API is running' });
});

app.listen(env.port, () => {
  console.log(`Server running on port ${env.port}`);
});
