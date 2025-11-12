import { NavigationContainer } from "@react-navigation/native";
import { useState } from "react";
import { Button, View } from "react-native";
import AppNavigator from "./src/navigation/AppNavigator";
import AuthNavigator from "./src/navigation/AuthNavigator";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <NavigationContainer>
      {isLoggedIn ? (
        <AppNavigator />
      ) : (
        <View style={{ flex: 1 }}>
          <AuthNavigator />
          <Button title="Simulate Login" onPress={() => setIsLoggedIn(true)} />
        </View>
      )}
    </NavigationContainer>
  );
}
