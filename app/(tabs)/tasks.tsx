import React, { useState } from "react";
import {
    Button,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type Task = {
  id: string;
  title: string;
};

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskTitle, setTaskTitle] = useState("");

  const addTask = () => {
    if (!taskTitle.trim()) return; // ignore empty input
    const newTask: Task = {
      id: Date.now().toString(),
      title: taskTitle.trim(),
    };
    setTasks((prev) => [...prev, newTask]);
    setTaskTitle("");
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Tasks</Text>

      <View style={styles.inputRow}>
        <TextInput
          placeholder="Enter new task..."
          value={taskTitle}
          onChangeText={setTaskTitle}
          style={styles.input}
        />
        <Button title="Add" onPress={addTask} />
      </View>

      {tasks.length === 0 ? (
        <Text style={{ marginTop: 40, color: "gray" }}>
          No tasks yet — add one!
        </Text>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.taskRow}>
              <Text style={styles.taskText}>{item.title}</Text>
              <TouchableOpacity
                onPress={() => deleteTask(item.id)}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
  },
  taskRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#f4f4f4",
    marginBottom: 8,
    borderRadius: 8,
  },
  taskText: {
    fontSize: 18,
  },
  deleteButton: {
    backgroundColor: "#ff6b6b",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  deleteText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
