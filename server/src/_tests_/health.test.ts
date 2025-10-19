import request from "supertest";
import { app } from "../app";

describe("GET /health", () => {
  it("returns ok: true", async () => {
    const res = await request(app).get("/health").expect(200);
    expect(res.body).toHaveProperty("ok", true);
    expect(res.body).toHaveProperty("service", "balanced-life-api");
  });
});
