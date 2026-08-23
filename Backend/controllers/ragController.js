import { extractSlots } from '../services/extractionService.js';
import { getOrCreateConversation, mergeSlots, getMissingFields } from '../services/conversationService.js';
import { determineSpecialty } from '../services/ragService.js';
import { generateFollowUpQuestion } from '../services/llmService.js';
import { searchDoctors } from '../services/doctorService.js';
import Doctor from '../models/Doctor.js';

const chat = async (req, res) => {
    const { conversationId, message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        // 1. Load or create conversation
        const conversation = await getOrCreateConversation(conversationId);

        // --- STEP 6: DOCTOR SELECTION & CONFIRMATION ---
        if (conversation.status === 'ready_for_doctor_search') {
            conversation.messages.push({ role: 'user', content: message });

            // Find all doctors for this specialty to match against user message
            const availableDoctors = await Doctor.find({ specialization: conversation.slots.specialty });
            let selectedDoctor = null;

            for (const doc of availableDoctors) {
                // Match doctor name (e.g. "Rajesh" or "Sharma")
                const names = doc.name.replace('Dr. ', '').split(' ');
                const matches = names.some(n => message.toLowerCase().includes(n.toLowerCase()));
                if (matches) {
                    selectedDoctor = doc;
                    break;
                }
            }

            let aiMessage = '';
            if (selectedDoctor) {
                conversation.slots.doctorId = selectedDoctor._id;
                conversation.status = 'appointment_confirmed';
                aiMessage = `Your appointment with ${selectedDoctor.name} (${conversation.slots.specialty}) on ${conversation.slots.date} during ${conversation.slots.time} has been successfully confirmed! Booking Ref ID: #${selectedDoctor._id}`;
            } else {
                aiMessage = "I didn't quite catch the doctor's name. Which doctor from the list above would you like to book with?";
            }

            conversation.messages.push({ role: 'ai', content: aiMessage });
            await conversation.save();

            return res.json({
                conversationId: conversation._id,
                message: aiMessage,
                state: { intent: conversation.intent, slots: conversation.slots },
                status: conversation.status
            });
        }
        // -----------------------------------------------

        // 2. Add user message to history
        conversation.messages.push({ role: 'user', content: message });

        // 3. Extract information via LLM
        const extractedData = await extractSlots(message, conversation.slots);

        if (extractedData && extractedData.intent) {
            conversation.intent = extractedData.intent; // the conversation objecet (where ever we have used) that we have here is a temprory   object later when we hit the save all the changes that is being done so far will get reflected in the DB
        }

        // 4. Merge extracted info into Conversation state
        let updatedSlots = mergeSlots(conversation.slots, extractedData);

        // 5. RAG: If we have a symptom but no specialty, determine it
        if (updatedSlots.symptom && !updatedSlots.specialty) {
            const specialty = await determineSpecialty(updatedSlots.symptom);
            if (specialty) {
                updatedSlots.specialty = specialty;
            }
        }

        // 6. Update slots in DB object
        conversation.slots = updatedSlots;

        // 7. Evaluate missing fields
        const missingFields = getMissingFields(updatedSlots);

        let aiMessage = '';
        let doctorsFound = [];

        if (missingFields.length > 0) {
            // Need more info -> ask single grouped question
            aiMessage = await generateFollowUpQuestion(missingFields, updatedSlots);
            conversation.status = 'collecting_information';
        } else {
            // Everything is collected! Search for doctors
            doctorsFound = await searchDoctors(updatedSlots);
            conversation.status = 'ready_for_doctor_search';

            if (doctorsFound.length > 0) {
                const docList = doctorsFound.map(d => `- ${d.name} (${d.hospital}, Exp: ${d.experience} yrs)`).join('\n');
                aiMessage = `I found the following ${updatedSlots.specialty} specialists for your requested time:\n${docList}\n\nWhich doctor would you like to book with?`;
            } else {
                aiMessage = `I couldn't find an available ${updatedSlots.specialty} doctor for that exact time. Would you like to try another date or time?`;
            }
        }

        // 8. Add AI message to history
        conversation.messages.push({ role: 'ai', content: aiMessage });

        // 9. Save conversation
        await conversation.save();

        // 10. Return Response
        return res.json({
            conversationId: conversation._id,
            message: aiMessage,
            state: {
                intent: conversation.intent,
                slots: conversation.slots
            },
            status: conversation.status
        });

    } catch (error) {
        console.error('Chat Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

export { chat };
