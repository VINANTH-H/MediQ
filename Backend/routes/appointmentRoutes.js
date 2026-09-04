import express from 'express';
import { 
    getAvailableSlots, 
    bookAppointment, 
    getMyAppointments 
} from '../controllers/appointmentController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   GET /api/appointments/slots
// @desc    Get all slots for a doctor on a date (Public/Unauthenticated for frontend UI)
router.get('/slots', getAvailableSlots);

// @route   POST /api/appointments/book
// @desc    Book an appointment (Patients only)
router.post('/book', bookAppointment);

// @route   GET /api/appointments/my-appointments
// @desc    Get logged in user's appointments (Patients see doctors, Doctors see patients)
router.get('/my-appointments', protect, getMyAppointments);

export default router;
