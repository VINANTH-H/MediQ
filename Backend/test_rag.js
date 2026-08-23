import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { determineSpecialty } from './services/ragService.js';
import KnowledgeBase from './models/KnowledgeBase.js';

async function test() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Check what is in the DB
    const kb = await KnowledgeBase.find({}).select('title category keywords');
    console.log('Knowledge Base Rules:', kb);
    
    const specialty = await determineSpecialty('cold, fever');
    console.log('Determined Specialty:', specialty);
    
    process.exit(0);
}

test().catch(console.error);
