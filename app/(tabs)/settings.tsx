import { signOut } from "firebase/auth";
import React, { useContext } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { auth } from "../../firebaseConfig";
import { ThemeContext } from "../_layout";

export default function SettingsScreen() {
  const { theme } = useContext(ThemeContext);
  const user = auth.currentUser;

  const logout = async () => {
    try {
      await signOut(auth);
      alert("Logged out!");
      window.location.href = "/auth/login"; // Expo Router redirect
    } catch (error) {
      console.log("Logout error:", error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Settings</Text>

      <View style={[styles.box, { backgroundColor: theme.card }]}>
        <Text style={[styles.label, { color: theme.text }]}>Logged in as:</Text>
        <Text style={[styles.email, { color: theme.accent }]}>
          {user?.email}
        </Text>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: "center", justifyContent: "center" },

  title: { fontSize: 28, fontWeight: "bold", marginBottom: 30 },

  box: {
    padding: 20,
    width: "90%",
    borderRadius: 12,
    marginBottom: 40,
    alignItems: "center",
  },

  label: { fontSize: 18, marginBottom: 5 },

  email: { fontSize: 18, fontWeight: "bold" },

  logoutBtn: {
    backgroundColor: "#ff5555",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
  },

  logoutText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
