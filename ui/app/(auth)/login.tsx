import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { router } from "expo-router";
import storage from "../../storage";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function apiLogin(username: string, password: string) {
    const root_url = process.env.EXPO_PUBLIC_API_URL;
    const response = await fetch(`${root_url}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error("Login failed");
    }

    return response.json();
  }

  const handleLogin = async () => {
    setLoading(true);
    try {
      const data = await apiLogin(email, password);
      console.log("SETTING THE TOKEN", data.access_token)
      await storage.setItem("token", data.access_token);

      const root_url = process.env.EXPO_PUBLIC_API_URL; // using const root_url for better handling
      const meRes = await fetch(`${root_url}/me`,{
        headers: { Authorization: `Bearer ${data.access_token}` },
      });

      const me = await meRes.json();
      await storage.setItem("user", JSON.stringify(me));

      // route to main screen after successful login
      router.replace("/");
    } catch (err) {
      alert("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#000"
        value={email}
        autoCapitalize="none"
        keyboardType="default"
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#000"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Button title={loading ? "Logging in..." : "Login"} onPress={handleLogin} />

      {/* Register Navigation Link */} 
      <Text style={styles.link}>
  Don’t have an account?{" "}
  <Text
    style={{ color: "#007AFF", fontWeight: "bold" }}
    onPress={() => router.replace("/(auth)/register" as any)}
  >
    Register
  </Text>
</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 32, marginBottom: 20, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
    backgroundColor: "#fff",
    color: "#000",
  },
  link: {
    marginTop: 15,
    color: "#2b2a2a",
    textAlign: "center",
    },
});