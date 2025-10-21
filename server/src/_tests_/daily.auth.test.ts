import request from "supertest";
import app from "../app";

describe("auth middleware on /daily routes", () => {
  it("GET /daily?from=YYYY-MM-DD&to=YYYY-MM-DD → 401 without user", async () => {
    const res = await request(app)
      .get("/daily?from=2025-01-01&to=2025-01-02")
      .expect(401);
    expect(res.body.ok).toBe(false);
  });

  it("POST /daily/:date → 401 without user", async () => {
    const res = await request(app)
      .post("/daily/2025-01-01")
      .send({ metrics: { sleepHours: 7 } })
      .expect(401);
    expect(res.body.ok).toBe(false);
  });
});
