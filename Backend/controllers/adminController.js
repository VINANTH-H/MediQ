import Doctor from '../models/Doctor.js';
import KnowledgeBase from '../models/KnowledgeBase.js';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';

// 1. Get all pending doctor sign-ups
export const getPendingDoctors = async (req, res) => {
    try {
        const pendingDoctors = await Doctor.find({ status: 'pending' });
        res.json(pendingDoctors);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch pending doctors' });
    }
};

// 2. Approve a pending doctor
export const approveDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const doctor = await Doctor.findByIdAndUpdate(id, { status: 'approved' }, { new: true });
        if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
        res.json({ message: 'Doctor approved successfully', doctor });
    } catch (error) {
        res.status(500).json({ error: 'Failed to approve doctor' });
    }
};

// 3. Reject a pending doctor
export const rejectDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const doctor = await Doctor.findByIdAndUpdate(id, { status: 'rejected' }, { new: true });
        if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
        res.json({ message: 'Doctor rejected', doctor });
    } catch (error) {
        res.status(500).json({ error: 'Failed to reject doctor' });
    }
};

// 4. Admin manually creates a new doctor profile
export const createDoctor = async (req, res) => {
    try {
        const newDoctor = await Doctor.create({
            ...req.body,
            status: 'approved' // Admin created doctors are auto-approved
        });
        res.status(201).json(newDoctor);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// 5. Add a new RAG Knowledge Base Rule with LangChain Embeddings
export const addKbRule = async (req, res) => {
    try {
        const { title, category, content, keywords } = req.body;

        // Generate embedding via LangChain
        const embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GEMINI_API_KEY,
            model: 'gemini-embedding-2'
        });

        const textToEmbed = `${keywords.join(' ')} ${content}`;
        const embedding = await embeddings.embedQuery(textToEmbed);

        const newRule = await KnowledgeBase.create({
            title, category, content, keywords, embedding
        });

        res.status(201).json({ message: 'RAG Rule added and embedded successfully', rule: newRule });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add KB rule' });
    }
};
