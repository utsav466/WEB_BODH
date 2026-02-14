import request from "supertest";
import mongoose from "mongoose";
import app from "../index";
import { UserModel } from "../models/user.model";
import { MONGODB_URI } from "../config";

describe("Admin User Integration Tests", () => {

  let token: string;

  const adminData = {
    fullName: "Admin User",
    email: "admin@example.com",
    password: "password123",
    confirmPassword: "password123",
    username: "adminuser",
  };

  const userData = {
    fullName: "Normal User",
    email: "user@example.com",
    password: "password123",
    username: "normaluser",
    role: "user",
  };

  beforeAll(async () => {
    await mongoose.connect(MONGODB_URI);

    // Register admin
    await request(app)
      .post("/api/auth/register")
      .send(adminData);

    // Manually make admin
    await UserModel.updateOne(
      { email: adminData.email },
      { role: "admin" }
    );

    // Login admin
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: adminData.email,
        password: adminData.password,
      });

    token = loginRes.body.token;
  });

  afterEach(async () => {
    await UserModel.deleteMany({ email: { $ne: adminData.email } });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  // 1️⃣ Create User
  it("should create a user via admin route", async () => {
    const res = await request(app)
      .post("/api/admin/users")
      .set("Authorization", `Bearer ${token}`)
      .send(userData);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  // 2️⃣ Get All Users
  it("should get users with pagination", async () => {
    await UserModel.create(userData);

    const res = await request(app)
      .get("/api/admin/users?page=1&limit=5")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.pagination).toBeDefined();
  });

  // 3️⃣ Get User By ID
  it("should get user by id", async () => {
    const user = await UserModel.create(userData);

    const res = await request(app)
      .get(`/api/admin/users/${user._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(userData.email);
  });

  // 4️⃣ Invalid ID
  it("should return 400 for invalid id", async () => {
    const res = await request(app)
      .get("/api/admin/users/invalid-id")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
  });

  // 5️⃣ Update User
  it("should update user", async () => {
    const user = await UserModel.create(userData);

    const res = await request(app)
      .put(`/api/admin/users/${user._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ fullName: "Updated Name" });

    expect(res.status).toBe(200);
    expect(res.body.data.fullName).toBe("Updated Name");
  });

  // 6️⃣ Delete User
  it("should delete user", async () => {
    const user = await UserModel.create(userData);

    const res = await request(app)
      .delete(`/api/admin/users/${user._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  // 7️⃣ Missing Token
  it("should return 401 if no token is provided", async () => {
    const res = await request(app)
      .get("/api/admin/users");

    expect(res.status).toBe(401);
  });

  // 8️⃣ Non-admin Forbidden
  it("should return 403 if user is not admin", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({
        fullName: "Normal",
        email: "normal@example.com",
        password: "password123",
        confirmPassword: "password123",
        username: "normaluser2",
      });

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: "normal@example.com",
        password: "password123",
      });

    const normalToken = loginRes.body.token;

    const res = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${normalToken}`);

    expect(res.status).toBe(403);
  });

  // 9️⃣ Get User Not Found
  it("should return 404 if user does not exist", async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .get(`/api/admin/users/${fakeId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  // 🔟 Update User Not Found
  it("should return 404 when updating non-existing user", async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .put(`/api/admin/users/${fakeId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ fullName: "Ghost" });

    expect(res.status).toBe(404);
  });

  // 1️⃣1️⃣ Delete User Not Found
  it("should return 404 when deleting non-existing user", async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .delete(`/api/admin/users/${fakeId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  // 1️⃣2️⃣ Pagination Beyond Range
  it("should return empty data for page beyond range", async () => {
    await UserModel.create({
      fullName: "User1",
      email: "u1@example.com",
      password: "pass123",
      username: "u1",
    });

    const res = await request(app)
      .get("/api/admin/users?page=100&limit=10")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(0);
  });

  // 1️⃣3️⃣ Limit = 1
  it("should respect limit parameter", async () => {
    await UserModel.create([
      {
        fullName: "UserA",
        email: "ua@example.com",
        password: "pass123",
        username: "ua",
      },
      {
        fullName: "UserB",
        email: "ub@example.com",
        password: "pass123",
        username: "ub",
      },
    ]);

    const res = await request(app)
      .get("/api/admin/users?page=1&limit=1")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

});
