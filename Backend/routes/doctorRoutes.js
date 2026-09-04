import express from 'express';
import { checkSchema } from 'express-validator';
import { registerDoctor, updateDoctorProfile, getApprovedDoctors, getDoctorById } from '../controllers/doctorController.js';
import { doctorRegisterSchema, doctorUpdateSchema } from '../validators/doctorValidation.js';
import { validate } from '../validators/validationMiddleware.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   GET /api/doctors (Public catalog: GET /api/doctors or GET /api/doctors?specialization=Orthopedic)
router.get('/', getApprovedDoctors);

// @route   GET /api/doctors/:id
router.get('/:id', getDoctorById);

// @route   POST /api/doctors/register
router.post('/register', checkSchema(doctorRegisterSchema), validate, registerDoctor);

// @route   PATCH /api/doctors/profile
router.patch('/profile', protect, restrictTo('doctor'), checkSchema(doctorUpdateSchema), validate, updateDoctorProfile);

export default router;
