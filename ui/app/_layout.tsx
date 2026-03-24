import 'react-native-gesture-handler';
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import storage from "../storage";


export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    async function checkAuth() { // For admin vs user
      const token = await storage.getItem("token");
      setLoggedIn(!!token);
      setReady(true);
    }
    checkAuth();
  }, []);

  if (!ready) return null; 

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {!loggedIn ? (
        <Stack.Screen name="(auth)/login" />
      ) : (
        <Stack.Screen name="(tabs)/index" />
      )}
    </Stack>
  );
}
