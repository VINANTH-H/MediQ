import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import KnowledgeBase from '../models/KnowledgeBase.js';
import { getEmbedding } from '../services/embeddingService.js';



const kbData = [
    {
        title: "Orthopedic Guidance",
        category: "Orthopedic",
        content: "Treats bone, joint, ligament, and spine conditions.",
        keywords: ["knee pain", "joint pain", "fracture", "back pain"]
    },
    {
        title: "Cardiologist Guidance",
        category: "Cardiologist",
        content: "Cardiovascular health and hypertension management.",
        keywords: ["chest pain", "high blood pressure", "heart problem"]
    },
    {
        title: "Dermatologist Guidance",
        category: "Dermatologist",
        content: "Skin, hair, nail treatments and allergic reactions.",
        keywords: ["skin rash", "acne", "eczema", "hair loss", "allergy"]
    },
    {
        title: "ENT Guidance",
        category: "ENT Specialist",
        content: "Ear, Nose, Throat, and head/neck disorders.",
        keywords: ["ear pain", "throat infection", "nose blockage", "sinus"]
    },
    {
        title: "Pediatrician Guidance",
        category: "Pediatrician",
        content: "Medical care for infants, children, and adolescents.",
        keywords: ["child fever", "vaccination", "baby crying", "growth issue"]
    },
    {
        title: "Neurologist Guidance",
        category: "Neurologist",
        content: "Treats disorders of the brain, spinal cord, and nerves.",
        keywords: ["severe headache", "migraine", "seizure", "numbness", "dizziness"]
    },
    {
        title: "General Physician",
        category: "General Physician",
        content: "Primary care for common illnesses, flu, and general checkups.",
        keywords: ["fever", "cold", "cough", "fatigue", "body ache"]
    }

];

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB...');

        await KnowledgeBase.deleteMany();
        console.log('Cleared existing Knowledge Base...');

        for (const item of kbData) {
            // Generate embedding for keywords combined as a single string
            const textToEmbed = item.keywords.join(' ') + ' ' + item.content;
            const embedding = await getEmbedding(textToEmbed);

            await KnowledgeBase.create({
                ...item,
                embedding
            });
            console.log(`Seeded: ${item.title}`);
        }

        console.log('Seed completed successfully.');
        process.exit();
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedData();
