import { Stack, router, useSegments } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import React, { createContext, useEffect, useState } from "react";
import { Appearance } from "react-native";
import { auth } from "../firebaseConfig";

export const ThemeContext = createContext({
  theme: { background: "", text: "", card: "", accent: "" },
  toggleTheme: () => {},
});

export default function RootLayout() {
  const segments = useSegments();
  const [isLogged, setIsLogged] = useState(false);
  const [themeMode, setThemeMode] = useState(Appearance.getColorScheme() || "light");

  const theme =
    themeMode === "light"
      ? {
          background: "#ffffff",
          text: "#000000",
          card: "#f4f4f4",
          accent: "#4CAF50",
        }
      : {
          background: "#000000",
          text: "#ffffff",
          card: "#222222",
          accent: "#90EE90",
        };

  const toggleTheme = () =>
    setThemeMode((prev) => (prev === "light" ? "dark" : "light"));

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setIsLogged(!!user);

      if (!user && segments[0] !== "auth") {
        router.replace("/auth/login");
      }
      if (user && segments[0] === "auth") {
        router.replace("/(tabs)");
      }
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeContext.Provider>
  );
}
