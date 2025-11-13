import React, { useContext, useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { Calendar } from "react-native-calendars";
import { ThemeContext } from "../_layout";

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

  // Prepare marked dates for calendar
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

  const tasksForSelectedDay = tasks.filter(
    (t) => t.dueDate === selectedDate
  );

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
        }}
      />

      <Text style={[styles.header, { color: theme.text }]}>
        {selectedDate ? `Tasks for ${selectedDate}` : "Select a date"}
      </Text>

      {tasksForSelectedDay.length === 0 ? (
        <Text style={{ color: theme.text, marginTop: 10 }}>
          No tasks due on this date.
        </Text>
      ) : (
        <FlatList
          data={tasksForSelectedDay}
          keyExtractor={(t) => t.id}
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
              <Text style={{ color: theme.text }}>
                Status: {item.completed ? "✔ Done" : "⏳ Pending"}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  header: {
    fontSize: 20,
    marginTop: 15,
    marginBottom: 10,
    textAlign: "center",
    fontWeight: "bold",
  },
  taskBox: {
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
