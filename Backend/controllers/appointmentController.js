import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import { generateHourlySlots } from '../utils/timeUtils.js';

// @desc    Get all available time slots for a doctor on a specific date
// @route   GET /api/appointments/slots
// @access  Private (Registered users/patients)
export const getAvailableSlots = async (req, res) => {
    try {
        const { doctorId, date } = req.query;

        if (!doctorId || !date) {
            return res.status(400).json({ error: 'Doctor ID and Date are required' });
        }

        // 1. Fetch the doctor's availability ranges
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ error: 'Doctor not found' });
        }

        if (doctor.status !== 'approved') {
            return res.status(400).json({ error: 'Doctor is not approved to take appointments' });
        }

        // 2. Generate all possible hourly slots for the doctor
        let allSlots = [];
        doctor.availableTime.forEach(range => {
            allSlots = allSlots.concat(generateHourlySlots(range));
        });

        // 3. Find already booked appointments for this doctor on this date
        const bookedAppointments = await Appointment.find({
            doctor: doctorId,
            date,
            status: 'scheduled'
        });

        const bookedSlots = bookedAppointments.map(app => app.timeSlot);

        // 4. Format all slots with isBooked boolean flag for Red/Green UI rendering
        const formattedSlots = allSlots.map(timeSlot => ({
            timeSlot,
            isBooked: bookedSlots.includes(timeSlot)
        }));

        res.json({
            date,
            doctorName: doctor.name,
            totalSlots: allSlots.length,
            freeSlotsCount: allSlots.length - bookedSlots.length,
            slots: formattedSlots
        });
    } catch (error) {
        console.error('Error fetching available slots:', error);
        res.status(500).json({ error: 'Failed to fetch available slots' });
    }
};

// @desc    Book an appointment with a doctor
// @route   POST /api/appointments/book
// @access  Private (Patient only)
export const bookAppointment = async (req, res) => {
    try {
        let patientId = req.user?.id;
        if (!patientId) {
            const defaultUser = await User.findOne({});
            patientId = defaultUser?._id;
        }
        const { doctorId, date, timeSlot, symptoms } = req.body;

        if (!doctorId || !date || !timeSlot) {
            return res.status(400).json({ error: 'Doctor ID, Date, and Time Slot are required' });
        }

        // 1. Check if doctor exists and is approved
        const doctor = await Doctor.findById(doctorId);
        if (!doctor || doctor.status !== 'approved') {
            return res.status(404).json({ error: 'Doctor not found or not active' });
        }

        // 2. Check if the requested slot is valid for this doctor
        let allSlots = [];
        doctor.availableTime.forEach(range => {
            allSlots = allSlots.concat(generateHourlySlots(range));
        });

        if (!allSlots.includes(timeSlot)) {
            return res.status(400).json({ error: `Invalid slot. The doctor does not work during ${timeSlot}` });
        }

        // 3. Double-check if the slot is already booked
        const existingBooking = await Appointment.findOne({
            doctor: doctorId,
            date,
            timeSlot,
            status: 'scheduled'
        });

        if (existingBooking) {
            return res.status(400).json({ error: 'This time slot has already been booked by another patient' });
        }

        // 4. Create the appointment
        const appointment = await Appointment.create({
            patient: patientId,
            doctor: doctorId,
            date,
            timeSlot,
            symptoms,
            status: 'scheduled'
        });

        res.status(201).json({
            message: 'Appointment booked successfully',
            appointment
        });
    } catch (error) {
        console.error('Error booking appointment:', error);
        res.status(500).json({ error: 'Failed to book appointment' });
    }
};

// @desc    Get user's appointments (Patient sees their bookings, Doctor sees bookings with them)
// @route   GET /api/appointments/my-appointments
// @access  Private (Doctor or Patient)
export const getMyAppointments = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;

        let query = {};
        let populateField = '';

        if (role === 'doctor') {
            query = { doctor: userId };
            populateField = 'patient'; // Populate patient details (name, email, etc.)
        } else {
            query = { patient: userId };
            populateField = 'doctor'; // Populate doctor details
        }

        const appointments = await Appointment.find(query)
            .populate(populateField, 'name email specialization phone phno')
            .sort({ date: 1, timeSlot: 1 });

        res.json({
            count: appointments.length,
            appointments
        });
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ error: 'Failed to fetch appointments' });
    }
};
