import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import React, { useContext, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../../firebaseConfig";
import { ThemeContext } from "../_layout";

export default function Register() {
  const { theme } = useContext(ThemeContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const registerUser = async () => {
    try {
      setError("");
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      router.replace("/auth/login");
    } catch (e: any) {
      setError("Something went wrong. Try a different email or password.");
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <View style={styles.centerWrapper}>
        <View
          style={[
            styles.card,
            { backgroundColor: theme.card, borderColor: theme.accent },
          ]}
        >
          <View style={styles.iconCircle}>
            <MaterialIcons
              name="person-add-alt"
              size={26}
              color={theme.accent}
            />
          </View>

          <Text style={[styles.title, { color: theme.text }]}>
            Create account
          </Text>
          <Text style={[styles.subtitle, { color: theme.subtle }]}>
            It only takes a moment to get set up.
          </Text>

          <TextInput
            placeholder="Email"
            placeholderTextColor={theme.subtle}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            style={[
              styles.input,
              { color: theme.text, borderColor: theme.subtle },
            ]}
          />

          <TextInput
            placeholder="Password"
            placeholderTextColor={theme.subtle}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={[
              styles.input,
              { color: theme.text, borderColor: theme.subtle },
            ]}
          />

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}

          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: theme.accent }]}
            onPress={registerUser}
          >
            <Text style={styles.primaryButtonText}>Sign up</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/auth/login")}
            style={styles.linkWrapper}
          >
            <Text style={[styles.linkText, { color: theme.subtle }]}>
              Already have an account?{" "}
              <Text style={{ color: theme.accent }}>Log in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  centerWrapper: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  card: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderRadius: 18,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    marginBottom: 8,
    backgroundColor: "rgba(168,85,247,0.12)",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 18,
  },
  input: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 10,
  },
  errorText: {
    color: "#f97373",
    fontSize: 13,
    marginBottom: 10,
  },
  primaryButton: {
    marginTop: 4,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 15,
  },
  linkWrapper: {
    marginTop: 16,
    alignItems: "center",
  },
  linkText: {
    fontSize: 13,
  },
});
/// MARYAN ///

import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import React, { useContext, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../../firebaseConfig";
import { ThemeContext } from "../_layout";

export default function Register() {
  const { theme } = useContext(ThemeContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateRegister = () => {
    if (!email.trim()) {
      Alert.alert("Validation Error", "Please enter your email address");
      return false;
    }

    if (!email.includes("@")) {
      Alert.alert("Validation Error", "Please enter a valid email address");
      return false;
    }

    if (!password) {
      Alert.alert("Validation Error", "Please enter a password");
      return false;
    }

    if (password.length < 6) {
      Alert.alert("Validation Error", "Password must be at least 6 characters long");
      return false;
    }

    if (!confirmPassword) {
      Alert.alert("Validation Error", "Please confirm your password");
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert("Validation Error", "Passwords do not match");
      return false;
    }

    return true;
  };

  const registerUser = async () => {
    if (!validateRegister()) {
      return;
    }

    setLoading(true);

    try {
      setError("");
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      
      Alert.alert(
        "Success",
        "Account created successfully! Please log in.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/auth/login"),
          },
        ]
      );
    } catch (e: any) {
      let errorMessage = "Something went wrong. Please try again.";

      if (e.code === "auth/email-already-in-use") {
        errorMessage = "This email is already registered. Please log in or use a different email.";
      } else if (e.code === "auth/invalid-email") {
        errorMessage = "Invalid email format. Please enter a valid email address.";
      } else if (e.code === "auth/weak-password") {
        errorMessage = "Password is too weak. Please use a stronger password.";
      }

      Alert.alert("Registration Failed", errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <View style={styles.centerWrapper}>
        <View
          style={[
            styles.card,
            { backgroundColor: theme.card, borderColor: theme.accent },
          ]}
        >
          <View style={styles.iconCircle}>
            <MaterialIcons
              name="person-add-alt"
              size={26}
              color={theme.accent}
            />
          </View>

          <Text style={[styles.title, { color: theme.text }]}>
            Create account
          </Text>
          <Text style={[styles.subtitle, { color: theme.subtle }]}>
            It only takes a moment to get set up.
          </Text>

          <TextInput
            placeholder="Email"
            placeholderTextColor={theme.subtle}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            editable={!loading}
            style={[
              styles.input,
              { color: theme.text, borderColor: theme.subtle },
            ]}
          />

          <TextInput
            placeholder="Password (min. 6 characters)"
            placeholderTextColor={theme.subtle}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!loading}
            style={[
              styles.input,
              { color: theme.text, borderColor: theme.subtle },
            ]}
          />

          <TextInput
            placeholder="Confirm Password"
            placeholderTextColor={theme.subtle}
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            editable={!loading}
            style={[
              styles.input,
              { color: theme.text, borderColor: theme.subtle },
            ]}
          />

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={theme.accent} />
              <Text style={[styles.loadingText, { color: theme.subtle }]}>
                Creating account...
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.primaryButton,
              { backgroundColor: theme.accent },
              loading && styles.disabledButton,
            ]}
            onPress={registerUser}
            disabled={loading}
          >
            <Text style={styles.primaryButtonText}>Sign up</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/auth/login")}
            style={styles.linkWrapper}
            disabled={loading}
          >
            <Text style={[styles.linkText, { color: theme.subtle }]}>
              Already have an account?{" "}
              <Text style={{ color: theme.accent }}>Log in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  centerWrapper: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  card: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderRadius: 18,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    marginBottom: 8,
    backgroundColor: "rgba(168,85,247,0.12)",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 18,
  },
  input: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 10,
  },
  errorText: {
    color: "#f97373",
    fontSize: 13,
    marginBottom: 10,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
  },
  primaryButton: {
    marginTop: 4,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 15,
  },
  linkWrapper: {
    marginTop: 16,
    alignItems: "center",
  },
  linkText: {
    fontSize: 13,
  },
});
