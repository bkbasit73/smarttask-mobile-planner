import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import {
    Button,
    FlatList,
    Modal,
    Platform,
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
  dueDate?: string;
};

const STORAGE_KEY = "@smarttask_tasks";

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [editText, setEditText] = useState("");
  const [editDate, setEditDate] = useState<Date | null>(null);
  const [showEditPicker, setShowEditPicker] = useState(false);

  // Load + save tasks
  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const loadTasks = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) setTasks(JSON.parse(stored));
    } catch (e) {
      console.error("Load error", e);
    }
  };

  const saveTasks = async (data: Task[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Save error", e);
    }
  };

  const addTask = () => {
    if (!taskTitle.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      title: taskTitle.trim(),
      completed: false,
      dueDate: dueDate ? dueDate.toISOString().split("T")[0] : undefined,
    };
    setTasks((prev) => [...prev, newTask]);
    setTaskTitle("");
    setDueDate(null);
  };

  const deleteTask = (id: string) =>
    setTasks((prev) => prev.filter((t) => t.id !== id));

  const toggleComplete = (id: string) =>
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );

  const openEdit = (task: Task) => {
    setEditTask(task);
    setEditText(task.title);
    setEditDate(task.dueDate ? new Date(task.dueDate) : null);
  };

  const saveEdit = () => {
    if (editTask && editText.trim()) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editTask.id
            ? {
                ...t,
                title: editText.trim(),
                dueDate: editDate
                  ? editDate.toISOString().split("T")[0]
                  : undefined,
              }
            : t
        )
      );
      setEditTask(null);
      setEditText("");
      setEditDate(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Tasks</Text>

      {/* Add Task Row */}
      <View style={styles.inputRow}>
        <TextInput
          placeholder="Enter new task..."
          value={taskTitle}
          onChangeText={setTaskTitle}
          style={styles.input}
        />
        <Button title="Pick Date" onPress={() => setShowPicker(true)} />
        <Button title="Add" onPress={addTask} />
      </View>

      {dueDate && (
        <Text style={styles.dateLabel}>
          Due: {dueDate.toISOString().split("T")[0]}
        </Text>
      )}

      {showPicker && (
        <DateTimePicker
          value={dueDate || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, date) => {
            setShowPicker(false);
            if (date) setDueDate(date);
          }}
        />
      )}

      {/* Task List */}
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
                {item.dueDate && (
                  <Text style={styles.dueDate}>
                    📅 {item.dueDate}
                  </Text>
                )}
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
            <Button
              title="Change Date"
              onPress={() => setShowEditPicker(true)}
            />
            {editDate && (
              <Text style={styles.dateLabel}>
                Due: {editDate.toISOString().split("T")[0]}
              </Text>
            )}
            {showEditPicker && (
              <DateTimePicker
                value={editDate || new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(_, date) => {
                  setShowEditPicker(false);
                  if (date) setEditDate(date);
                }}
              />
            )}
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
    marginBottom: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
  },
  dateLabel: {
    textAlign: "center",
    color: "#333",
    marginBottom: 10,
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
  dueDate: { color: "#666", fontSize: 14 },
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
