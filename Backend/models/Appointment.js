import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    date: {
        type: String, // format: YYYY-MM-DD
        required: true
    },
    timeSlot: {
        type: String, // format: HH:MM-HH:MM (e.g. 09:00-10:00)
        required: true
    },
    symptoms: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['scheduled', 'completed', 'cancelled'],
        default: 'scheduled'
    }
}, { timestamps: true });

appointmentSchema.index(
    { doctor: 1, date: 1, timeSlot: 1 },
    { unique: true, partialFilterExpression: { status: 'scheduled' } }
);

export default mongoose.model('Appointment', appointmentSchema);
