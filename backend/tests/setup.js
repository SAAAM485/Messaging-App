const prisma = require("../db/client");

beforeAll(async () => {
    await prisma.friend.deleteMany();
    await prisma.message.deleteMany();
    await prisma.conversationParticipant.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.user.deleteMany();

    await prisma.user.create({
        data: {
            id: "user-test-id",
            name: "Test User",
            email: "test@example.com",
            provider: "google",
            providerId: "test_google_id",
            image: "https://example.com/avatar.png",
        },
    });
});

afterAll(async () => {
    await prisma.$disconnect();
});
