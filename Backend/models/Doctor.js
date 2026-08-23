import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    specialization: { type: String, required: true, index: true },
    hospital: { type: String },
    experience: { type: Number },
    availableTime: [{ type: String }], // Simplified availability for now
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }

});

export default mongoose.model('Doctor', doctorSchema);
