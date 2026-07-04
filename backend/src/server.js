import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import reservationRoutes from './routes/reservationRoutes.js';
import tableRoutes from './routes/tableRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();

const normalizeOrigin = (origin) => origin?.replace(/\/+$/, '');
const allowedClientOrigin = normalizeOrigin(env.clientUrl);

app.use(cors({
  origin(origin, callback) {
    if (!origin || normalizeOrigin(origin) === allowedClientOrigin) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Restaurant Reservation API is running',
    health: '/api/health',
  });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Restaurant Reservation API is running' });
});

app.use(async (_req, _res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/tables', tableRoutes);

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  await connectDB();
  app.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
  });
};

if (!process.env.VERCEL) {
  startServer().catch((error) => {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  });
}

export default app;
