import { router } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import { auth } from "../../firebaseConfig";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const registerUser = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      router.replace("/auth/login");
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button title="Register" onPress={registerUser} />

      <Text style={styles.link} onPress={() => router.push("/auth/login")}>
        Already have an account? Login
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 28, textAlign: "center", marginBottom: 20 },
  input: {
    borderWidth: 1,
    padding: 10,
    marginVertical: 8,
    borderRadius: 6,
  },
  error: { color: "red", marginBottom: 10 },
  link: { marginTop: 15, textAlign: "center", color: "blue" },
});
