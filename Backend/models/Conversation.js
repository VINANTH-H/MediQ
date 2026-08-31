import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    role: { type: String, enum: ['user', 'ai', 'system'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const conversationSchema = new mongoose.Schema({
    userId: { type: String }, // Optional for now
    intent: { type: String },
    slots: {
        symptom: { type: String, default: null },
        specialty: { type: String, default: null },
        date: { type: String, default: null },
        time: { type: String, default: null },
        doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', default: null }
    },
    messages: [messageSchema],
    status: { type: String, default: 'collecting_information', enum: ['collecting_information', 'ready_for_doctor_search', 'ready_to_book', 'appointment_confirmed'] }
}, {
    timestamps: true
});

export default mongoose.model('Conversation', conversationSchema);
