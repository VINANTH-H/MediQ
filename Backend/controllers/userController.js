import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// @desc    Register a new user
// @route   POST /api/users/register
export const registerUser = async (req, res) => {
    try {
        const { name, email, password, phno } = req.body;

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create the user
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            phno
        });

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                phno: newUser.phno
            }
        });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
};

// @desc    Authenticate a user (unified login for Users and Doctors)
// @route   POST /api/users/login
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Search in User collection
        let account = await User.findOne({ email });
        let role = 'user';

        // 2. If not found in User, search in Doctor collection
        if (!account) {
            account = await Doctor.findOne({ email });
            role = 'doctor';
        }

        // 3. If still not found, deny access
        if (!account) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // 4. If the doctor's application is not approved yet, deny login
        if (role === 'doctor' && account.status !== 'approved') {
            return res.status(403).json({ error: `Your account status is currently ${account.status}. Access is restricted until approved.` });
        }

        // 5. Compare password
        const isMatch = await bcrypt.compare(password, account.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // 6. Generate JWT token (embedding role)
        const token = jwt.sign(
            { id: account._id, email: account.email, role },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            message: 'Login successful',
            token,
            role,
            user: {
                _id: account._id,
                name: account.name,
                email: account.email,
                phno: account.phone || account.phno
            }
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
};
