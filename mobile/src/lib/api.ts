import axios from "axios";
import { getUserId } from "./session";

const baseURL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000";
export const api = axios.create({ baseURL });

api.interceptors.request.use(async (config) => {
  const userId = await getUserId();
  if (userId) {
    // If axios v1 headers object supports .set(...)
    if (config.headers && typeof (config.headers as any).set === "function") {
      (config.headers as any).set("x-user-id", userId);
    } else {
      // Fallback for plain object headers
      config.headers = {
        ...(config.headers || {}),
        "x-user-id": userId,
      } as any;
    }
  }
  return config;
});
