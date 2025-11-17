import { Stack, router, useSegments } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import React, { createContext, useEffect, useState } from "react";
import { Appearance } from "react-native";
import { auth } from "../firebaseConfig";

export const ThemeContext = createContext({
  theme: {
    background: "",
    text: "",
    card: "",
    accent: "",
    subtle: "",
  },
  toggleTheme: () => {},
});

export default function RootLayout() {
  const segments = useSegments();
  const [isLogged, setIsLogged] = useState(false);
  const [themeMode, setThemeMode] = useState(
    Appearance.getColorScheme() || "dark"
  );

  const lightText = "#0f172a";
  const darkText = "#f9fafb";

  const theme =
    themeMode === "light"
      ? {
          background: "#fdf2ff", 
          text: lightText,
          card: "#ffffff",
          accent: "#a855f7", 
          subtle: lightText + "99", 
        }
      : {
          background: "#020617", 
          text: darkText,
          card: "#111827", 
          accent: "#22c55e", 
          subtle: darkText + "80", 
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
