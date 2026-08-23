import mongoose from 'mongoose';

const knowledgeBaseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    category: { type: String },
    content: { type: String, required: true },
    keywords: [{ type: String }],
    embedding: {
        type: [Number], // Array of numbers for vector search
        required: true
    }
}, {
    timestamps: true
});

export default mongoose.model('KnowledgeBase', knowledgeBaseSchema);
