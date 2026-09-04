import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import dotenv from 'dotenv';
dotenv.config();

async function testModel(modelString) {
    try {
        console.log(`Testing ${modelString}...`);
        const model = new ChatGoogleGenerativeAI({
            modelName: modelString,
            model: modelString,
            apiKey: process.env.GEMINI_API_KEY
        });
        const res = await model.invoke("Hello");
        console.log(`✅ ${modelString} works! Response: ${res.content}`);
        return true;
    } catch (e) {
        console.error(`❌ ${modelString} failed: ${e.message}`);
        return false;
    }
}

testModel('gemini-3.5-flash');
