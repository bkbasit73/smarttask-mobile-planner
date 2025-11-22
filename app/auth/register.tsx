import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from "firebase/auth";
import React, { useContext, useState, useRef, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { auth } from "../../firebaseConfig";
import { ThemeContext } from "../_layout";

const PASSWORD_VISIBLE_TIMEOUT = 5000;

export default function Register() {
  const { theme } = useContext(ThemeContext);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState({ level: 0, text: "", color: "" });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const passwordVisibilityTimer = useRef(null);
  const confirmPasswordVisibilityTimer = useRef(null);

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
  }, []);

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

  useEffect(() => {
    if (showConfirmPassword) {
      if (confirmPasswordVisibilityTimer.current) {
        clearTimeout(confirmPasswordVisibilityTimer.current);
      }
      
      confirmPasswordVisibilityTimer.current = setTimeout(() => {
        setShowConfirmPassword(false);
      }, PASSWORD_VISIBLE_TIMEOUT);
    }

    return () => {
      if (confirmPasswordVisibilityTimer.current) {
        clearTimeout(confirmPasswordVisibilityTimer.current);
      }
    };
  }, [showConfirmPassword]);

  const sanitizeInput = (input) => {
    return input.replace(/[<>\"'`]/g, '').trim();
  };

  const calculatePasswordStrength = (password) => {
    if (!password) {
      return { level: 0, text: "", color: "" };
    }

    let strength = 0;
    
    if (password.length >= 6) strength += 1;
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/\d/.test(password)) strength += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;
    
    const weakPasswords = ['123456', 'password', '12345678', 'qwerty', 'abc123', '111111', 'letmein', '123123', 'welcome', 'monkey'];
    if (weakPasswords.includes(password.toLowerCase())) {
      return { level: 1, text: "Very Weak", color: "#ef4444" };
    }
    
    if (/(.)\1{2,}/.test(password)) strength -= 1;
    if (/012|123|234|345|456|567|678|789|890|abc|bcd|cde|def/i.test(password)) strength -= 1;
    
    if (strength <= 2) {
      return { level: 1, text: "Weak", color: "#ef4444" };
    } else if (strength <= 4) {
      return { level: 2, text: "Fair", color: "#f59e0b" };
    } else if (strength <= 5) {
      return { level: 3, text: "Good", color: "#3b82f6" };
    } else if (strength <= 6) {
      return { level: 4, text: "Strong", color: "#22c55e" };
    } else {
      return { level: 5, text: "Very Strong", color: "#16a34a" };
    }
  };

  const validateName = (name) => {
    const sanitized = sanitizeInput(name);
    
    if (!sanitized) {
      setNameError("Full name is required");
      return false;
    }

    if (sanitized.length < 2) {
      setNameError("Name must be at least 2 characters");
      return false;
    }

    if (sanitized.length > 50) {
      setNameError("Name must be less than 50 characters");
      return false;
    }

    const nameRegex = /^[a-zA-Z\s'-]+$/;
    if (!nameRegex.test(sanitized)) {
      setNameError("Name can only contain letters, spaces, hyphens, and apostrophes");
      return false;
    }

    setNameError("");
    return true;
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

    if (sanitized.length > 254) {
      setEmailError("Email is too long");
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

    if (password.length > 128) {
      setPasswordError("Password is too long (max 128 characters)");
      return false;
    }

    const weakPasswords = ['123456', 'password', '12345678', 'qwerty', 'abc123', '111111', 'letmein', '123123', 'welcome', 'monkey'];
    if (weakPasswords.includes(password.toLowerCase())) {
      setPasswordError("This password is too common and easily guessed");
      return false;
    }

    if (/012|123|234|345|456|567|678|789|890|abc|bcd|cde|def/i.test(password)) {
      setPasswordError("Avoid using sequential characters");
      return false;
    }

    if (/(.)\1{2,}/.test(password)) {
      setPasswordError("Avoid repeating the same character multiple times");
      return false;
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const strengthCount = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;
    
    if (strengthCount < 2 && password.length < 8) {
      setPasswordError("Use a mix of uppercase, lowercase, numbers, or special characters");
      return false;
    }

    setPasswordError("");
    return true;
  };

  const validateConfirmPassword = (confirmPass) => {
    if (!confirmPass) {
      setConfirmPasswordError("Please confirm your password");
      return false;
    }

    if (confirmPass !== password) {
      setConfirmPasswordError("Passwords do not match");
      return false;
    }

    setConfirmPasswordError("");
    return true;
  };

  const handleRegister = async () => {
    Keyboard.dismiss();

    const nameValid = validateName(fullName);
    const emailValid = validateEmail(email);
    const passwordValid = validatePassword(password);
    const confirmPasswordValid = validateConfirmPassword(confirmPassword);

    if (!nameValid || !emailValid || !passwordValid || !confirmPasswordValid) {
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        sanitizeInput(email),
        password
      );

      await updateProfile(userCredential.user, {
        displayName: sanitizeInput(fullName),
      });

      // Send email verification
      await sendEmailVerification(userCredential.user);

      Alert.alert(
        "✓ Account Created Successfully",
        `Welcome to SmartTask, ${sanitizeInput(fullName)}!\n\nA verification email has been sent to:\n${sanitizeInput(email)}\n\nPlease verify your email before logging in. Check your spam folder if you don't see it.`,
        [
          {
            text: "Go to Login",
            onPress: () => {
              setFullName("");
              setEmail("");
              setPassword("");
              setConfirmPassword("");
              router.push("/auth/login");
            },
          },
        ]
      );
    } catch (error) {
      setLoading(false);
      console.error("Registration error:", error);

      let title = "Registration Failed";
      let message = "Unable to create account. Please try again.";

      if (error.code === "auth/email-already-in-use") {
        title = "Account Already Exists";
        message = "An account with this email already exists. Please login instead or use a different email address.";
        
        Alert.alert(title, message, [
          {
            text: "Go to Login",
            onPress: () => router.push("/auth/login"),
          },
          {
            text: "Try Different Email",
            style: "cancel",
          },
        ]);
        return;
      } else if (error.code === "auth/invalid-email") {
        message = "Invalid email address format.";
      } else if (error.code === "auth/operation-not-allowed") {
        message = "Email/password accounts are not enabled. Please contact support.";
      } else if (error.code === "auth/weak-password") {
        message = "Password is too weak. Please use a stronger password.";
      } else if (error.code === "auth/network-request-failed") {
        title = "Network Error";
        message = "Please check your internet connection and try again.";
      } else if (error.code === "auth/too-many-requests") {
        title = "Too Many Requests";
        message = "Too many registration attempts. Please try again later.";
      }

      Alert.alert(title, message, [{ text: "OK" }]);
      return;
    }

    setLoading(false);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.centerWrapper}>
            <Animated.View
              style={[
                styles.card,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.accent,
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.iconCircle}>
                <MaterialIcons name="person-add" size={26} color={theme.accent} />
              </View>

              <Text style={[styles.title, { color: theme.text }]}>Create Account</Text>
              <Text style={[styles.subtitle, { color: theme.subtle }]}>
                Join SmartTask with secure authentication
              </Text>

              <View style={styles.inputWrapper}>
                <View style={styles.inputIconContainer}>
                  <MaterialIcons name="person" size={20} color={theme.subtle} />
                </View>
                <TextInput
                  placeholder="Full Name"
                  placeholderTextColor={theme.subtle}
                  autoCapitalize="words"
                  autoComplete="name"
                  textContentType="name"
                  value={fullName}
                  onChangeText={(text) => {
                    setFullName(text);
                    if (nameError) validateName(text);
                  }}
                  onBlur={() => validateName(fullName)}
                  editable={!loading}
                  style={[
                    styles.input,
                    {
                      color: theme.text,
                      borderColor: nameError ? "#ef4444" : theme.subtle,
                    },
                  ]}
                />
                {nameError ? (
                  <Text style={styles.errorText}>{nameError}</Text>
                ) : null}
              </View>

              <View style={styles.inputWrapper}>
                <View style={styles.inputIconContainer}>
                  <MaterialIcons name="email" size={20} color={theme.subtle} />
                </View>
                <TextInput
                  placeholder="Email address"
                  placeholderTextColor={theme.subtle}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  textContentType="emailAddress"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (emailError) validateEmail(text);
                  }}
                  onBlur={() => validateEmail(email)}
                  editable={!loading}
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
                  placeholder="Password (min 6 characters)"
                  placeholderTextColor={theme.subtle}
                  secureTextEntry={!showPassword}
                  autoComplete="password-new"
                  textContentType="newPassword"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    const strength = calculatePasswordStrength(text);
                    setPasswordStrength(strength);
                    if (passwordError) validatePassword(text);
                    if (confirmPassword && confirmPasswordError) {
                      validateConfirmPassword(confirmPassword);
                    }
                  }}
                  onBlur={() => validatePassword(password)}
                  editable={!loading}
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
                
                {password && !passwordError && passwordStrength.text ? (
                  <View style={styles.strengthIndicator}>
                    <View style={styles.strengthBars}>
                      {[1, 2, 3, 4, 5].map((bar) => (
                        <View
                          key={bar}
                          style={[
                            styles.strengthBar,
                            {
                              backgroundColor:
                                bar <= passwordStrength.level
                                  ? passwordStrength.color
                                  : "#e5e7eb",
                            },
                          ]}
                        />
                      ))}
                    </View>
                    <Text style={[styles.strengthText, { color: passwordStrength.color }]}>
                      Password Strength: {passwordStrength.text}
                    </Text>
                  </View>
                ) : null}
                
                {passwordError ? (
                  <Text style={styles.errorText}>{passwordError}</Text>
                ) : null}
              </View>

              <View style={styles.inputWrapper}>
                <View style={styles.inputIconContainer}>
                  <MaterialIcons name="lock-outline" size={20} color={theme.subtle} />
                </View>
                <TextInput
                  placeholder="Confirm Password"
                  placeholderTextColor={theme.subtle}
                  secureTextEntry={!showConfirmPassword}
                  autoComplete="password-new"
                  textContentType="newPassword"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (confirmPasswordError) validateConfirmPassword(text);
                  }}
                  onBlur={() => validateConfirmPassword(confirmPassword)}
                  onSubmitEditing={handleRegister}
                  editable={!loading}
                  style={[
                    styles.input,
                    {
                      color: theme.text,
                      borderColor: confirmPasswordError ? "#ef4444" : theme.subtle,
                      paddingRight: 50,
                    },
                  ]}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                  disabled={!confirmPassword}
                >
                  <MaterialIcons
                    name={showConfirmPassword ? "visibility-off" : "visibility"}
                    size={20}
                    color={confirmPassword ? theme.subtle : "#e5e7eb"}
                  />
                </TouchableOpacity>
                {confirmPasswordError ? (
                  <Text style={styles.errorText}>{confirmPasswordError}</Text>
                ) : null}
              </View>

              <View style={styles.securityNotice}>
                <MaterialIcons name="mark-email-unread" size={16} color={theme.subtle} />
                <Text style={[styles.securityNoticeText, { color: theme.subtle }]}>
                  You'll receive a verification email after registration
                </Text>
              </View>

              {loading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={theme.accent} />
                  <Text style={[styles.loadingText, { color: theme.subtle }]}>
                    Creating your secure account...
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  { backgroundColor: theme.accent },
                  loading && styles.disabledButton,
                ]}
                onPress={handleRegister}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <MaterialIcons name="how-to-reg" size={20} color="#ffffff" style={{ marginRight: 8 }} />
                    <Text style={styles.primaryButtonText}>Create Secure Account</Text>
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.securityBadge}>
                <MaterialIcons name="verified-user" size={14} color="#22c55e" />
                <Text style={[styles.securityText, { color: theme.subtle }]}>
                  256-bit encryption • Email verification
                </Text>
              </View>

              <View style={styles.divider}>
                <View style={[styles.dividerLine, { backgroundColor: theme.subtle }]} />
                <Text style={[styles.dividerText, { color: theme.subtle }]}>or</Text>
                <View style={[styles.dividerLine, { backgroundColor: theme.subtle }]} />
              </View>

              <TouchableOpacity
                onPress={() => router.push("/auth/login")}
                style={styles.linkWrapper}
                disabled={loading}
                activeOpacity={0.7}
              >
                <Text style={[styles.linkText, { color: theme.subtle }]}>
                  Already have an account?{" "}
                  <Text style={{ color: theme.accent, fontWeight: "700" }}>Login here</Text>
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 20,
  },
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
  strengthIndicator: {
    marginTop: 8,
    marginLeft: 16,
  },
  strengthBars: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 4,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: "600",
  },
  securityNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  securityNoticeText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
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
