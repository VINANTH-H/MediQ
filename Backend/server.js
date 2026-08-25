import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
import ragRoutes from './routes/ragRoutes.js';
app.use('/api/rag', ragRoutes);

import adminRoutes from './routes/adminRoutes.js';
app.use('/api/admin', adminRoutes);

import userRoutes from './routes/userRoutes.js';
app.use('/api/users', userRoutes);

import doctorRoutes from './routes/doctorRoutes.js';
app.use('/api/doctors', doctorRoutes);

import appointmentRoutes from './routes/appointmentRoutes.js';
app.use('/api/appointments', appointmentRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
