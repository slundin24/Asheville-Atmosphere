import * as SecureStore from "expo-secure-store";

const storage = {
  getItem: async (key: string) => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  deleteItem: async (key: string) => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

export default storage;
