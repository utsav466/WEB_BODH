import request from "supertest";
import mongoose from "mongoose";
import app from "../index";
import { UserModel } from "../models/user.model";
import { MONGODB_URI } from "../config";

describe("Auth Integration Tests", () => {

  const userData = {
    fullName: "Test User",
    email: "test@example.com",
    password: "password123",
    confirmPassword: "password123",
    username: "testuser",
  };

  // ✅ Connect DB
  beforeAll(async () => {
    await mongoose.connect(MONGODB_URI);
  });

  // ✅ Clean DB
  afterEach(async () => {
    await UserModel.deleteMany({});
  });

  // ✅ Close DB
  afterAll(async () => {
    await mongoose.connection.close();
  });

  // 1️⃣ Register Success
  it("should register a new user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(userData);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  // 2️⃣ Register Validation Fail
  it("should fail registration with invalid data", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "bademail" });

    expect(res.status).toBe(400);
  });

  // 3️⃣ Login Success
  it("should login successfully", async () => {
    await request(app).post("/api/auth/register").send(userData);

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: userData.email,
        password: userData.password,
      });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  // 4️⃣ Wrong Password
  it("should fail login with wrong password", async () => {
    await request(app).post("/api/auth/register").send(userData);

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: userData.email,
        password: "wrongpassword",
      });

    expect(res.status).toBe(401);
  });

  // 5️⃣ Forgot Password
  it("should generate reset token", async () => {
    await request(app).post("/api/auth/register").send(userData);

    const res = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: userData.email });

    expect(res.status).toBe(200);
    expect(res.body.resetToken).toBeDefined();
  });

  // 6️⃣ Reset Password
  it("should reset password successfully", async () => {
    await request(app).post("/api/auth/register").send(userData);

    const forgot = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: userData.email });

    const token = forgot.body.resetToken;

    const res = await request(app)
      .post("/api/auth/reset-password")
      .send({
        token,
        password: "newpassword123",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  // 7️⃣ Duplicate Email
  it("should fail if email already exists", async () => {
    await request(app).post("/api/auth/register").send(userData);

    const res = await request(app)
      .post("/api/auth/register")
      .send({
        ...userData,
        username: "newusername"
      });

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  // 8️⃣ Duplicate Username
  it("should fail if username already exists", async () => {
    await request(app).post("/api/auth/register").send(userData);

    const res = await request(app)
      .post("/api/auth/register")
      .send({
        ...userData,
        email: "newemail@example.com"
      });

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  // 9️⃣ Login Non-existing Email
  it("should fail login if email does not exist", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "notfound@example.com",
        password: "password123",
      });

    expect(res.status).toBe(404);
  });

  // 🔟 Forgot Password Non-existing Email
  it("should respond safely even if email does not exist", async () => {
    const res = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: "notfound@example.com" });

    expect(res.status).toBe(200);
  });

  // 1️⃣1️⃣ Reset Invalid Token
  it("should fail reset-password with invalid token", async () => {
    const res = await request(app)
      .post("/api/auth/reset-password")
      .send({
        token: "invalid-token",
        password: "newpassword123",
      });

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  // 1️⃣2️⃣ Reuse Reset Token
  it("should not allow reused reset token", async () => {
    await request(app).post("/api/auth/register").send(userData);

    const forgot = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: userData.email });

    const token = forgot.body.resetToken;

    await request(app)
      .post("/api/auth/reset-password")
      .send({
        token,
        password: "newpassword123",
      });

    const reuse = await request(app)
      .post("/api/auth/reset-password")
      .send({
        token,
        password: "anotherpassword",
      });

    expect(reuse.status).toBeGreaterThanOrEqual(400);
  });

});
