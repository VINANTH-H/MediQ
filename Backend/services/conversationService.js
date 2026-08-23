import Conversation from '../models/Conversation.js';

const getOrCreateConversation = async (conversationId) => {
    if (conversationId) {
        const conv = await Conversation.findById(conversationId);
        if (conv) return conv;
    }
    return await Conversation.create({});
};

const mergeSlots = (currentSlots, extractedData) => {
    if (!extractedData) return currentSlots;

    const newSlots = { ...currentSlots.toObject ? currentSlots.toObject() : currentSlots };
    
    // Only update if the new extracted value is not null and not undefined
    if (extractedData.symptom) newSlots.symptom = extractedData.symptom;
    if (extractedData.date) newSlots.date = extractedData.date;
    if (extractedData.time) newSlots.time = extractedData.time;
    if (extractedData.specialty) newSlots.specialty = extractedData.specialty; // can be updated by RAG

    return newSlots;
};

const getMissingFields = (slots) => {
    const required = ['symptom', 'specialty', 'date', 'time'];
    const missing = [];
    
    // Symptom or specialty is required first
    if (!slots.symptom && !slots.specialty) {
        missing.push('symptom or specialty');
    } else {
        // Only ask for date/time if we know what kind of doctor they need
        if (!slots.date) missing.push('date');
        if (!slots.time) missing.push('time');
    }
    
    return missing;
};

export { getOrCreateConversation, mergeSlots, getMissingFields };
