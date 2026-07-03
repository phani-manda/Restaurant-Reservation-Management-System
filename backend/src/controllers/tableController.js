import { Table } from '../models/Table.js';
import { Reservation } from '../models/Reservation.js';
import { RESERVATION_STATUS } from '../constants/index.js';
import { AppError } from '../utils/AppError.js';

export const getTables = async (_req, res, next) => {
  try {
    const tables = await Table.find().sort({ tableNumber: 1 });
    res.json({
      success: true,
      count: tables.length,
      data: { tables },
    });
  } catch (error) {
    next(error);
  }
};

export const createTable = async (req, res, next) => {
  try {
    const table = await Table.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Table created successfully',
      data: { table },
    });
  } catch (error) {
    next(error);
  }
};

export const updateTable = async (req, res, next) => {
  try {
    const table = await Table.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!table) {
      return next(new AppError('Table not found.', 404));
    }

    res.json({
      success: true,
      message: 'Table updated successfully',
      data: { table },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTable = async (req, res, next) => {
  try {
    const activeReservations = await Reservation.countDocuments({
      table: req.params.id,
      status: RESERVATION_STATUS.ACTIVE,
    });

    if (activeReservations > 0) {
      return next(
        new AppError('Cannot delete table with active reservations.', 400)
      );
    }

    const table = await Table.findByIdAndDelete(req.params.id);
    if (!table) {
      return next(new AppError('Table not found.', 404));
    }

    res.json({
      success: true,
      message: 'Table deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
