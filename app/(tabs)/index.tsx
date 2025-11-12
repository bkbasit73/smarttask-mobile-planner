import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

type Task = {
  id: string;
  title: string;
  completed: boolean;
};

const STORAGE_KEY = "@smarttask_tasks";

export default function DashboardScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setTasks(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Error loading tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;

  const message =
    completed === total && total > 0
      ? "🎉 Great job! All tasks completed."
      : pending > 0
      ? `You still have ${pending} pending task${pending > 1 ? "s" : ""}.`
      : "No tasks yet — start adding some!";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>

      <View style={styles.statsBox}>
        <Text style={styles.statText}>Total Tasks: {total}</Text>
        <Text style={styles.statText}>Completed: {completed}</Text>
        <Text style={styles.statText}>Pending: {pending}</Text>
      </View>

      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  statsBox: {
    backgroundColor: "#f0f0f0",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    width: "90%",
  },
  statText: {
    fontSize: 18,
    marginVertical: 5,
  },
  message: {
    fontSize: 18,
    marginTop: 25,
    textAlign: "center",
    color: "#444",
  },
});
