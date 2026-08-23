import { GoogleGenAI } from '@google/genai';

const getEmbedding = async (text) => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.embedContent({
            model: 'gemini-embedding-2',
            contents: text,
        });
        return response.embeddings[0].values;
    } catch (error) {
        console.error('Error getting embedding:', error);
        throw error;
    }
};

export { getEmbedding };
