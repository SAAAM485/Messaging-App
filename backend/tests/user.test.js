const request = require("supertest");
const app = require("../app");
const prisma = require("../db/client");
const bcrypt = require("bcryptjs");

let token; // 存放 JWT token

beforeAll(async () => {
    // 清空資料表，避免測試干擾
    await prisma.friend.deleteMany();
    await prisma.message.deleteMany();
    await prisma.conversationParticipant.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.user.deleteMany();
    const hashedPassword = await bcrypt.hash("password", 10);
    // 建立測試用使用者（此帳號代表已存在）
    const createUser = await prisma.user.create({
        data: {
            name: "Test User",
            email: "test@example.com",
            password: hashedPassword,
            provider: "LOCAL",
            providerId: "test@example.com",
        },
    });
});

afterAll(async () => {
    await prisma.$disconnect();
});

// describe("User Third-Party Login or Create", () => {
//     test("POST /api/users/auth/thirdparty - create new user if not exist", async () => {
//         const newProviderId = "new_google_id_2";

//         const res = await request(app).post("/api/users/auth/thirdparty").send({
//             provider: "google",
//             providerId: newProviderId,
//             email: "newuser2@example.com",
//             name: "New User 2",
//             image: "https://example.com/avatar2.png",
//         });

//         expect(res.statusCode).toBe(200);
//         expect(res.body.success).toBe(true);
//         expect(res.body.data.user).toHaveProperty("name", "New User 2");
//         expect(res.body.data).toHaveProperty("token");
//     });

//     test("POST /api/users/auth/thirdparty - login existing user", async () => {
//         const existingProviderId = "test_google_id";

//         const res = await request(app).post("/api/users/auth/thirdparty").send({
//             provider: "google",
//             providerId: existingProviderId,
//             email: "test@example.com",
//             name: "Test User",
//             image: "https://example.com/avatar.png",
//         });

//         expect(res.statusCode).toBe(200);
//         expect(res.body.success).toBe(true);
//         expect(res.body.data.user).toHaveProperty("name", "Test User");
//         expect(res.body.data).toHaveProperty("token");

//         // 儲存 token 供後續需要授權的測試使用
//         token = res.body.data.token;
//     });
// });

describe("User Login or Register", () => {
    test("POST /api/users/auth/register - register new user", async () => {
        const res = await request(app).post("/api/users/auth/register").send({
            email: "newuser2@example.com",
            name: "New User 2",
            password: "newpassword",
        });

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.user).toHaveProperty("name", "New User 2");
        expect(res.body.data).toHaveProperty("token");
    });

    test("POST /api/users/auth/login - login existing user", async () => {
        const res = await request(app).post("/api/users/auth/login").send({
            email: "test@example.com",
            name: "Test User",
            password: "password",
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.user).toHaveProperty("name", "Test User");
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

    test("GET /api/users/profile/:name - get user profile by name with JWT", async () => {
        const res = await request(app)
            .get("/api/users/profile/New")
            .set("Authorization", `Bearer ${token}`);

        console.log(res.data);
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty("name", "New User 2");
    });

    test("GET /api/users - fail without JWT", async () => {
        const res = await request(app).get("/api/users");

        expect(res.statusCode).toBe(401); // Unauthorized
    });

    test("PATCH /api/users/lastseen - update last seen with JWT", async () => {
        const res = await request(app)
            .patch("/api/users/lastseen")
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

    test("GET /api/users/conversations/group - get user group conversations with JWT", async () => {
        const res = await request(app)
            .get("/api/users/conversations/group")
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });
});
