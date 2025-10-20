// mobile/src/lib/api.ts
import axios from "axios";
import { getUserId } from "./session";

// Use your env (already set up earlier)
const baseURL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000";

export const api = axios.create({ baseURL });

// Attach x-user-id if present
api.interceptors.request.use(async (config) => {
  const userId = await getUserId();
  if (userId) {
    config.headers = config.headers || {};
    (config.headers as any)["x-user-id"] = userId;
  }
  return config;
});
