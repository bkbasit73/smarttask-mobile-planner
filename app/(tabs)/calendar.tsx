import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { Calendar } from "react-native-calendars";

type Task = {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string; // optional for now
};

const STORAGE_KEY = "@smarttask_tasks";

export default function CalendarScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

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
    }
  };

  // mark days that have tasks
  const markedDates = tasks.reduce((acc: any, task) => {
    if (task.dueDate) {
      acc[task.dueDate] = {
        marked: true,
        dotColor: task.completed ? "green" : "red",
      };
    }
    return acc;
  }, {});

  // filter tasks by selected date
  const tasksForDay = tasks.filter((t) => t.dueDate === selectedDate);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Calendar</Text>

      <Calendar
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={{
          ...markedDates,
          [selectedDate]: {
            ...(markedDates[selectedDate] || {}),
            selected: true,
            selectedColor: "#4CAF50",
          },
        }}
      />

      <View style={styles.taskSection}>
        <Text style={styles.dateText}>
          Tasks on {selectedDate} ({tasksForDay.length})
        </Text>

        {tasksForDay.length === 0 ? (
          <Text style={{ color: "gray", marginTop: 10 }}>
            No tasks scheduled for this day.
          </Text>
        ) : (
          <FlatList
            data={tasksForDay}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.taskItem}>
                <Text
                  style={[
                    styles.taskText,
                    item.completed && styles.completedText,
                  ]}
                >
                  {item.title}
                </Text>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 10 },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 10,
  },
  taskSection: {
    flex: 1,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  dateText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  taskItem: {
    backgroundColor: "#f2f2f2",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  taskText: {
    fontSize: 16,
  },
  completedText: {
    textDecorationLine: "line-through",
    color: "gray",
  },
});
