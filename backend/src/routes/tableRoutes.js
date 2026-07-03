import { Router } from 'express';
import {
  getTables,
  createTable,
  updateTable,
  deleteTable,
} from '../controllers/tableController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { ROLES } from '../constants/index.js';
import {
  createTableValidation,
  updateTableValidation,
  tableIdValidation,
} from '../validators/tableValidators.js';

const router = Router();

router.use(protect);

router.get('/', getTables);
router.post('/', restrictTo(ROLES.ADMIN), createTableValidation, validate, createTable);
router.put('/:id', restrictTo(ROLES.ADMIN), updateTableValidation, validate, updateTable);
router.delete('/:id', restrictTo(ROLES.ADMIN), tableIdValidation, validate, deleteTable);

export default router;
