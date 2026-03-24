import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

async function getItem(key: string): Promise<string | null> {
  try {
    if (Platform.OS === "web") {
      return window.localStorage.getItem(key); // web
    }
    return await SecureStore.getItemAsync(key); // mobile
  } catch {
    return null;
  }
}

async function setItem(key: string, value: string): Promise<void> {
  try {
    if (Platform.OS === "web") {
      window.localStorage.setItem(key, value); // web
      return;
    }
    await SecureStore.setItemAsync(key, value); // mobile
  } catch {}
}

async function removeItem(key: string): Promise<void> {
  try {
    if (Platform.OS === "web") {
      window.localStorage.removeItem(key); // web
      return;
    }
    await SecureStore.deleteItemAsync(key); // mobile
  } catch {}
}

export default {
  getItem,
  setItem,
  removeItem,
};