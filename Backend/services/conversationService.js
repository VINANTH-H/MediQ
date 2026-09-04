import Conversation from '../models/Conversation.js';

const getOrCreateConversation = async (conversationId) => {
    if (conversationId) {
        const conv = await Conversation.findById(conversationId);
        if (conv) return conv;
    }
    return await Conversation.create({});
};

export { getOrCreateConversation };
