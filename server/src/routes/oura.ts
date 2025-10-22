// server/src/routes/oura.ts
import { Router, Request, Response } from "express";
import axios from "axios";
import qs from "querystring";
import { UserToken } from "../models/UserToken";

export const ouraRouter = Router();

// Tiny probe so we can confirm the router is mounted
ouraRouter.get("/test", (_req: Request, res: Response) => {
  res.send("oura ok");
});

/**
 * GET /oura/connect?userId=abc123
 * Redirect the user to Oura’s consent screen.
 */
ouraRouter.get("/connect", async (req: Request, res: Response) => {
  const userId = String(req.query.userId || "").trim();
  if (!userId) return res.status(400).send("Missing userId");

  const authUrl = new URL("https://cloud.ouraring.com/oauth/authorize");
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", process.env.OURA_CLIENT_ID || "");
  authUrl.searchParams.set("redirect_uri", process.env.OURA_REDIRECT_URI || "");
  authUrl.searchParams.set("scope", "email personal daily");
  authUrl.searchParams.set("state", userId);

  return res.redirect(authUrl.toString());
});

/**
 * GET /oura/callback?code=...&state=userId
 */
ouraRouter.get("/callback", async (req: Request, res: Response) => {
  try {
    const code = String(req.query.code || "");
    const userId = String(req.query.state || "");
    if (!code || !userId) return res.status(400).send("Missing code/state");

    const tokenRes = await axios.post(
      "https://cloud.ouraring.com/oauth/token",
      qs.stringify({
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.OURA_REDIRECT_URI,
        client_id: process.env.OURA_CLIENT_ID,
        client_secret: process.env.OURA_CLIENT_SECRET,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { access_token, refresh_token, expires_in } = tokenRes.data;

    await UserToken.findOneAndUpdate(
      { userId, provider: "oura" },
      {
        accessToken: access_token,
        refreshToken: refresh_token,
        ...(expires_in ? { expiresAt: new Date(Date.now() + expires_in * 1000) } : {}),
      },
      { upsert: true, new: true }
    );

    return res.send(`<html><body><h1>Oura connected ✅</h1><p>You can close this tab and return to the app.</p></body></html>`);
  } catch (e: any) {
    console.error("Oura callback error:", e?.response?.data || e?.message);
    return res.status(500).send("Failed to connect to Oura.");
  }
});

/**
 * GET /oura/pull?userId=abc123
 */
ouraRouter.get("/pull", async (req: Request, res: Response) => {
  try {
    const userId = String(req.query.userId || "");
    if (!userId) return res.status(400).json({ ok: false, error: "Missing userId" });

    const token = await UserToken.findOne({ userId, provider: "oura" });
    if (!token) return res.status(404).json({ ok: false, error: "No Oura token for user" });

    const resp = await axios.get("https://api.ouraring.com/v2/usercollection/daily_sleep", {
      headers: { Authorization: `Bearer ${token.accessToken}` },
      params: {
        start_date: new Date(Date.now() - 14 * 864e5).toISOString().slice(0, 10),
        end_date: new Date().toISOString().slice(0, 10),
      },
    });

    return res.json({ ok: true, data: resp.data });
  // inside ouraRouter.get("/callback", async (req, res) => { ... } catch { ... }
  } catch (e: any) {
    const details = e?.response?.data || { message: e?.message };
    console.error("Oura callback error:", details);
    // TEMP: show details in the browser so we can fix quickly
    return res
      .status(500)
      .send(`<pre>Failed to connect to Oura\n\n${JSON.stringify(details, null, 2)}</pre>`);
  }
  
});
