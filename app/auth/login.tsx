import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from "expo-router";
import { signInWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification } from "firebase/auth";
import React, { useContext, useState, useRef, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  AppState,
} from "react-native";
import { auth } from "../../firebaseConfig";
import { ThemeContext } from "../_layout";

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000;
const INACTIVITY_TIMEOUT = 15 * 60 * 1000;
const PASSWORD_VISIBLE_TIMEOUT = 5000;

export default function Login() {
  const { theme } = useContext(ThemeContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [timeoutCountdown, setTimeoutCountdown] = useState(60);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const passwordVisibilityTimer = useRef(null);
  const inactivityTimer = useRef(null);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    loadLockoutData();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        resetInactivityTimer();
      }
      appState.current = nextAppState;
    });

    resetInactivityTimer();

    return () => {
      subscription.remove();
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, []);

  useEffect(() => {
    if (lockoutTime) {
      const interval = setInterval(async () => {
        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((lockoutTime - now) / 1000));
        setRemainingTime(remaining);

        if (remaining === 0) {
          setLockoutTime(null);
          setLoginAttempts(0);
          try {
            await AsyncStorage.removeItem('loginLockoutTime');
            await AsyncStorage.removeItem('loginAttempts');
          } catch (error) {
            console.error("Error clearing lockout:", error);
          }
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [lockoutTime]);

  useEffect(() => {
    if (showPassword) {
      if (passwordVisibilityTimer.current) {
        clearTimeout(passwordVisibilityTimer.current);
      }
      
      passwordVisibilityTimer.current = setTimeout(() => {
        setShowPassword(false);
      }, PASSWORD_VISIBLE_TIMEOUT);
    }

    return () => {
      if (passwordVisibilityTimer.current) {
        clearTimeout(passwordVisibilityTimer.current);
      }
    };
  }, [showPassword]);

  const loadLockoutData = async () => {
    try {
      const savedLockoutTime = await AsyncStorage.getItem('loginLockoutTime');
      if (savedLockoutTime) {
        const lockTime = parseInt(savedLockoutTime);
        const now = Date.now();
        if (now < lockTime) {
          setLockoutTime(lockTime);
        } else {
          await AsyncStorage.removeItem('loginLockoutTime');
          await AsyncStorage.removeItem('loginAttempts');
        }
      }

      const savedAttempts = await AsyncStorage.getItem('loginAttempts');
      if (savedAttempts) {
        setLoginAttempts(parseInt(savedAttempts));
      }
    } catch (error) {
      console.error("Error loading lockout data:", error);
    }
  };

  const resetInactivityTimer = () => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    setShowTimeoutWarning(false);
    
    inactivityTimer.current = setTimeout(() => {
      setShowTimeoutWarning(true);
      let countdown = 60;
      setTimeoutCountdown(countdown);
      
      const countdownInterval = setInterval(() => {
        countdown -= 1;
        setTimeoutCountdown(countdown);
        
        if (countdown <= 0) {
          clearInterval(countdownInterval);
          Alert.alert(
            "Session Expired",
            "You've been logged out due to inactivity for security purposes.",
            [{ 
              text: "OK", 
              onPress: () => {
                setEmail("");
                setPassword("");
                setShowTimeoutWarning(false);
                resetInactivityTimer();
              }
            }]
          );
        }
      }, 1000);
    }, INACTIVITY_TIMEOUT);
  };

  const sanitizeInput = (input) => {
    return input.replace(/[<>"'`]/g, '').trim();
  };

  const validateEmail = (email) => {
    const sanitized = sanitizeInput(email);
    
    if (!sanitized) {
      setEmailError("Email is required");
      return false;
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(sanitized)) {
      setEmailError("Invalid email format");
      return false;
    }

    if (sanitized.includes('..') || sanitized.startsWith('.') || sanitized.endsWith('.')) {
      setEmailError("Invalid email format");
      return false;
    }

    const domain = sanitized.split('@')[1];
    if (domain && domain.split('.').some(part => part.length === 0)) {
      setEmailError("Invalid email domain");
      return false;
    }

    setEmailError("");
    return true;
  };

  const validatePassword = (password) => {
    if (!password) {
      setPasswordError("Password is required");
      return false;
    }

    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return false;
    }

    setPasswordError("");
    return true;
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert("Email Required", "Please enter your email address first");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address");
      return;
    }

    Alert.alert(
      "Reset Password",
      `Send password reset email to:\n${email}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send Email",
          onPress: async () => {
            try {
              setLoading(true);
              await sendPasswordResetEmail(auth, sanitizeInput(email));
              setLoading(false);
              Alert.alert(
                "✓ Email Sent Successfully",
                "Check your inbox for password reset instructions. The link expires in 1 hour.\n\nDon't forget to check your spam folder!",
                [{ text: "OK" }]
              );
            } catch (error) {
              setLoading(false);
              console.error("Password reset error:", error);
              
              let errorMessage = "Unable to send password reset email. Please try again.";
              
              if (error.code === "auth/user-not-found") {
                errorMessage = "No account found with this email address.";
              } else if (error.code === "auth/invalid-email") {
                errorMessage = "Invalid email address format.";
              } else if (error.code === "auth/too-many-requests") {
                errorMessage = "Too many password reset requests. Please wait 5 minutes before trying again.";
              }
              
              Alert.alert("Reset Failed", errorMessage);
            }
          }
        }
      ]
    );
  };

  const handleLogin = async () => {
    resetInactivityTimer();

    if (lockoutTime && Date.now() < lockoutTime) {
      const minutes = Math.ceil(remainingTime / 60);
      Alert.alert(
        "Account Locked",
        `Too many failed login attempts. Please try again in ${minutes} minute${minutes !== 1 ? 's' : ''}.\n\nOr use "Forgot Password?" to reset your password.`,
        [{ text: "OK" }]
      );
      return;
    }

    Keyboard.dismiss();

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setLoading(true);
    setEmailError("");
    setPasswordError("");

    try {
      const sanitizedEmail = sanitizeInput(email);
      const userCredential = await signInWithEmailAndPassword(auth, sanitizedEmail, password);

      if (!userCredential.user.emailVerified) {
        setLoading(false);
        Alert.alert(
          "Email Not Verified",
          "Please verify your email before logging in. Check your inbox for the verification email.",
          [
            {
              text: "Resend Email",
              onPress: async () => {
                try {
                  await sendEmailVerification(userCredential.user);
                  Alert.alert("✓ Verification Email Sent", "Check your inbox and spam folder.");
                } catch (error) {
                  Alert.alert("Error", "Unable to send verification email. Please try again later.");
                }
              }
            },
            { text: "OK" }
          ]
        );
        await auth.signOut();
        return;
      }

      await AsyncStorage.removeItem('loginAttempts');
      await AsyncStorage.removeItem('loginLockoutTime');
      setLoginAttempts(0);
      setLockoutTime(null);

      setLoading(false);
      router.replace("/(tabs)");
    } catch (error) {
      setLoading(false);
      console.error("Login error:", error);

      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);

      try {
        await AsyncStorage.setItem('loginAttempts', newAttempts.toString());
      } catch (storageError) {
        console.error("Error saving attempts:", storageError);
      }

      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        const lockTime = Date.now() + LOCKOUT_DURATION;
        setLockoutTime(lockTime);
        try {
          await AsyncStorage.setItem('loginLockoutTime', lockTime.toString());
        } catch (storageError) {
          console.error("Error saving lockout time:", storageError);
        }
        
        Alert.alert(
          "Account Locked",
          `Too many failed login attempts. Your account has been locked for 15 minutes.\n\nYou can use "Forgot Password?" to reset your password immediately.`,
          [{ text: "OK" }]
        );
        return;
      }

      const remainingAttempts = MAX_LOGIN_ATTEMPTS - newAttempts;

      let errorMessage = `Invalid email or password.\n\n${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining before account lockout.`;

      if (error.code === "auth/user-not-found") {
        errorMessage = `No account found with this email.\n\n${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.`;
      } else if (error.code === "auth/wrong-password") {
        errorMessage = `Incorrect password.\n\n${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining before account lockout.`;
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email format.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many failed attempts. Please try again later or reset your password.";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your internet connection.";
      }

      Alert.alert(
        "Login Failed",
        errorMessage,
        [{ text: "OK" }]
      );
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.centerWrapper}>
          <Animated.View
            style={[
              styles.card,
              {
                backgroundColor: theme.card,
                borderColor: theme.accent + "30",
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.iconCircle}>
              <MaterialIcons name="shield" size={28} color="#22c55e" />
            </View>

            <Text style={[styles.title, { color: theme.text }]}>Secure Login</Text>
            <Text style={[styles.subtitle, { color: theme.subtle }]}>
              Protected access to your SmartTask account
            </Text>

            {showTimeoutWarning && (
              <View style={[styles.timeoutBanner, { backgroundColor: "rgba(239, 68, 68, 0.1)", borderColor: "#ef4444" }]}>
                <MaterialIcons name="timer" size={20} color="#ef4444" />
                <Text style={[styles.timeoutText, { color: "#ef4444" }]}>
                  Auto-logout in {timeoutCountdown}s due to inactivity
                </Text>
                <TouchableOpacity
                  onPress={resetInactivityTimer}
                  style={styles.stayLoggedButton}
                >
                  <Text style={{ color: "#ef4444", fontWeight: "600", fontSize: 12 }}>Stay</Text>
                </TouchableOpacity>
              </View>
            )}

            {lockoutTime && (
              <View style={[styles.lockoutBanner, { backgroundColor: "rgba(239, 68, 68, 0.1)", borderColor: "#ef4444" }]}>
                <MaterialIcons name="lock" size={20} color="#ef4444" />
                <Text style={[styles.lockoutText, { color: "#ef4444" }]}>
                  Account locked. Unlocking in {formatTime(remainingTime)}
                </Text>
              </View>
            )}

            {!lockoutTime && loginAttempts > 0 && (
              <View style={[styles.warningBanner, { backgroundColor: "rgba(234, 179, 8, 0.1)", borderColor: "#facc15" }]}>
                <MaterialIcons name="warning" size={18} color="#facc15" />
                <Text style={[styles.warningText, { color: "#facc15" }]}>
                  {MAX_LOGIN_ATTEMPTS - loginAttempts} login attempt{MAX_LOGIN_ATTEMPTS - loginAttempts !== 1 ? 's' : ''} remaining
                </Text>
              </View>
            )}

            <View style={styles.inputWrapper}>
              <View style={styles.inputIconContainer}>
                <MaterialIcons name="email" size={20} color={theme.subtle} />
              </View>
              <TextInput
                placeholder="Email address"
                placeholderTextColor={theme.subtle}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (emailError) setEmailError("");
                  resetInactivityTimer();
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                style={[
                  styles.input,
                  {
                    color: theme.text,
                    borderColor: emailError ? "#ef4444" : theme.subtle,
                  },
                ]}
              />
              {emailError ? (
                <Text style={styles.errorText}>{emailError}</Text>
              ) : null}
            </View>

            <View style={styles.inputWrapper}>
              <View style={styles.inputIconContainer}>
                <MaterialIcons name="lock" size={20} color={theme.subtle} />
              </View>
              <TextInput
                placeholder="Password"
                placeholderTextColor={theme.subtle}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (passwordError) setPasswordError("");
                  resetInactivityTimer();
                }}
                secureTextEntry={!showPassword}
                style={[
                  styles.input,
                  {
                    color: theme.text,
                    borderColor: passwordError ? "#ef4444" : theme.subtle,
                    paddingRight: 50,
                  },
                ]}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
                disabled={!password}
              >
                <MaterialIcons
                  name={showPassword ? "visibility-off" : "visibility"}
                  size={20}
                  color={password ? theme.subtle : "#e5e7eb"}
                />
              </TouchableOpacity>
              {passwordError ? (
                <Text style={styles.errorText}>{passwordError}</Text>
              ) : null}
            </View>

            <TouchableOpacity
              onPress={handleForgotPassword}
              style={styles.forgotPasswordLink}
              disabled={loading}
            >
              <Text style={[styles.forgotPasswordText, { color: theme.accent }]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={theme.accent} />
                <Text style={[styles.loadingText, { color: theme.subtle }]}>
                  Authenticating securely...
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.primaryButton,
                { backgroundColor: theme.accent },
                (loading || lockoutTime) && styles.disabledButton,
              ]}
              onPress={handleLogin}
              disabled={loading || lockoutTime}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <MaterialIcons name="login" size={20} color="#ffffff" style={{ marginRight: 8 }} />
                  <Text style={styles.primaryButtonText}>
                    {lockoutTime ? "Account Locked" : "Secure Login"}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.securityBadge}>
              <MaterialIcons name="verified-user" size={14} color="#22c55e" />
              <Text style={[styles.securityText, { color: theme.subtle }]}>
                End-to-end encrypted connection
              </Text>
            </View>

            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: theme.subtle }]} />
              <Text style={[styles.dividerText, { color: theme.subtle }]}>or</Text>
              <View style={[styles.dividerLine, { backgroundColor: theme.subtle }]} />
            </View>

            <TouchableOpacity
              onPress={() => router.push("/auth/register")}
              style={styles.linkWrapper}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={[styles.linkText, { color: theme.subtle }]}>
                Don't have an account?{" "}
                <Text style={{ color: theme.accent, fontWeight: "700" }}>Sign up securely</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 24,
    paddingVertical: 32,
    borderRadius: 24,
    borderWidth: 1.5,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    marginBottom: 16,
    backgroundColor: "rgba(34,197,94,0.15)",
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 24,
    lineHeight: 22,
  },
  timeoutBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    gap: 8,
  },
  timeoutText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
  },
  stayLoggedButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    borderRadius: 8,
  },
  lockoutBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    gap: 8,
  },
  lockoutText: {
    fontSize: 14,
    fontWeight: "600",
  },
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    gap: 6,
  },
  warningText: {
    fontSize: 13,
    fontWeight: "600",
  },
  inputWrapper: {
    marginBottom: 20,
    position: "relative",
  },
  inputIconContainer: {
    position: "absolute",
    left: 16,
    top: 14,
    zIndex: 1,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 48,
    paddingVertical: 14,
    fontSize: 15,
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
    top: 14,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 6,
    marginLeft: 16,
    fontWeight: "500",
  },
  forgotPasswordLink: {
    alignSelf: "flex-end",
    marginBottom: 16,
    marginTop: 10,
  },
  forgotPasswordText: {
    fontSize: 13,
    fontWeight: "600",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "500",
  },
  primaryButton: {
    marginTop: 8,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    shadowColor: "#22c55e",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  securityBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    gap: 6,
  },
  securityText: {
    fontSize: 12,
    fontWeight: "500",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    opacity: 0.2,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 13,
    fontWeight: "600",
  },
  linkWrapper: {
    alignItems: "center",
  },
  linkText: {
    fontSize: 15,
  },
});
