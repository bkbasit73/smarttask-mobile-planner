import { NavigationContainer } from "@react-navigation/native";
import { useState } from "react";
import { Button, View } from "react-native";
import { TasksProvider } from "./src/context/TasksContext"; // ✅ add this
import AppNavigator from "./src/navigation/AppNavigator";
import AuthNavigator from "./src/navigation/AuthNavigator";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <TasksProvider>   {/* ✅ wrap app here */}
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
    </TasksProvider>
  );
}
