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
    if (extractedData.time) {
        let t = extractedData.time;
        // Normalize specific times like "11:00" to "11:00-12:00"
        if (typeof t === 'string' && !t.includes('-') && /^([01]?\d|2[0-3]):([0-5]\d)$/.test(t)) {
            const [hStr, mStr] = t.split(':');
            const h = parseInt(hStr, 10);
            const nextH = (h + 1).toString().padStart(2, '0');
            const hh = h.toString().padStart(2, '0');
            t = `${hh}:${mStr}-${nextH}:${mStr}`;
        }
        newSlots.time = t;
    }
    if (extractedData.specialty) newSlots.specialty = extractedData.specialty; // can be updated by RAG

    return newSlots;
};

const isBroadRange = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string') return true;
    const parts = timeStr.split('-');
    if (parts.length !== 2) return true;

    const parseToMinutes = (t) => {
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
    };

    try {
        const start = parseToMinutes(parts[0]);
        const end = parseToMinutes(parts[1]);
        // A specific slot should be exactly 60 minutes long
        return (end - start) !== 60;
    } catch (e) {
        return true;
    }
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
        
        // If time is missing OR if it's a broad range (not a specific 1-hour slot), flag it
        if (!slots.time) {
            missing.push('time');
        } else if (isBroadRange(slots.time)) {
            missing.push('specific 1-hour time slot');
        }
    }
    
    return missing;
};

export { getOrCreateConversation, mergeSlots, getMissingFields };
