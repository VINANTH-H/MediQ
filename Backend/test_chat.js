import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
    try {
        const model = new ChatGoogleGenerativeAI({
            modelName: 'gemini-2.0-flash',
            apiKey: process.env.GEMINI_API_KEY
        });
        const res = await model.invoke("Hello");
        console.log("Success! Model works:", res.content);
    } catch (e) {
        console.error("Failed with 2.0-flash:", e.message);
        
        try {
            console.log("Trying gemini-1.5-pro...");
            const model2 = new ChatGoogleGenerativeAI({
                modelName: 'gemini-1.5-pro',
                apiKey: process.env.GEMINI_API_KEY
            });
            const res2 = await model2.invoke("Hello");
            console.log("Success! 1.5-pro works:", res2.content);
        } catch (e2) {
            console.error("Failed with 1.5-pro:", e2.message);
        }
    }
}
run();
