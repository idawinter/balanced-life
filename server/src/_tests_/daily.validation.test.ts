// src/_tests_/daily.validation.test.ts
import request from "supertest";
import { app } from "../app";

// pass auth middleware with a fake user id
const asUser = (req: request.Test) => req.set("x-user-id", "test-user-1");

describe("Daily routes input validation", () => {
  test("GET /daily without from/to -> 400", async () => {
    const res = await asUser(request(app).get("/daily"));
    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
  });

  test("GET /daily with bad date format -> 400", async () => {
    const res = await asUser(request(app).get("/daily?from=2025/10/01&to=2025-10-31"));
    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
  });

  test("POST /daily/:date with bad date -> 400", async () => {
    const res = await asUser(
      request(app)
        .post("/daily/not-a-date")
        .send({ metrics: { sleepHours: 7 } })
        .set("Content-Type", "application/json")
    );
    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
  });
});
