import Doctor from '../models/Doctor.js';
import bcrypt from 'bcryptjs';

// @desc    Register a new doctor
// @route   POST /api/doctors/register
export const registerDoctor = async (req, res) => {
    try {
        const { name, specialization, email, password, phone, hospital, experience, availableTime } = req.body;

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create the doctor (status defaults to 'pending')
        const newDoctor = await Doctor.create({
            name,
            specialization,
            email,
            password: hashedPassword,
            phone,
            hospital,
            experience,
            availableTime
        });

        res.status(201).json({
            message: 'Doctor registration submitted successfully and is pending approval',
            doctor: {
                _id: newDoctor._id,
                name: newDoctor.name,
                specialization: newDoctor.specialization,
                email: newDoctor.email,
                phone: newDoctor.phone,
                hospital: newDoctor.hospital,
                experience: newDoctor.experience,
                availableTime: newDoctor.availableTime,
                status: newDoctor.status
            }
        });
    } catch (error) {
        console.error('Doctor Registration Error:', error);
        res.status(500).json({ error: 'Failed to register doctor' });
    }
};

// @desc    Update doctor profile (e.g. available time slots, hospital, phone)
// @route   PATCH /api/doctors/profile
// @access  Private (Doctor only)
export const updateDoctorProfile = async (req, res) => {
    try {
        const doctorId = req.user.id; // securely retrieved from the decoded JWT token

        const { name, phone, specialization, hospital, experience, availableTime } = req.body;

        // Create a dynamic update object of changed fields
        const updateFields = {};
        if (name !== undefined) updateFields.name = name;
        if (phone !== undefined) updateFields.phone = phone;
        if (specialization !== undefined) updateFields.specialization = specialization;
        if (hospital !== undefined) updateFields.hospital = hospital;
        if (experience !== undefined) updateFields.experience = experience;
        if (availableTime !== undefined) updateFields.availableTime = availableTime;

        // Perform the update
        const updatedDoctor = await Doctor.findByIdAndUpdate(
            doctorId,
            { $set: updateFields },
            { new: true, runValidators: true }
        );

        if (!updatedDoctor) {
            return res.status(404).json({ error: 'Doctor not found' });
        }

        res.json({
            message: 'Doctor profile updated successfully',
            doctor: {
                _id: updatedDoctor._id,
                name: updatedDoctor.name,
                specialization: updatedDoctor.specialization,
                email: updatedDoctor.email,
                phone: updatedDoctor.phone,
                hospital: updatedDoctor.hospital,
                experience: updatedDoctor.experience,
                availableTime: updatedDoctor.availableTime,
                status: updatedDoctor.status
            }
        });
    } catch (error) {
        console.error('Doctor Profile Update Error:', error);
        res.status(500).json({ error: 'Failed to update doctor profile' });
    }
};

// @desc    Get all approved doctors (Optional filter by specialization)
// @route   GET /api/doctors
// @access  Public
export const getApprovedDoctors = async (req, res) => {
    try {
        const { specialization } = req.query;
        const query = { status: 'approved' };

        if (specialization && specialization !== 'All') {
            query.specialization = specialization;
        }

        const doctors = await Doctor.find(query).select('-password');

        res.json({
            count: doctors.length,
            doctors
        });
    } catch (error) {
        console.error('Error fetching approved doctors:', error);
        res.status(500).json({ error: 'Failed to fetch doctors' });
    }
};

// @desc    Get a single doctor by ID
// @route   GET /api/doctors/:id
// @access  Public
export const getDoctorById = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id).select('-password');

        if (!doctor) {
            return res.status(404).json({ error: 'Doctor not found' });
        }

        res.json({ doctor });
    } catch (error) {
        console.error('Error fetching doctor by ID:', error);
        
        // Handle invalid MongoDB ObjectIds
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ error: 'Doctor not found' });
        }
        
        res.status(500).json({ error: 'Failed to fetch doctor' });
    }
};
