import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Table } from '../models/Table.js';

dotenv.config();

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

const seedTables = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Table.deleteMany({});
    const tables = await Table.insertMany(defaultTables);

    console.log(`Seeded ${tables.length} tables:`);
    tables.forEach((t) => console.log(`  Table ${t.tableNumber} - capacity ${t.capacity}`));

    await mongoose.disconnect();
    console.log('Table seeding complete');
    process.exit(0);
  } catch (error) {
    console.error('Table seeding failed:', error.message);
    process.exit(1);
  }
};

seedTables();
