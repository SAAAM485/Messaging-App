const request = require("supertest");
const app = require("../app");
const prisma = require("../db/client");
const bcrypt = require("bcryptjs");

let token;
let user1Id, user2Id, user3Id;
let oneOnOneConvId, groupConvId;

beforeAll(async () => {
    await prisma.friend.deleteMany();
    await prisma.message.deleteMany();
    await prisma.conversationParticipant.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.user.deleteMany();
    const hashedPassword = await bcrypt.hash("password", 10);

    const u1 = await prisma.user.create({
        data: {
            name: "User1",
            email: "u1@example.com",
            password: hashedPassword,
            provider: "LOCAL",
            providerId: "u1@example.com",
        },
    });
    const u2 = await prisma.user.create({
        data: {
            name: "User2",
            email: "u2@example.com",
            password: hashedPassword,
            provider: "LOCAL",
            providerId: "u2@example.com",
        },
    });
    const u3 = await prisma.user.create({
        data: {
            name: "User3",
            email: "u3@example.com",
            password: hashedPassword,
            provider: "LOCAL",
            providerId: "u3@example.com",
        },
    });
    user1Id = u1.id;
    user2Id = u2.id;
    user3Id = u3.id;

    const res = await request(app).post("/api/users/auth/login").send({
        email: "u1@example.com",
        password: "password",
    });
    token = res.body.data.token;
});

afterAll(async () => {
    await prisma.$disconnect();
});

describe("Conversation APIs", () => {
    test("Create one-on-one conversation (findOrCreate)", async () => {
        const res = await request(app)
            .post("/api/conversations/private")
            .set("Authorization", `Bearer ${token}`)
            .send({ participantId: user2Id });
        expect(res.statusCode).toBe(200);
        oneOnOneConvId = res.body.data.id;
    });

    test("Create group conversation", async () => {
        const res = await request(app)
            .post("/api/conversations/group")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "Group Chat",
                isGroup: true,
                participants: [user1Id, user3Id],
            });
        expect(res.statusCode).toBe(201);
        groupConvId = res.body.data.id;
    });

    test("Fetch one-on-one conversation details", async () => {
        const res = await request(app)
            .get(`/api/conversations/${oneOnOneConvId}`)
            .set("Authorization", `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.data.id).toBe(oneOnOneConvId);
        expect(res.body.data.participants.some((p) => p.userId === user1Id));
    });

    test("Invalid conversation ID returns 404", async () => {
        const res = await request(app)
            .get("/api/conversations/cmck3lxd100011ec5oo7cjrgq")
            .set("Authorization", `Bearer ${token}`);
        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.error.message).toBe("Conversation not found.");
    });

    test("Add participant to group", async () => {
        const res = await request(app)
            .post(`/api/conversations/${groupConvId}/participants`)
            .set("Authorization", `Bearer ${token}`)
            .send({ participantId: user2Id });
        expect(res.statusCode).toBe(200);
        expect(
            res.body.data.participants.some((p) => p.userId === user2Id)
        ).toBe(true);
    });

    test("Adding same participant again should 400", async () => {
        const res = await request(app)
            .post(`/api/conversations/${groupConvId}/participants`)
            .set("Authorization", `Bearer ${token}`)
            .send({ participantId: user2Id });
        expect(res.statusCode).toBe(400);
    });

    test("List group participants", async () => {
        const res = await request(app)
            .get(`/api/conversations/${groupConvId}/participants`)
            .set("Authorization", `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThan(0);
    });

    test("Remove self from group", async () => {
        const res = await request(app)
            .delete(`/api/conversations/${groupConvId}/participants`)
            .set("Authorization", `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.data.some((p) => p.userId === user1Id)).toBe(false);
    });

    test("List group participants", async () => {
        const res = await request(app)
            .get(`/api/conversations/${oneOnOneConvId}/participants`)
            .set("Authorization", `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
        console.log(res.body.data);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThan(0);
    });

    test("Mark conversation as read", async () => {
        const res = await request(app)
            .post(`/api/conversations/${oneOnOneConvId}/read`)
            .set("Authorization", `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.data).toHaveProperty("lastReadAt");
    });
});
