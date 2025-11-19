import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
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

export default function Login() {
  const { theme } = useContext(ThemeContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const loginUser = async () => {
    try {
      setError("");
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace("/(tabs)");
    } catch (e) {
      setError("Check your email and password and try again.");
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
          {/* Icon + title */}
          <View style={styles.iconCircle}>
            <MaterialIcons name="task-alt" size={26} color={theme.accent} />
          </View>

          <Text style={[styles.title, { color: theme.text }]}>
            Welcome back
          </Text>
          <Text style={[styles.subtitle, { color: theme.subtle }]}>
            Log in to see what’s on your list today.
          </Text>

          {/* Email */}
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

          {/* Password */}
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

          {/* Login button */}
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: theme.accent }]}
            onPress={loginUser}
          >
            <Text style={styles.primaryButtonText}>Log in</Text>
          </TouchableOpacity>

          {/* Link to register */}
          <TouchableOpacity
            onPress={() => router.push("/auth/register")}
            style={styles.linkWrapper}
          >
            <Text style={[styles.linkText, { color: theme.subtle }]}>
              Don’t have an account?{" "}
              <Text style={{ color: theme.accent }}>Sign up</Text>
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
    backgroundColor: "rgba(34,197,94,0.12)",
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
/// Maryan ///
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
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

export default function Login() {
  const { theme } = useContext(ThemeContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateLogin = () => {
    if (!email.trim()) {
      Alert.alert("Validation Error", "Please enter your email address");
      return false;
    }

    if (!email.includes("@")) {
      Alert.alert("Validation Error", "Please enter a valid email address");
      return false;
    }

    if (!password) {
      Alert.alert("Validation Error", "Please enter your password");
      return false;
    }

    if (password.length < 6) {
      Alert.alert("Validation Error", "Password must be at least 6 characters long");
      return false;
    }

    return true;
  };

  const loginUser = async () => {
    if (!validateLogin()) {
      return;
    }

    setLoading(true);

    try {
      setError("");
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace("/(tabs)");
    } catch (e: any) {
      Alert.alert(
        "Login Failed",
        "Invalid email or password. Please check your credentials and try again."
      );
      setError("Check your email and password and try again.");
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
            <MaterialIcons name="task-alt" size={26} color={theme.accent} />
          </View>

          <Text style={[styles.title, { color: theme.text }]}>
            Welcome back
          </Text>
          <Text style={[styles.subtitle, { color: theme.subtle }]}>
            Log in to see what's on your list today.
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
            placeholder="Password"
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

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={theme.accent} />
              <Text style={[styles.loadingText, { color: theme.subtle }]}>
                Logging in...
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.primaryButton,
              { backgroundColor: theme.accent },
              loading && styles.disabledButton,
            ]}
            onPress={loginUser}
            disabled={loading}
          >
            <Text style={styles.primaryButtonText}>Log in</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/auth/register")}
            style={styles.linkWrapper}
            disabled={loading}
          >
            <Text style={[styles.linkText, { color: theme.subtle }]}>
              Don't have an account?{" "}
              <Text style={{ color: theme.accent }}>Sign up</Text>
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
    backgroundColor: "rgba(34,197,94,0.12)",
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
