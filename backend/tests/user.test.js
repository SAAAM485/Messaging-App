const request = require("supertest");
const app = require("../app");
const prisma = require("../db/client");

let token; // 存放 JWT token

beforeAll(async () => {
    // 清空資料表，避免測試干擾
    await prisma.friend.deleteMany();
    await prisma.message.deleteMany();
    await prisma.conversationParticipant.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.user.deleteMany();

    // 建立測試用使用者（此帳號代表已存在）
    const createUser = await prisma.user.create({
        data: {
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

describe("User Third-Party Login or Create", () => {
    test("POST /api/users/auth/third-party - create new user if not exist", async () => {
        const newProviderId = "new_google_id_2";

        const res = await request(app)
            .post("/api/users/auth/third-party")
            .send({
                provider: "google",
                providerId: newProviderId,
                email: "newuser2@example.com",
                name: "New User 2",
                image: "https://example.com/avatar2.png",
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.user).toHaveProperty("providerId", newProviderId);
        expect(res.body.data).toHaveProperty("token");
    });

    test("POST /api/users/auth/third-party - login existing user", async () => {
        const existingProviderId = "test_google_id";

        const res = await request(app)
            .post("/api/users/auth/third-party")
            .send({
                provider: "google",
                providerId: existingProviderId,
                email: "test@example.com",
                name: "Test User",
                image: "https://example.com/avatar.png",
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.user).toHaveProperty(
            "providerId",
            existingProviderId
        );
        expect(res.body.data).toHaveProperty("token");

        // 儲存 token 供後續需要授權的測試使用
        token = res.body.data.token;
    });
});

describe("Public User APIs", () => {
    test("GET /api/users/emails/:email - get user profile by email", async () => {
        const res = await request(app).get(
            "/api/users/emails/test@example.com"
        );

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty("name", "Test User");
    });
});

describe("Protected User APIs", () => {
    test("GET /api/users - get user profile with JWT", async () => {
        const res = await request(app)
            .get("/api/users")
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty("name", "Test User");
    });

    test("GET /api/users - fail without JWT", async () => {
        const res = await request(app).get("/api/users");

        expect(res.statusCode).toBe(401); // Unauthorized
    });

    test("PATCH /api/users/last-seen - update last seen with JWT", async () => {
        const res = await request(app)
            .patch("/api/users/last-seen")
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.message).toBe("Last seen updated.");
    });

    test("GET /api/users/conversations - get user conversations with JWT", async () => {
        const res = await request(app)
            .get("/api/users/conversations")
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });
});
