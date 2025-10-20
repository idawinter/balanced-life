// mobile/src/lib/session.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
const KEY = "balancedlife.userId";

export async function saveUserId(id: string) {
  await AsyncStorage.setItem(KEY, id);
}

export async function getUserId(): Promise<string | null> {
  return AsyncStorage.getItem(KEY);
}

export async function clearUserId() {
  await AsyncStorage.removeItem(KEY);
}
