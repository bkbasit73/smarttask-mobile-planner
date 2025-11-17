import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { collection, getDocs } from "firebase/firestore";
import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
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

  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;

  const recent = useMemo(() => tasks.slice(0, 3), [tasks]);

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: theme.background }]}
      >
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.text }]}>
            Loading your dashboard...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View>
            <Text
              style={[
                styles.appTitle,
                { color: theme.text },
              ]}
            >
              SmartTask
            </Text>
            <Text style={[styles.subtitle, { color: theme.subtle }]}>
              Welcome Back👋 Here’s your day at a glance. MAKE SURE TO COMPLETE ALL TASKS BEFORE THE DEADLINE!!
            </Text>
          </View>
          <View
            style={[
              styles.iconBadge,
              { backgroundColor: theme.card, borderColor: theme.accent },
            ]}
          >
            <MaterialIcons
              name="dashboard"
              size={22}
              color={theme.accent || "#22c55e"}
            />
          </View>
        </View>

        <View style={styles.statsRow}>
          <View
            style={[
              styles.statCard,
              {
                backgroundColor: "rgba(59,130,246,0.12)", 
                borderColor: "#3b82f6",
              },
            ]}
          >
            <View style={[styles.statIconCircle, { backgroundColor: "#3b82f6" }]}>
              <MaterialIcons name="assignment" size={22} color="#ffffff" />
            </View>
            <Text style={[styles.statLabel, { color: theme.subtle }]}>Total</Text>
            <Text style={[styles.statValue, { color: theme.text }]}>{total}</Text>
          </View>

          <View
            style={[
              styles.statCard,
              {
                backgroundColor: "rgba(34,197,94,0.12)", 
                borderColor: "#22c55e",
              },
            ]}
          >
            <View style={[styles.statIconCircle, { backgroundColor: "#22c55e" }]}>
              <MaterialIcons name="check-circle" size={22} color="#ffffff" />
            </View>
            <Text style={[styles.statLabel, { color: theme.subtle }]}>
              Completed
            </Text>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {completed}
            </Text>
          </View>

          <View
            style={[
              styles.statCard,
              {
                backgroundColor: "rgba(249,115,22,0.12)",
                borderColor: "#f97316",
              },
            ]}
          >
            <View style={[styles.statIconCircle, { backgroundColor: "#f97316" }]}>
              <MaterialIcons name="schedule" size={22} color="#ffffff" />
            </View>
            <Text style={[styles.statLabel, { color: theme.subtle }]}>
              Pending
            </Text>
            <Text style={[styles.statValue, { color: theme.text }]}>{pending}</Text>
          </View>
        </View>

        <View
          style={[
            styles.messageBox,
            {
              backgroundColor:
                pending > 0 ? "rgba(34,197,94,0.05)" : "rgba(34,197,94,0.15)",
              borderColor: pending > 0 ? "#facc15" : "#22c55e",
            },
          ]}
        >
          <Ionicons
            name={pending > 0 ? "alert-circle-outline" : "trophy"}
            size={22}
            color={pending > 0 ? "#facc15" : "#22c55e"}
            style={{ marginRight: 8 }}
          />
          <Text style={[styles.messageText, { color: theme.text }]}>
            {pending > 0
              ? `You still have ${pending} task(s) pending...you got this 💪`
              : "🎉 All tasks completed! Time for a break."}
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Recent tasks
          </Text>
          {recent.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.subtle }]}>
              No tasks yet. Add a new task from the Tasks tab.
            </Text>
          ) : (
            recent.map((task) => (
              <View
                key={task.id}
                style={[
                  styles.taskRow,
                  { backgroundColor: theme.card, borderColor: theme.card },
                ]}
              >
                <View style={styles.taskLeft}>
                  <View
                    style={[
                      styles.statusDot,
                      {
                        borderColor: theme.accent,
                        backgroundColor: task.completed
                          ? theme.accent
                          : "transparent",
                      },
                    ]}
                  >
                    {task.completed && (
                      <MaterialIcons name="check" size={14} color="#000" />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.taskTitle,
                        {
                          color: theme.text,
                          textDecorationLine: task.completed
                            ? "line-through"
                            : "none",
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {task.title}
                    </Text>
                    <Text style={[styles.taskMeta, { color: theme.subtle }]}>
                      {task.dueDate ? `Due: ${task.dueDate}` : "No due date"}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: "800",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
  },
  iconBadge: {
    padding: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 18,
    borderWidth: 1,
    marginHorizontal: 4,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  statIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  messageBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  messageText: {
    fontSize: 14,
    flex: 1,
    flexWrap: "wrap",
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  taskLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  statusDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: "500",
  },
  taskMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
  },
});
