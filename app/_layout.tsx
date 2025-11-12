import { ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { darkTheme, lightTheme } from "../constants/theme";

export default function RootLayout() {
  const [dark, setDark] = useState(false);
  const theme = dark ? darkTheme : lightTheme;

  return (
    <ThemeProvider value={theme}>
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.background },
          }}
        />
        <View style={{ position: "absolute", top: 40, right: 20 }}>
          <Pressable
            onPress={() => setDark(!dark)}
            style={({ pressed }) => ({
              backgroundColor: theme.accent,
              padding: 10,
              borderRadius: 8,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Text style={{ color: theme.text, fontSize: 16 }}>
              {dark ? "☀️ Light" : "🌙 Dark"}
            </Text>
          </Pressable>
        </View>
      </View>
    </ThemeProvider>
  );
}
