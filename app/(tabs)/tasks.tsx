import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Button,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type Task = {
  id: string;
  title: string;
  completed: boolean;
};

const STORAGE_KEY = "@smarttask_tasks";

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [editText, setEditText] = useState("");

  // 🧠 Load tasks on app start
  useEffect(() => {
    loadTasks();
  }, []);

  // 💾 Save tasks whenever list changes
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

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

  const saveTasks = async (data: Task[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error("Error saving tasks:", err);
    }
  };

  const addTask = () => {
    if (!taskTitle.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      title: taskTitle.trim(),
      completed: false,
    };
    setTasks((prev) => [...prev, newTask]);
    setTaskTitle("");
  };

  const deleteTask = (id: string) => {
    Alert.alert("Delete Task", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => setTasks((prev) => prev.filter((t) => t.id !== id)) },
    ]);
  };

  const toggleComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );
  };

  const openEdit = (task: Task) => {
    setEditTask(task);
    setEditText(task.title);
  };

  const saveEdit = () => {
    if (editTask && editText.trim()) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editTask.id ? { ...t, title: editText.trim() } : t
        )
      );
      setEditTask(null);
      setEditText("");
    }
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
              <TouchableOpacity onPress={() => toggleComplete(item.id)}>
                <Text
                  style={[
                    styles.taskText,
                    item.completed && styles.completedText,
                  ]}
                >
                  {item.title}
                </Text>
              </TouchableOpacity>

              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={() => openEdit(item)}
                  style={styles.editButton}
                >
                  <Text style={styles.editText}>✎</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => deleteTask(item.id)}
                  style={styles.deleteButton}
                >
                  <Text style={styles.deleteText}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* Edit Modal */}
      <Modal visible={!!editTask} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Edit Task</Text>
            <TextInput
              value={editText}
              onChangeText={setEditText}
              style={styles.modalInput}
            />
            <View style={styles.modalButtons}>
              <Button title="Cancel" color="gray" onPress={() => setEditTask(null)} />
              <Button title="Save" onPress={saveEdit} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
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
  taskText: { fontSize: 18 },
  completedText: {
    textDecorationLine: "line-through",
    color: "gray",
  },
  actions: { flexDirection: "row", gap: 10 },
  editButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  deleteButton: {
    backgroundColor: "#ff6b6b",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  editText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  deleteText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  modalContent: {
    backgroundColor: "#fff",
    width: "80%",
    padding: 20,
    borderRadius: 12,
    elevation: 5,
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "center",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
