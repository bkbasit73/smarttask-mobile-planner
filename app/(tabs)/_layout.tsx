import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React, { createContext, useState } from "react";

type ThemeType = {
  background: string;
  text: string;
  card: string;
  accent: string;
};

type ThemeContextType = {
  theme: ThemeType;
  dark: boolean;
  setDark: React.Dispatch<React.SetStateAction<boolean>>;
};

// ⭐ FIXED DEFAULT CONTEXT
export const ThemeContext = createContext<ThemeContextType>({
  theme: {
    background: "#ffffff",
    text: "#000000",
    card: "#f2f2f2",
    accent: "#6200ee",
  },
  dark: false,
  setDark: () => {},
});

export default function TabsLayout() {
  const [dark, setDark] = useState(false);

  const theme: ThemeType = dark
    ? {
        background: "#181818",
        text: "#ffffff",
        card: "#242424",
        accent: "#bb86fc",
      }
    : {
        background: "#ffffff",
        text: "#000000",
        card: "#f2f2f2",
        accent: "#6200ee",
      };

  return (
    <ThemeContext.Provider value={{ theme, dark, setDark }}>
      <Tabs
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: theme.accent,
          tabBarStyle: { backgroundColor: theme.card },

          tabBarIcon: ({ color, size }) => {
            let icon = "home";
            if (route.name === "index") icon = "home";
            if (route.name === "tasks") icon = "list";
            if (route.name === "calendar") icon = "calendar";
            if (route.name === "settings") icon = "settings";
            return <Ionicons name={icon as React.ComponentProps<typeof Ionicons>['name']} size={size} color={color} />;
          },
        })}
      >
        <Tabs.Screen name="index" options={{ title: "Dashboard" }} />
        <Tabs.Screen name="tasks" options={{ title: "Tasks" }} />
        <Tabs.Screen name="calendar" options={{ title: "Calendar" }} />
        <Tabs.Screen name="settings" options={{ title: "Settings" }} />
      </Tabs>
    </ThemeContext.Provider>
  );
}
