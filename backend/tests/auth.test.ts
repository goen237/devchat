import request from "supertest";
import app from "../src/app";

describe("Auth Routes", () => {
  describe("POST /api/auth/register", () => {
    it("should register a new user", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ username: "testuser", email: "test@example.com", password: "testpass" });
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("User created");
    });

    it("should not register duplicate user", async () => {
      await request(app)
        .post("/api/auth/register")
        .send({ username: "testuser", email: "test@example.com", password: "testpass" });
      const res = await request(app)
        .post("/api/auth/register")
        .send({ username: "testuser", email: "test@example.com", password: "testpass" });
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe("User exists");
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login with correct credentials", async () => {
      await request(app)
        .post("/api/auth/register")
        .send({ username: "loginuser", email: "login@example.com", password: "loginpass" });
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "login@example.com", password: "loginpass" });
      expect(res.statusCode).toBe(200);
      expect(res.body.token).toBeDefined();
    });

    it("should not login with wrong credentials", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "wrong@example.com", password: "wrongpass" });
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe("Invalid credentials");
    });
  });

  describe("GET /api/auth/google-oauth", () => {
    it("should redirect to Google OAuth", async () => {
      const res = await request(app).get("/api/auth/google-oauth");
      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toContain("accounts.google.com");
    });
  });
});
