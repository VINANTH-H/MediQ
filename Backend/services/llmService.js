import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatPromptTemplate } from '@langchain/core/prompts';

const generateFollowUpQuestion = async (missingFields, currentSlots) => {
    try {
        const model = new ChatGoogleGenerativeAI({
            model: 'gemini-3.6-flash',
            apiKey: process.env.GEMINI_API_KEY,
            temperature: 0.2
        });

        const promptTemplate = ChatPromptTemplate.fromMessages([
            ['system', `You are an intelligent medical appointment booking assistant.
The user wants to book an appointment. 
Current information collected: {currentSlots}
Missing information needed: {missingFields}

Ask ONE natural, friendly follow-up question that asks for ALL of the missing information at once.
For example, if date and time are missing, ask: "What date and time would you prefer?"
Do not ask for information that is already collected. Do not ask multiple questions.
Respond ONLY with the question text itself.`],
            ['human', 'Generate follow-up question']
        ]);

        const chain = promptTemplate.pipe(model);

        const response = await chain.invoke({
            currentSlots: JSON.stringify(currentSlots),
            missingFields: missingFields.join(', ')
        });

        return typeof response.content === 'string' ? response.content.trim() : String(response.content);
    } catch (error) {
        console.error('Error generating follow-up question with LangChain:', error);
        return 'Could you please provide more details for your appointment?';
    }
};

export { generateFollowUpQuestion };
