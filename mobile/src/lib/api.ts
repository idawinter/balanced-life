// mobile/src/lib/api.ts
import axios from "axios";

const API_URL = process.env.EXPO_PUBLIC_API_URL || process.env.API_URL || "http://localhost:4000";

// In Expo, env vars should be prefixed with EXPO_PUBLIC_ to be available at runtime.
// We’ll read API_URL from .env if supported by your template.

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});
