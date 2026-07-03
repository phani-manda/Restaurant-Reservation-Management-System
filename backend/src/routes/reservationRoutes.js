import { Router } from 'express';
import {
  createReservation,
  getMyReservations,
  getAllReservations,
  getReservationById,
  updateReservation,
  cancelReservation,
  getAvailability,
} from '../controllers/reservationController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { ROLES } from '../constants/index.js';
import {
  createReservationValidation,
  updateReservationValidation,
  reservationIdValidation,
  availabilityValidation,
  dateFilterValidation,
} from '../validators/reservationValidators.js';

const router = Router();

router.use(protect);

router.get('/availability', availabilityValidation, validate, getAvailability);
router.get('/my', getMyReservations);
router.get('/', restrictTo(ROLES.ADMIN), dateFilterValidation, validate, getAllReservations);
router.post('/', createReservationValidation, validate, createReservation);
router.get('/:id', reservationIdValidation, validate, getReservationById);
router.put('/:id', updateReservationValidation, validate, updateReservation);
router.delete('/:id', reservationIdValidation, validate, cancelReservation);

export default router;
