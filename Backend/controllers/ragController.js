import { getOrCreateConversation } from '../services/conversationService.js';
import { searchDoctors } from '../services/doctorService.js';
import { determineSpecialty } from '../services/ragService.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import { generateHourlySlots } from '../utils/timeUtils.js';

import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, AIMessage, SystemMessage, ToolMessage } from '@langchain/core/messages';
import { z } from 'zod';
import { tool } from '@langchain/core/tools';

const searchDoctorsSchema = z.object({
    specialty: z.string().describe("The medical specialty required (e.g. General Physician)"),
    date: z.string().describe("The date for the appointment in YYYY-MM-DD format"),
    time: z.string().describe("The 1-hour time slot (e.g. 10:00-11:00)")
});

const checkAvailableSlotsSchema = z.object({
    doctorId: z.string().describe("The MongoDB ObjectId of the doctor"),
    date: z.string().describe("The date for the appointment in YYYY-MM-DD format")
});

const generateInvoiceSchema = z.object({
    doctorId: z.string(),
    date: z.string().describe("YYYY-MM-DD"),
    timeSlot: z.string().describe("10:00-11:00"),
});

const updateSlotsSchema = z.object({
    symptom: z.string().optional(),
    date: z.string().optional(),
    time: z.string().optional()
});

const tools = [
    {
        name: "search_doctors",
        description: "Search for available doctors by specialty, date, and time slot. Use this when the user is ready to see a list of doctors.",
        schema: searchDoctorsSchema
    },
    {
        name: "check_available_slots",
        description: "Check available 1-hour time slots for a specific doctor on a specific date.",
        schema: checkAvailableSlotsSchema
    },
    {
        name: "generate_invoice",
        description: "Generate a booking invoice summary for a patient with a specific doctor, date, and time. Use this when the user explicitly confirms they want to proceed with a doctor.",
        schema: generateInvoiceSchema
    },
    {
        name: "update_slots",
        description: "Update the conversation's memory with the extracted symptom, date, or time as soon as the user provides it.",
        schema: updateSlotsSchema
    }
];

// Helper to convert DB messages to Langchain messages
const convertMessages = (messages) => {
    return messages.map(msg => {
        if (msg.role === 'system') return new SystemMessage(msg.content);
        if (msg.role === 'user') return new HumanMessage(msg.content);
        if (msg.role === 'ai') return new AIMessage(msg.content);
        return new HumanMessage(msg.content || "");
    });
};

const chat = async (req, res) => {
    const { conversationId, message, doctorId } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        const conversation = await getOrCreateConversation(conversationId);

        // Push the new user message
        conversation.messages.push({ role: 'user', content: message });

        // If doctorId was passed from frontend (clicked on carousel), inject it into context
        if (doctorId) {
            conversation.messages.push({
                role: 'user',
                content: `(System Note: The user has selected doctorId: ${doctorId})`
            });
        }

        const model = new ChatGoogleGenerativeAI({
            modelName: 'gemini-3.5-flash',
            model: 'gemini-3.5-flash',
            apiKey: process.env.GEMINI_API_KEY,
            temperature: 0.1
        });

        const modelWithTools = model.bindTools(tools);  // bindTools is the correct LangChain method

        // Build the Sliding Window prompt
        // System Prompt + Last 6 messages
        const recentMessages = conversation.messages.slice(-6);
        const currentSlots = JSON.stringify(conversation.slots || {});
        const today = new Date().toDateString();
        const systemPrompt = {
            role: 'system',
            content: `You are an intelligent medical appointment booking assistant. Today is ${today}.
Your goal is to collect the patient's symptom, date, and time slot, and then book an appointment.
Currently known information: ${currentSlots}
If you need information, ask the user NATURALLY (e.g., "What day and time works for you?"). Do NOT ask for strict formats like YYYY-MM-DD.
Instead, when you call a tool, YOU must convert their natural answer into YYYY-MM-DD and a 1-hour slot (e.g., "09:00-10:00") yourself.
CRITICAL RULES FOR DATES AND TIMES:
- If the user says "coming Saturday", "next week", or "tomorrow", accurately calculate the exact YYYY-MM-DD based on today's date (${today}).
- If the user only says a broad time like "morning" or "evening", you MUST ask them for a specific time (e.g., "Would 10 AM or 11 AM work better?").
Always be concise and polite.`
        };

        const langchainMessages = convertMessages([systemPrompt, ...recentMessages]);

        // INVOCATION: Let Gemini decide what to do!
        const aiResponse = await modelWithTools.invoke(langchainMessages);

        let uiComponent = null;
        let aiMessageText = aiResponse.content;

        // Check if Gemini decided to call a tool
        if (aiResponse.tool_calls && aiResponse.tool_calls.length > 0) {
            const toolCall = aiResponse.tool_calls[0]; // Handle first tool call

            if (toolCall.name === 'update_slots') {
                const { symptom, date, time } = toolCall.args;
                if (!conversation.slots) conversation.slots = {};
                if (symptom) conversation.slots.symptom = symptom;
                if (date) conversation.slots.date = date;
                if (time) conversation.slots.time = time;
                
                // If all 3 required slots are filled, manually trigger the search logic
                if (conversation.slots.symptom && conversation.slots.date && conversation.slots.time) {
                    const searchSpec = await determineSpecialty(conversation.slots.symptom);
                    
                    // Save the calculated specialty back to the slots so it shows up in the JSON state
                    conversation.slots.specialty = searchSpec;

                    const doctorsFound = await searchDoctors({ 
                        specialty: searchSpec || 'General Physician', 
                        date: conversation.slots.date, 
                        time: conversation.slots.time 
                    });

                    if (doctorsFound.length > 0) {
                        aiMessageText = `I found the following ${searchSpec || 'General Physician'} specialists for your requested slot. Which doctor would you like to book with?`;
                        uiComponent = {
                            type: "doctor_carousel",
                            data: doctorsFound.map(d => ({
                                id: d._id,
                                name: d.name,
                                specialization: d.specialization,
                                hospital: d.hospital,
                                experience: d.experience,
                                fee: d.fee,
                                rating: d.rating,
                                languages: d.languages,
                                bio: d.bio,
                                address: d.address
                            }))
                        };
                    } else {
                        aiMessageText = `I couldn't find an available doctor for that exact time. Would you like to try another date or time?`;
                    }
                } else {
                    // Still missing info, so ask Gemini to generate the follow-up question
                    langchainMessages.push(aiResponse); 
                    langchainMessages.push(new ToolMessage({ 
                        tool_call_id: toolCall.id, 
                        content: "Slots updated successfully. Reply directly to the user to ask for any remaining missing information in a natural, conversational way. Do not mention tools or internal processes." 
                    }));
                    
                    const followUpResponse = await modelWithTools.invoke(langchainMessages);
                    aiMessageText = followUpResponse.content;
                }
            }

            if (toolCall.name === 'search_doctors') {
                const { specialty, date, time } = toolCall.args;
                // Determine specialty if they passed a symptom instead
                let searchSpec = specialty;
                if (specialty && specialty.toLowerCase() !== 'general physician') {
                    // Keep provided specialty
                } else if (conversation.slots?.symptom) {
                    searchSpec = await determineSpecialty(conversation.slots.symptom);
                }

                const doctorsFound = await searchDoctors({ specialty: searchSpec || 'General Physician', date, time });

                if (doctorsFound.length > 0) {
                    aiMessageText = `I found the following ${searchSpec || 'General Physician'} specialists for your requested slot. Which doctor would you like to book with?`;
                    uiComponent = {
                        type: "doctor_carousel",
                        data: doctorsFound.map(d => ({
                            id: d._id,
                            name: d.name,
                            specialization: d.specialization,
                            hospital: d.hospital,
                            experience: d.experience,
                            fee: d.fee,
                            rating: d.rating,
                            languages: d.languages,
                            bio: d.bio,
                            address: d.address
                        }))
                    };
                } else {
                    aiMessageText = `I couldn't find an available doctor for that exact time. Would you like to try another date or time?`;
                }
            }

            if (toolCall.name === 'generate_invoice') {
                try {
                    let patientId = req.user?.id;
                    let patientName = req.user?.name || "Guest";
                    let patientPhone = req.user?.phone || "N/A";
                    
                    if (!patientId) {
                        const defaultUser = await User.findOne({});
                        patientId = defaultUser?._id;
                        patientName = defaultUser?.name || "Guest";
                        patientPhone = defaultUser?.phone || "N/A";
                    }

                    const { doctorId: docId, date, timeSlot } = toolCall.args;
                    const doctor = await Doctor.findById(docId);
                    
                    if (!doctor) {
                        aiMessageText = `I couldn't find that doctor in our system. Please try again.`;
                    } else {
                        aiMessageText = `Here is your booking summary with ${doctor.name}. Please review and click Book Appointment to confirm.`;

                        const fee = doctor.fee || 500;
                        const tax = Math.round(fee * 0.18);
                        const total = fee + tax;

                        uiComponent = {
                            type: "booking_invoice",
                            data: {
                                doctorId: docId,
                                doctorName: doctor.name,
                                specialization: doctor.specialization,
                                date: date,
                                timeSlot: timeSlot,
                                hospital: doctor.hospital,
                                address: doctor.address,
                                patientName,
                                patientPhone,
                                fee,
                                tax,
                                total,
                                symptom: conversation.slots?.symptom || 'General Consultation'
                            }
                        };
                    }
                } catch (error) {
                    aiMessageText = `An error occurred while generating the invoice. Please try again.`;
                }
            }
        }

        // Sanitize aiMessageText to ensure it's a string for MongoDB
        let finalMessage = "";
        if (typeof aiMessageText === 'string') {
            finalMessage = aiMessageText;
        } else if (Array.isArray(aiMessageText)) {
            const textBlock = aiMessageText.find(b => b.type === 'text');
            finalMessage = textBlock ? textBlock.text : "";
        }

        // Mongoose requires content to be a non-empty string. Fallback if empty.
        if (!finalMessage || finalMessage.trim() === "") {
            finalMessage = uiComponent ? "(Generated UI Component)" : "I am processing that for you...";
        }

        // Add AI message to history
        conversation.messages.push({ role: 'ai', content: finalMessage });
        await conversation.save();

        // Return exact response expected by React Frontend
        return res.json({
            conversationId: conversation._id,
            message: finalMessage,
            uiComponent,
            state: { slots: conversation.slots || {} },
            status: "active"
        });

    } catch (error) {
        console.error('Chat Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

export { chat };
