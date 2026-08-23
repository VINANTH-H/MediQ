import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { searchKnowledgeBase } from './vectorSearchService.js';

const determineSpecialty = async (symptom) => {
    if (!symptom) return null;

    try {
        // 1. Generate embedding for the symptom using LangChain Embeddings
        const embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GEMINI_API_KEY,
            model: 'gemini-embedding-2'
        });

        const queryVector = await embeddings.embedQuery(symptom);

        // 2. Search Knowledge Base using Vector Search
        const topMatch = await searchKnowledgeBase(queryVector);

        // 3. Return mapped specialty if match exists
        if (topMatch && topMatch.category) {
            console.log(`LangChain RAG Match: "${symptom}" -> ${topMatch.category}`);
            return topMatch.category;
        }

        return null;
    } catch (error) {
        console.error('LangChain RAG Service Error:', error);
        return null;
    }
};

export { determineSpecialty };
