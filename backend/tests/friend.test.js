const request = require("supertest");
const app = require("../app");
const prisma = require("../db/client");

let user1Id, user2Id, user3Id;
let token1, token2, token3;
let friendRequestId;

beforeAll(async () => {
    await prisma.friend.deleteMany();
    await prisma.message.deleteMany();
    await prisma.conversationParticipant.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.user.deleteMany();

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

    const res1 = await request(app).post("/api/users/auth/third-party").send({
        name: "User1",
        email: "u1@example.com",
        provider: "google",
        providerId: "gid1",
    });
    token1 = res1.body.data.token;

    const res2 = await request(app).post("/api/users/auth/third-party").send({
        name: "User2",
        email: "u2@example.com",
        provider: "google",
        providerId: "gid2",
    });
    token2 = res2.body.data.token;

    const res3 = await request(app).post("/api/users/auth/third-party").send({
        name: "User3",
        email: "u3@example.com",
        provider: "google",
        providerId: "gid3",
    });
    token3 = res3.body.data.token;
});

afterAll(async () => {
    await prisma.$disconnect();
});

describe("Friend APIs", () => {
    test("Send friend request", async () => {
        const res = await request(app)
            .post(`/api/friends/friendships/${user2Id}`)
            .set("Authorization", `Bearer ${token1}`);

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.status).toBe("pending");
        friendRequestId = res.body.data.id;
    });

    test("Check pending friendship", async () => {
        const res = await request(app)
            .get(`/api/friends/friendships/${user2Id}`)
            .set("Authorization", `Bearer ${token1}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.status).toBe("pending");
    });

    test("Get all sent requests (user 1)", async () => {
        const res = await request(app)
            .get("/api/friends/friend-requests/sent")
            .set("Authorization", `Bearer ${token1}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.some((r) => r.friendId === user2Id)).toBe(true);
    });

    test("Get received requests (user 2)", async () => {
        const res = await request(app)
            .get("/api/friends/friend-requests")
            .set("Authorization", `Bearer ${token2}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data[0].id).toBe(friendRequestId);
    });

    test("Accept friend request", async () => {
        const res = await request(app)
            .patch(`/api/friends/friend-requests/${friendRequestId}`)
            .set("Authorization", `Bearer ${token2}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.status).toBe("accepted");
    });

    test("Get all accepted friendships (user 1)", async () => {
        const res = await request(app)
            .get("/api/friends/friendships")
            .set("Authorization", `Bearer ${token1}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.some((f) => f.friendId === user2Id)).toBe(true);
    });

    test("Reject friend request", async () => {
        const resReq = await request(app)
            .post(`/api/friends/friendships/${user3Id}`)
            .set("Authorization", `Bearer ${token1}`);
        const rejectId = resReq.body.data.id;
        const res = await request(app)
            .delete(`/api/friends/friend-requests/${rejectId}`)
            .set("Authorization", `Bearer ${token3}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.message).toBe("Deleted successfully.");
    });

    test("Send friend request to same user again should fail", async () => {
        const res = await request(app)
            .post(`/api/friends/friendships/${user2Id}`)
            .set("Authorization", `Bearer ${token1}`);

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
    });

    test("Send friend request to self should fail", async () => {
        const res = await request(app)
            .post(`/api/friends/friendships/${user1Id}`)
            .set("Authorization", `Bearer ${token1}`);

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
    });
});
