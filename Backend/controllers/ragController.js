import { extractSlots } from '../services/extractionService.js';
import { getOrCreateConversation, mergeSlots, getMissingFields } from '../services/conversationService.js';
import { determineSpecialty } from '../services/ragService.js';
import { generateFollowUpQuestion } from '../services/llmService.js';
import { searchDoctors } from '../services/doctorService.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';

const chat = async (req, res) => {
    const { conversationId, message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        // 1. Load or create conversation
        const conversation = await getOrCreateConversation(conversationId);
        let uiComponent = null;

        // --- STATE: APPOINTMENT CONFIRMED (User is on the Invoice stage) ---
        if (conversation.status === 'appointment_confirmed') {
            conversation.messages.push({ role: 'user', content: message });

            const isConfirm = ['confirm', 'yes', 'proceed', 'book', 'pay'].some(keyword => 
                message.toLowerCase().includes(keyword)
            );

            let aiMessage = '';
            if (isConfirm && conversation.slots.doctorId) {
                // Perform the actual database write!
                const appointment = await Appointment.create({
                    patient: req.user.id, // Securely from token
                    doctor: conversation.slots.doctorId,
                    date: conversation.slots.date,
                    timeSlot: conversation.slots.time,
                    symptoms: conversation.slots.symptom || 'General Consultation',
                    status: 'scheduled'
                });

                const doctor = await Doctor.findById(conversation.slots.doctorId);
                conversation.status = 'completed';
                aiMessage = `Success! Your appointment with ${doctor.name} on ${appointment.date} at ${appointment.timeSlot} has been booked.`;
                
                uiComponent = {
                    type: "booking_success",
                    data: {
                        appointmentId: appointment._id,
                        doctorName: doctor.name,
                        specialization: doctor.specialization,
                        date: appointment.date,
                        timeSlot: appointment.timeSlot,
                        hospital: doctor.hospital,
                        address: doctor.address
                    }
                };
            } else {
                aiMessage = "If you would like to proceed with this booking, please click the 'Confirm & Book' button or reply with 'confirm'.";
            }

            conversation.messages.push({ role: 'ai', content: aiMessage });
            await conversation.save();

            return res.json({
                conversationId: conversation._id,
                message: aiMessage,
                uiComponent,
                state: { intent: conversation.intent, slots: conversation.slots },
                status: conversation.status
            });
        }

        // --- STATE: READY FOR DOCTOR SEARCH (User is choosing from the Carousel) ---
        if (conversation.status === 'ready_for_doctor_search') {
            conversation.messages.push({ role: 'user', content: message });

            // Find all doctors of this specialty to match against user selection
            const availableDoctors = await Doctor.find({ specialization: conversation.slots.specialty, status: 'approved' });
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
                aiMessage = `Excellent choice! I have prepared your booking invoice for ${selectedDoctor.name}. Please confirm the details.`;

                // Fetch patient profile details for the invoice
                const patient = await User.findById(req.user.id);
                const fee = selectedDoctor.fee || 500;
                const tax = Math.round(fee * 0.18); // 18% GST

                uiComponent = {
                    type: "booking_invoice",
                    data: {
                        doctorName: selectedDoctor.name,
                        specialization: selectedDoctor.specialization,
                        date: conversation.slots.date,
                        timeSlot: conversation.slots.time,
                        patientName: patient ? patient.name : 'Patient',
                        patientPhone: patient ? patient.phno : '',
                        fee,
                        tax,
                        total: fee + tax
                    }
                };
            } else {
                aiMessage = "I didn't quite catch the doctor's name. Which doctor from the list would you like to book with?";
            }

            conversation.messages.push({ role: 'ai', content: aiMessage });
            await conversation.save();

            return res.json({
                conversationId: conversation._id,
                message: aiMessage,
                uiComponent,
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
            conversation.intent = extractedData.intent;
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
            // Need more info -> ask follow-up questions
            aiMessage = await generateFollowUpQuestion(missingFields, updatedSlots);
            conversation.status = 'collecting_information';
        } else {
            // Everything is collected! Search for actually available doctors
            doctorsFound = await searchDoctors(updatedSlots);
            conversation.status = 'ready_for_doctor_search';

            if (doctorsFound.length > 0) {
                aiMessage = `I found the following ${updatedSlots.specialty} specialists for your requested slot. Which doctor would you like to book with?`;
                
                // Structured Carousel Component
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
            uiComponent,
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
