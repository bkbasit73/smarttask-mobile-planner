import { collection, getDocs } from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { db } from "../../firebaseConfig";
import { ThemeContext } from "../_layout";

type Task = {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
};

export default function DashboardScreen() {
  const { theme } = useContext(ThemeContext);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = async () => {
    try {
      const snap = await getDocs(collection(db, "tasks"));
      const list: Task[] = snap.docs.map((doc) => {
        const data = doc.data() as Task;
        return {
          id: doc.id,
          title: data.title,
          completed: data.completed,
          dueDate: data.dueDate,
        };
      });
      setTasks(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
    const interval = setInterval(loadTasks, 2000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Loading...</Text>
      </View>
    );
  }

  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Dashboard</Text>

      <View
        style={[
          styles.statsBox,
          { backgroundColor: theme.card, borderColor: theme.accent },
        ]}
      >
        <Text style={[styles.statText, { color: theme.text }]}>
          Total Tasks: {total}
        </Text>
        <Text style={[styles.statText, { color: theme.text }]}>
          Completed: {completed}
        </Text>
        <Text style={[styles.statText, { color: theme.text }]}>
          Pending: {pending}
        </Text>
      </View>

      <Text style={[styles.message, { color: theme.text }]}>
        {pending > 0
          ? `You still have ${pending} task(s) pending`
          : "🎉 All tasks completed!"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20 },
  statsBox: {
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    width: "90%",
    borderWidth: 1,
    marginBottom: 20,
  },
  statText: { fontSize: 18, marginVertical: 5 },
  message: { fontSize: 18, marginTop: 10, textAlign: "center" },
});
