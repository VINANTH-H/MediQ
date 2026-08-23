import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';

const extractionSchema = z.object({
    intent: z.string().nullable().describe('The intent of the user, e.g. book_appointment, medical_advice, greeting'),
    symptom: z.string().nullable().describe('The medical symptom or condition, e.g., knee pain, ear pain, fever'),
    date: z.string().nullable().describe('The desired appointment date in YYYY-MM-DD format'),
    time: z.string().nullable().describe('The desired appointment time slot range, e.g. 08:00-12:00, 17:00-21:00')
});

const extractSlots = async (message, currentSlots = {}) => {
    const now = new Date();
    const todayFormatted = now.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    try {
        const model = new ChatGoogleGenerativeAI({
            model: 'gemini-3.6-flash',
            apiKey: process.env.GEMINI_API_KEY,
            temperature: 0.1
        });

        const structuredLlm = model.withStructuredOutput(extractionSchema);

        const promptTemplate = ChatPromptTemplate.fromMessages([
            ['system', `Today's reference date is: {todayFormatted}.
Extract appointment information from the message:
- Convert relative dates like "tomorrow", "13th", "next Monday" into exact YYYY-MM-DD format based on today's reference date ({todayFormatted}).
- Convert relative time concepts like "morning", "afternoon", "evening" into standard ranges like "08:00-12:00", "12:00-17:00", "17:00-21:00".
- Maintain context of existing slots: {currentSlots}`],
            ['human', '{message}']
        ]);

        const chain = promptTemplate.pipe(structuredLlm);

        const extracted = await chain.invoke({
            todayFormatted,
            currentSlots: JSON.stringify(currentSlots),
            message
        });

        return extracted;
    } catch (error) {
        console.error('LangChain Extraction Error:', error);
        return null;
    }
};

export { extractSlots };
