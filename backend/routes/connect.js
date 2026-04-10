import express from 'express';
import { body, param } from 'express-validator';
import {
  setAvailability,
  bookSession,
  getStudentBookings,
  getCounselorBookings,
  getCounselors,
  updateBookingStatus,
  getAvailableSlots
} from '../controllers/bookingController.js';
import { authenticate } from '../middleware/auth.js';
import { enforceCollegeAccess } from '../middleware/auth.js';
import { roleCheck } from '../middleware/roleCheck.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication and college access
router.use(authenticate);
router.use(enforceCollegeAccess);

// Student routes
router.post('/book',
  roleCheck(['student']),
  [
    body('bookingId').isMongoId(),
    body('studentNotes').optional().isString().trim()
  ],
  validate,
  bookSession
);
router.get('/student', roleCheck(['student']), getStudentBookings);
router.get('/counselors', roleCheck(['student']), getCounselors);
router.get('/counselors/:counselorId/availability', roleCheck(['student']), getAvailableSlots);

// Counselor routes
router.post('/availability',
  roleCheck(['counselor']),
  [
    body('slotStart').isISO8601().toDate(),
    body('slotEnd').isISO8601().toDate()
  ],
  validate,
  setAvailability
);
router.get('/counselor', roleCheck(['counselor']), getCounselorBookings);
router.put('/:bookingId/status',
  roleCheck(['counselor']),
  [
    param('bookingId').isMongoId(),
    body('status').isIn(['approved', 'rejected', 'completed']),
    body('notes').optional().isString().trim()
  ],
  validate,
  updateBookingStatus
);

export default router;
