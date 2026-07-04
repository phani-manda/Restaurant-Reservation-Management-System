import mongoose from 'mongoose';
import { env } from './env.js';
import { User } from '../models/User.js';
import { Table } from '../models/Table.js';
import { Reservation } from '../models/Reservation.js';

let indexesSynced = false;
let defaultTablesEnsured = false;

const defaultTables = [
  { tableNumber: 1, capacity: 2 },
  { tableNumber: 2, capacity: 2 },
  { tableNumber: 3, capacity: 4 },
  { tableNumber: 4, capacity: 4 },
  { tableNumber: 5, capacity: 6 },
  { tableNumber: 6, capacity: 6 },
  { tableNumber: 7, capacity: 8 },
  { tableNumber: 8, capacity: 10 },
];

const ensureDefaultTables = async () => {
  if (defaultTablesEnsured) {
    return;
  }

  const tableCount = await Table.countDocuments();
  if (tableCount === 0) {
    await Table.insertMany(defaultTables);
    console.log(`Seeded ${defaultTables.length} default tables`);
  }

  defaultTablesEnsured = true;
};

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

    await ensureDefaultTables();

    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
};
