import React, { useContext, useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { Calendar } from "react-native-calendars";
import { ThemeContext } from "../_layout";

import { MaterialIcons } from "@expo/vector-icons";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";

type Task = {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
};

export default function CalendarScreen() {
  const { theme } = useContext(ThemeContext);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");

  const loadTasks = async () => {
    const snap = await getDocs(collection(db, "tasks"));
    const list: Task[] = snap.docs.map((d) => {
      const data = d.data() as Task;
      return {
        id: d.id,
        title: data.title,
        completed: data.completed,
        dueDate: data.dueDate,
      };
    });
    setTasks(list);
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // marked dates for calendar
  const marked: any = {};
  tasks.forEach((t) => {
    if (t.dueDate) {
      marked[t.dueDate] = {
        marked: true,
        dotColor: theme.accent,
        selected: selectedDate === t.dueDate,
        selectedColor: theme.accent,
      };
    }
  });

  const tasksForSelectedDay = tasks.filter((t) => t.dueDate === selectedDate);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Calendar
        markedDates={marked}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        theme={{
          calendarBackground: theme.card,
          dayTextColor: theme.text,
          monthTextColor: theme.text,
          textMonthFontWeight: "bold",
          todayTextColor: theme.accent,
          selectedDayBackgroundColor: theme.accent,
          selectedDayTextColor: "#000000",
        }}
        style={styles.calendar}
      />

      <View
        style={[
          styles.sectionHeader,
          { borderColor: theme.accent, backgroundColor: theme.card },
        ]}
      >
        <MaterialIcons
          name="event-note"
          size={20}
          color={theme.accent || "#4CAF50"}
          style={{ marginRight: 6 }}
        />
        <Text style={[styles.sectionHeaderText, { color: theme.text }]}>
          {selectedDate ? `Tasks for ${selectedDate}` : "Select a date"}
        </Text>
      </View>

      {tasksForSelectedDay.length === 0 ? (
        <Text
          style={[
            styles.emptyText,
            { color: theme.subtle, marginTop: 10, textAlign: "center" },
          ]}
        >
          No tasks due on this date.
        </Text>
      ) : (
        <FlatList
          data={tasksForSelectedDay}
          keyExtractor={(t) => t.id}
          contentContainerStyle={{ paddingVertical: 10 }}
          renderItem={({ item }) => (
            <View
              style={[
                styles.taskBox,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.accent,
                },
              ]}
            >
              <Text style={[styles.taskTitle, { color: theme.text }]}>
                {item.title}
              </Text>
              <View style={styles.statusRow}>
                <MaterialIcons
                  name={item.completed ? "check-circle" : "hourglass-empty"}
                  size={16}
                  color={item.completed ? "#4CAF50" : theme.accent}
                  style={{ marginRight: 4 }}
                />
                <Text style={{ color: theme.text }}>
                  {item.completed ? "Done" : "Pending"}
                </Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  calendar: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 14,
  },
  taskBox: {
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
});
