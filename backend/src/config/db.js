import mongoose from 'mongoose';
import { env } from './env.js';
import { User } from '../models/User.js';
import { Table } from '../models/Table.js';
import { Reservation } from '../models/Reservation.js';

let indexesSynced = false;

export const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    if (mongoose.connection.readyState === 2) {
      return mongoose.connection.asPromise();
    }

    await mongoose.connect(env.mongoUri);
    console.log('MongoDB connected successfully');

    if (!indexesSynced) {
      // Drop stale indexes (e.g. legacy "username" unique index) and sync schema indexes.
      await Promise.all([
        User.syncIndexes(),
        Table.syncIndexes(),
        Reservation.syncIndexes(),
      ]);
      indexesSynced = true;
      console.log('Database indexes synced');
    }

    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
};
