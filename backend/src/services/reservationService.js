import { Reservation } from '../models/Reservation.js';
import { Table } from '../models/Table.js';
import { RESERVATION_STATUS } from '../constants/index.js';
import { AppError } from '../utils/AppError.js';

const normalizeDate = (dateInput) => {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) {
    throw new AppError('Invalid reservation date.', 400);
  }
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

export const validateReservationDate = (dateInput) => {
  const date = normalizeDate(dateInput);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  if (date < today) {
    throw new AppError('Reservation date cannot be in the past.', 400);
  }

  return date;
};

export const validateTableCapacity = async (tableId, guestCount) => {
  const table = await Table.findById(tableId);
  if (!table) {
    throw new AppError('Table not found.', 404);
  }
  if (!table.isActive) {
    throw new AppError('Selected table is not available.', 400);
  }
  if (table.capacity < guestCount) {
    throw new AppError(
      `Table ${table.tableNumber} has a capacity of ${table.capacity}, which is less than ${guestCount} guests.`,
      400
    );
  }
  return table;
};

export const checkOverlap = async (tableId, date, timeSlot, excludeReservationId = null) => {
  const query = {
    table: tableId,
    date: normalizeDate(date),
    timeSlot,
    status: RESERVATION_STATUS.ACTIVE,
  };

  if (excludeReservationId) {
    query._id = { $ne: excludeReservationId };
  }

  const existing = await Reservation.findOne(query);
  if (existing) {
    throw new AppError(
      'This table is already reserved for the selected date and time slot.',
      409
    );
  }
};

export const getAvailableTables = async (date, timeSlot, guestCount) => {
  const normalizedDate = normalizeDate(date);

  const bookedTableIds = await Reservation.find({
    date: normalizedDate,
    timeSlot,
    status: RESERVATION_STATUS.ACTIVE,
  }).distinct('table');

  const availableTables = await Table.find({
    _id: { $nin: bookedTableIds },
    capacity: { $gte: guestCount },
    isActive: true,
  }).sort({ tableNumber: 1 });

  return availableTables;
};
