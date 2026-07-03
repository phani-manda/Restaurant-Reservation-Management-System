import { body, param, query } from 'express-validator';
import { TIME_SLOTS, RESERVATION_STATUS } from '../constants/index.js';

export const createReservationValidation = [
  body('tableId').isMongoId().withMessage('Valid table ID is required'),
  body('date').isISO8601().withMessage('Valid reservation date is required'),
  body('timeSlot')
    .isIn(TIME_SLOTS)
    .withMessage(`Time slot must be one of: ${TIME_SLOTS.join(', ')}`),
  body('guestCount')
    .isInt({ min: 1 })
    .withMessage('Guest count must be at least 1'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
];

export const updateReservationValidation = [
  param('id').isMongoId().withMessage('Valid reservation ID is required'),
  body('tableId').optional().isMongoId().withMessage('Valid table ID is required'),
  body('date').optional().isISO8601().withMessage('Valid reservation date is required'),
  body('timeSlot')
    .optional()
    .isIn(TIME_SLOTS)
    .withMessage(`Time slot must be one of: ${TIME_SLOTS.join(', ')}`),
  body('guestCount')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Guest count must be at least 1'),
  body('status')
    .optional()
    .isIn(Object.values(RESERVATION_STATUS))
    .withMessage('Invalid reservation status'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
];

export const reservationIdValidation = [
  param('id').isMongoId().withMessage('Valid reservation ID is required'),
];

export const availabilityValidation = [
  query('date').isISO8601().withMessage('Valid date is required'),
  query('timeSlot')
    .isIn(TIME_SLOTS)
    .withMessage(`Time slot must be one of: ${TIME_SLOTS.join(', ')}`),
  query('guestCount')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Guest count must be at least 1'),
];

export const dateFilterValidation = [
  query('date').optional().isISO8601().withMessage('Valid date is required'),
];
