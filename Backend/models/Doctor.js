import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    specialization: { type: String, required: true, index: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    hospital: { type: String },
    experience: { type: Number },
    fee: { type: Number, required: true, default: 500 },
    address: { type: String, default: 'Main Clinic, Hospital Wing A' },
    rating: { type: Number, default: 4.5 },
    languages: [{ type: String }],
    bio: { type: String },
    availableTime: [{ type: String }], // Simplified availability for now
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
});

export default mongoose.model('Doctor', doctorSchema);
