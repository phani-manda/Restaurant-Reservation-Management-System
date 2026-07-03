import { Reservation } from '../models/Reservation.js';
import { ROLES, RESERVATION_STATUS } from '../constants/index.js';
import { AppError } from '../utils/AppError.js';
import {
  validateReservationDate,
  validateTableCapacity,
  checkOverlap,
  getAvailableTables,
} from '../services/reservationService.js';

const populateOptions = [
  { path: 'user', select: 'name email' },
  { path: 'table', select: 'tableNumber capacity' },
];

const formatReservation = (reservation) => ({
  id: reservation._id,
  user: reservation.user,
  table: reservation.table,
  date: reservation.date,
  timeSlot: reservation.timeSlot,
  guestCount: reservation.guestCount,
  status: reservation.status,
  notes: reservation.notes,
  createdAt: reservation.createdAt,
  updatedAt: reservation.updatedAt,
});

export const createReservation = async (req, res, next) => {
  try {
    const { tableId, date, timeSlot, guestCount, notes } = req.body;

    const reservationDate = validateReservationDate(date);
    await validateTableCapacity(tableId, guestCount);
    await checkOverlap(tableId, reservationDate, timeSlot);

    const reservation = await Reservation.create({
      user: req.user._id,
      table: tableId,
      date: reservationDate,
      timeSlot,
      guestCount,
      notes,
    });

    await reservation.populate(populateOptions);

    res.status(201).json({
      success: true,
      message: 'Reservation created successfully',
      data: { reservation: formatReservation(reservation) },
    });
  } catch (error) {
    next(error);
  }
};

export const getMyReservations = async (req, res, next) => {
  try {
    const reservations = await Reservation.find({ user: req.user._id })
      .populate(populateOptions)
      .sort({ date: -1, timeSlot: 1 });

    res.json({
      success: true,
      count: reservations.length,
      data: { reservations: reservations.map(formatReservation) },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllReservations = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.date) {
      const date = new Date(req.query.date);
      date.setUTCHours(0, 0, 0, 0);
      const nextDay = new Date(date);
      nextDay.setUTCDate(nextDay.getUTCDate() + 1);
      filter.date = { $gte: date, $lt: nextDay };
    }

    const reservations = await Reservation.find(filter)
      .populate(populateOptions)
      .sort({ date: -1, timeSlot: 1 });

    res.json({
      success: true,
      count: reservations.length,
      data: { reservations: reservations.map(formatReservation) },
    });
  } catch (error) {
    next(error);
  }
};

export const getReservationById = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id).populate(populateOptions);

    if (!reservation) {
      return next(new AppError('Reservation not found.', 404));
    }

    const isOwner = reservation.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === ROLES.ADMIN;

    if (!isOwner && !isAdmin) {
      return next(new AppError('You do not have permission to view this reservation.', 403));
    }

    res.json({
      success: true,
      data: { reservation: formatReservation(reservation) },
    });
  } catch (error) {
    next(error);
  }
};

export const updateReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return next(new AppError('Reservation not found.', 404));
    }

    const isOwner = reservation.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === ROLES.ADMIN;

    if (!isOwner && !isAdmin) {
      return next(new AppError('You do not have permission to update this reservation.', 403));
    }

    if (!isAdmin && reservation.status === RESERVATION_STATUS.CANCELLED) {
      return next(new AppError('Cannot update a cancelled reservation.', 400));
    }

    const tableId = req.body.tableId || reservation.table.toString();
    const date = req.body.date || reservation.date;
    const timeSlot = req.body.timeSlot || reservation.timeSlot;
    const guestCount = req.body.guestCount || reservation.guestCount;

    const reservationDate = validateReservationDate(date);
    await validateTableCapacity(tableId, guestCount);
    await checkOverlap(tableId, reservationDate, timeSlot, reservation._id);

    if (req.body.tableId) reservation.table = tableId;
    if (req.body.date) reservation.date = reservationDate;
    if (req.body.timeSlot) reservation.timeSlot = timeSlot;
    if (req.body.guestCount) reservation.guestCount = guestCount;
    if (req.body.notes !== undefined) reservation.notes = req.body.notes;

    if (isAdmin && req.body.status) {
      reservation.status = req.body.status;
    }

    await reservation.save();
    await reservation.populate(populateOptions);

    res.json({
      success: true,
      message: 'Reservation updated successfully',
      data: { reservation: formatReservation(reservation) },
    });
  } catch (error) {
    next(error);
  }
};

export const cancelReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return next(new AppError('Reservation not found.', 404));
    }

    const isOwner = reservation.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === ROLES.ADMIN;

    if (!isOwner && !isAdmin) {
      return next(new AppError('You do not have permission to cancel this reservation.', 403));
    }

    if (reservation.status === RESERVATION_STATUS.CANCELLED) {
      return next(new AppError('Reservation is already cancelled.', 400));
    }

    reservation.status = RESERVATION_STATUS.CANCELLED;
    await reservation.save();
    await reservation.populate(populateOptions);

    res.json({
      success: true,
      message: 'Reservation cancelled successfully',
      data: { reservation: formatReservation(reservation) },
    });
  } catch (error) {
    next(error);
  }
};

export const getAvailability = async (req, res, next) => {
  try {
    const { date, timeSlot, guestCount = 1 } = req.query;
    const tables = await getAvailableTables(date, timeSlot, Number(guestCount));

    res.json({
      success: true,
      count: tables.length,
      data: {
        tables: tables.map((t) => ({
          id: t._id,
          tableNumber: t.tableNumber,
          capacity: t.capacity,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};
