import request from "supertest";
import app from "../app";

describe("POST /auth/login (validation)", () => {
  it("400 when body is missing", async () => {
    const res = await request(app).post("/auth/login").send({}).expect(400);
    expect(res.body.ok).toBe(false);
  });

  it("400 when email is not a string", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: 123 })
      .expect(400);
    expect(res.body.ok).toBe(false);
  });
});
