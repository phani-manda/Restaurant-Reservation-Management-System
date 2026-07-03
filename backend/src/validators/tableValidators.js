import { body, param } from 'express-validator';

export const createTableValidation = [
  body('tableNumber')
    .isInt({ min: 1 })
    .withMessage('Table number must be at least 1'),
  body('capacity')
    .isInt({ min: 1 })
    .withMessage('Capacity must be at least 1'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

export const updateTableValidation = [
  param('id').isMongoId().withMessage('Valid table ID is required'),
  body('tableNumber')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Table number must be at least 1'),
  body('capacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Capacity must be at least 1'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

export const tableIdValidation = [
  param('id').isMongoId().withMessage('Valid table ID is required'),
];
