import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenAI } from '@google/genai';

async function test() {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    try {
        console.log('Testing gemini-embedding-2');
        await ai.models.embedContent({ model: 'gemini-embedding-2', contents: 'hello' });
        console.log('gemini-embedding-2 worked!');
    } catch(e) { console.error(e.message); }
    
    try {
        console.log('Testing text-embedding-004');
        await ai.models.embedContent({ model: 'text-embedding-004', contents: 'hello' });
        console.log('text-embedding-004 worked!');
    } catch(e) { console.error(e.message); }
    
    try {
        console.log('Testing embedding-001');
        await ai.models.embedContent({ model: 'embedding-001', contents: 'hello' });
        console.log('embedding-001 worked!');
    } catch(e) { console.error(e.message); }
}

test().catch(console.error);
