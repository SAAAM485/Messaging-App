const {
    createConversation,
    getConversationById,
    addParticipant,
    removeParticipant,
    countParticipants,
    deleteConversationIfEmpty,
    listParticipants,
    findPrivateConversation,
    updateLastReadAt,
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
    findOrCreateConversation: async (userId1, userId2) => {
        userIdSchema.parse(userId1);
        userIdSchema.parse(userId2);

        if (userId1 === userId2) {
            throw new ConversationError(
                "Cannot start a conversation with yourself."
            );
        }

        const existing = await findPrivateConversation(userId1, userId2);
        if (existing) return existing;

        const conv = await createConversation({ isGroup: false });
        await Promise.all([
            addParticipant({ conversationId: conv.id, userId: userId1 }),
            addParticipant({ conversationId: conv.id, userId: userId2 }),
        ]);

        return getConversationById(conv.id);
    },

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
        await Promise.all(
            validated.participants.map((uid) =>
                addParticipant({ conversationId: conv.id, userId: uid })
            )
        );
        return conv;
    },

    getConversationById: async (conversationId, userId) => {
        const convId = convIdSchema.parse(conversationId);
        const uId = userIdSchema.parse(userId);
        const conv = await getConversationById(convId);
        if (!conv) throw new ConversationError("Conversation not found.");
        const isUserInConversation = (conv, userId) =>
            conv.participants.some((p) => p.userId === userId);
        if (!isUserInConversation(conv, uId)) {
            throw new ConversationError("User not part of this conversation.");
        }
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
        await removeParticipant(partId, uId);
        const remaining = await countParticipants(partId);
        if (remaining <= 1) {
            await deleteConversationIfEmpty(partId);
            return { deleted: true };
        }
        return { deleted: false };
    },

    getConversationParticipants: async (conversationId) => {
        const convId = convIdSchema.parse(conversationId);
        return listParticipants(convId);
    },

    updateLastRead: async (conversationId, userId) => {
        const convId = convIdSchema.parse(conversationId);
        const uId = userIdSchema.parse(userId);
        return updateLastReadAt(convId, uId);
    },
};

module.exports = {
    conversationService,
    ConversationError,
};
