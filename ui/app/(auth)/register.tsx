import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";

export default function RegisterScreen() {
const [username, setUsername] = useState("");
const [password, setPassword] = useState("");
const [email, setEmail] = useState("");
const [firstName, setFirstName] = useState("");
const [lastName, setLastName] = useState("");
const [loading, setLoading] = useState(false);

async function registerUser() {
if (!username || !password || !email) {
Alert.alert("Error", "Please fill required fields");
return;
}


setLoading(true);

try {
  const root_url = process.env.EXPO_PUBLIC_API_URL; // using const for better handling
  const response = await fetch(`${root_url}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
      email,
      first_name: firstName,
      last_name: lastName,
    }),
  });

  if (!response.ok) {
    throw new Error("Registration failed");
  }

  Alert.alert("Success", "Registration successful");

  // Redirect to login page after register
  router.replace("/(auth)/login" as any);

} catch (err) {
  Alert.alert("Error", "Could not register");
} finally {
  setLoading(false);
}


}

return (
  <View style={styles.container}>
    <Text style={styles.title}>Register</Text>

    <TextInput
      style={styles.input}
      placeholder="Username"
      placeholderTextColor="#000"
      value={username}
      onChangeText={setUsername}
      autoCapitalize="none"
    />

    <TextInput
      style={styles.input}
      placeholder="Email"
      placeholderTextColor="#000"
      value={email}
      onChangeText={setEmail}
      autoCapitalize="none"
      keyboardType="email-address"
    />

    <TextInput
      style={styles.input}
      placeholder="First Name"
      placeholderTextColor="#000"
      value={firstName}
      onChangeText={setFirstName}
    />

    <TextInput
      style={styles.input}
      placeholder="Last Name"
      placeholderTextColor="#000"
      value={lastName}
      onChangeText={setLastName}
    />

    <TextInput
      style={styles.input}
      placeholder="Password"
      placeholderTextColor="#000"
      secureTextEntry
      value={password}
      onChangeText={setPassword}
    />

    <Button
      title={loading ? "Registering..." : "Register"}
      onPress={registerUser}
    />

    <Text style={styles.link}>
      Already have an account?{" "}
      <Text
        style={{ color: "#007AFF", fontWeight: "bold" }}
        onPress={() => router.replace("/(auth)/login" as any)}
      >
        Login
      </Text>
    </Text>
  </View>
);

}

const styles = StyleSheet.create({
container: {
flex: 1,
justifyContent: "center",
padding: 20,
backgroundColor: "#fff",
},
title: {
fontSize: 32,
marginBottom: 20,
textAlign: "center",
},
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
