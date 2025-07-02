const {
    createConversation,
    getConversationById,
    addParticipant,
    removeParticipant,
    listParticipants,
} = require("../db/queries/conversation");

const {
    createConvSchema,
    convPartIdSchema,
    convIdSchema,
    userIdSchema,
} = require("../validations/conversationValidation");

const ConversationError = class extends Error {
    constructor(message) {
        super(message);
        this.name = "ConversationError";
    }
};

const conversationService = {
    createConversation: async ({ isGroup, name, participants }) => {
        const validated = createConvSchema.parse({
            isGroup,
            name,
            participants,
        });
        const conv = await createConversation({
            isGroup: validated.isGroup,
            name: validated.name,
        });
        // 預設 participants: Array<string>
        await Promise.all(
            validated.participants.map((uid) =>
                addParticipant({ conversationId: conv.id, userId: uid })
            )
        );
        return conv;
    },

    getConversationById: async (conversationId) => {
        const convId = convIdSchema.parse(conversationId);
        const conv = await getConversationById(convId);
        if (!conv) throw new ConversationError("Conversation not found.");
        return conv;
    },

    addUserToConversation: async (conversationId, userId) => {
        const convId = convIdSchema.parse(conversationId);
        const uId = userIdSchema.parse(userId);
        const conv = await getConversationById(convId);
        if (!conv) throw new ConversationError("Conversation not found.");
        if (!conv.isGroup)
            throw new ConversationError(
                "Cannot add participants to a one-on-one conversation."
            );
        const existing = await listParticipants(convId);
        if (existing.some((p) => p.userId === uId)) {
            throw new ConversationError("Participant already exists.");
        }
        return addParticipant({ conversationId: convId, userId: uId });
    },

    leaveConversation: async (convPartId, userId) => {
        const partId = convPartIdSchema.parse(convPartId);
        const uId = userIdSchema.parse(userId);
        return removeParticipant(partId, uId);
    },

    getConversationParticipants: async (conversationId) => {
        const convId = convIdSchema.parse(conversationId);
        return listParticipants(convId);
    },
};

module.exports = {
    conversationService,
    ConversationError,
};
