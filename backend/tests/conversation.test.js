const request = require("supertest");
const app = require("../app");
const prisma = require("../db/client");

let token;
let user1Id, user2Id, user3Id;
let oneOnOneConvId, groupConvId;

beforeAll(async () => {
    // 清库
    await prisma.message.deleteMany();
    await prisma.conversationParticipant.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.user.deleteMany();

    // 建三个测试用户
    const u1 = await prisma.user.create({
        data: {
            name: "User1",
            email: "u1@example.com",
            provider: "google",
            providerId: "gid1",
        },
    });
    const u2 = await prisma.user.create({
        data: {
            name: "User2",
            email: "u2@example.com",
            provider: "google",
            providerId: "gid2",
        },
    });
    const u3 = await prisma.user.create({
        data: {
            name: "User3",
            email: "u3@example.com",
            provider: "google",
            providerId: "gid3",
        },
    });
    user1Id = u1.id;
    user2Id = u2.id;
    user3Id = u3.id;

    // 第三方登录拿 token
    const res = await request(app).post("/api/users/auth/third-party").send({
        provider: "google",
        providerId: "gid1",
        email: "u1@example.com",
        name: "User1",
    });
    token = res.body.data.token;
});

afterAll(async () => {
    await prisma.$disconnect();
});

describe("Conversation APIs", () => {
    test("Create one-on-one conversation", async () => {
        const res = await request(app)
            .post("/api/conversations")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "Solo Chat",
                isGroup: false,
                participants: [user1Id],
            });
        expect(res.statusCode).toBe(201);
        oneOnOneConvId = res.body.data.id;
    });

    test("Create group conversation", async () => {
        const res = await request(app)
            .post("/api/conversations")
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
        expect(Array.isArray(res.body.data.participants)).toBe(true);
        expect(res.body.data.participants.length).toBeGreaterThan(0);
    });

    test("Remove self from group", async () => {
        const res = await request(app)
            .delete(`/api/conversations/${groupConvId}/participants`)
            .set("Authorization", `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.data.some((p) => p.userId === user1Id)).toBe(false);
    });
});
