const request = require("supertest");
const app = require("../app");
const prisma = require("../db/client");

let token;
let userId;
let conversationId;

beforeAll(async () => {
    // 清空資料表
    await prisma.message.deleteMany();
    await prisma.conversationParticipant.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.user.deleteMany();

    // 建立測試使用者
    const createUser = await prisma.user.create({
        data: {
            name: "Message Tester",
            email: "msg@example.com",
            provider: "google",
            providerId: "google_msg_id",
            image: "https://example.com/msg-avatar.png",
        },
    });
    userId = createUser.id;

    // 第三方登入取得 token
    const res = await request(app).post("/api/users/auth/third-party").send({
        provider: "google",
        providerId: "google_msg_id",
        email: "msg@example.com",
        name: "Message Tester",
        image: "https://example.com/msg-avatar.png",
    });

    token = res.body.data.token;

    // 建立一個 conversation 並加入參與者
    const conversation = await prisma.conversation.create({
        data: {
            isGroup: false,
            participants: {
                create: {
                    userId: userId,
                },
            },
        },
    });

    conversationId = conversation.id;
});

afterAll(async () => {
    await prisma.$disconnect();
});

describe("Message APIs", () => {
    test("POST /api/messages/:conversationId - send message", async () => {
        const res = await request(app)
            .post(`/api/messages/${conversationId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                content: "Hello, this is a test message.",
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.content).toBe("Hello, this is a test message.");
    });

    test("GET /api/messages/:conversationId - fetch messages", async () => {
        const res = await request(app)
            .get(`/api/messages/${conversationId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    test("POST /api/messages - fail without JWT", async () => {
        const res = await request(app)
            .post(`/api/messages/${conversationId}`)
            .send({
                content: "No auth message.",
            });

        expect(res.statusCode).toBe(401);
    });
});
