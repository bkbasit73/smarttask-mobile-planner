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
import { Calendar } from "react-native-calendars";

type Task = {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string; // YYYY-MM-DD
};

const STORAGE_KEY = "@smarttask_tasks";

/** Small helper: ISO date -> 'YYYY-MM-DD' */
const toYMD = (d: Date) => d.toISOString().split("T")[0];

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskTitle, setTaskTitle] = useState("");

  // Add flow states
  const [addDueDate, setAddDueDate] = useState<Date | null>(null);
  const [showAddPicker, setShowAddPicker] = useState(false); // native
  const [showAddCalendar, setShowAddCalendar] = useState(false); // web

  // Edit flow states
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [editText, setEditText] = useState("");
  const [editDate, setEditDate] = useState<Date | null>(null);
  const [showEditPicker, setShowEditPicker] = useState(false); // native
  const [showEditCalendar, setShowEditCalendar] = useState(false); // web

  // load + save
  useEffect(() => { loadTasks(); }, []);
  useEffect(() => { saveTasks(tasks); }, [tasks]);

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
      dueDate: addDueDate ? toYMD(addDueDate) : undefined,
    };
    setTasks((prev) => [...prev, newTask]);
    setTaskTitle("");
    setAddDueDate(null);
  };

  const deleteTask = (id: string) =>
    setTasks((prev) => prev.filter((t) => t.id !== id));

  const toggleComplete = (id: string) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));

  const openEdit = (task: Task) => {
    setEditTask(task);
    setEditText(task.title);
    setEditDate(task.dueDate ? new Date(task.dueDate) : null);
  };

  const saveEdit = () => {
    if (!editTask || !editText.trim()) return;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === editTask.id
          ? { ...t, title: editText.trim(), dueDate: editDate ? toYMD(editDate) : undefined }
          : t
      )
    );
    setEditTask(null);
    setEditText("");
    setEditDate(null);
  };

  // Open the correct picker based on platform
  const openAddDatePicker = () => {
    if (Platform.OS === "web") setShowAddCalendar(true);
    else setShowAddPicker(true);
  };
  const openEditDatePicker = () => {
    if (Platform.OS === "web") setShowEditCalendar(true);
    else setShowEditPicker(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Tasks</Text>

      {/* Add row */}
      <View style={styles.inputRow}>
        <TextInput
          placeholder="Enter new task..."
          value={taskTitle}
          onChangeText={setTaskTitle}
          style={styles.input}
        />
        <Button title="Pick Date" onPress={openAddDatePicker} />
        <Button title="Add" onPress={addTask} />
      </View>

      {addDueDate && (
        <Text style={styles.dateLabel}>Due: {toYMD(addDueDate)}</Text>
      )}

      {/* Native add date picker (iOS/Android) */}
      {showAddPicker && (
        <DateTimePicker
          value={addDueDate || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, date) => {
            setShowAddPicker(false);
            if (date) setAddDueDate(date);
          }}
        />
      )}

      {/* Web add date picker (Calendar modal) */}
      <Modal visible={showAddCalendar} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.calendarCard}>
            <Text style={styles.modalHeader}>Select Due Date</Text>
            <Calendar
              onDayPress={(d) => {
                setAddDueDate(new Date(d.dateString));
                setShowAddCalendar(false);
              }}
              markedDates={
                addDueDate
                  ? { [toYMD(addDueDate)]: { selected: true, selectedColor: "#4CAF50" } }
                  : {}
              }
            />
            <View style={{ marginTop: 10 }}>
              <Button title="Close" onPress={() => setShowAddCalendar(false)} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Task list */}
      {tasks.length === 0 ? (
        <Text style={{ marginTop: 40, color: "gray" }}>No tasks yet — add one!</Text>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.taskRow}>
              <TouchableOpacity onPress={() => toggleComplete(item.id)}>
                <Text style={[styles.taskText, item.completed && styles.completedText]}>
                  {item.title}
                </Text>
                {item.dueDate && <Text style={styles.dueDate}>📅 {item.dueDate}</Text>}
              </TouchableOpacity>

              <View style={styles.actions}>
                <TouchableOpacity onPress={() => openEdit(item)} style={styles.editButton}>
                  <Text style={styles.actionText}>✎</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteTask(item.id)} style={styles.deleteButton}>
                  <Text style={styles.actionText}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* Edit modal (with cross-platform date selection) */}
      <Modal visible={!!editTask} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.editCard}>
            <Text style={styles.modalHeader}>Edit Task</Text>

            <TextInput
              value={editText}
              onChangeText={setEditText}
              style={styles.modalInput}
              placeholder="Task title"
            />

            <Button title="Change Date" onPress={openEditDatePicker} />
            {editDate && <Text style={{ textAlign: "center", marginTop: 6 }}>Due: {toYMD(editDate)}</Text>}

            {/* Native edit picker */}
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

            {/* Web edit calendar */}
            <Modal visible={showEditCalendar} transparent animationType="fade">
              <View style={styles.modalOverlay}>
                <View style={styles.calendarCard}>
                  <Text style={styles.modalHeader}>Select Due Date</Text>
                  <Calendar
                    onDayPress={(d) => {
                      setEditDate(new Date(d.dateString));
                      setShowEditCalendar(false);
                    }}
                    markedDates={
                      editDate
                        ? { [toYMD(editDate)]: { selected: true, selectedColor: "#4CAF50" } }
                        : {}
                    }
                  />
                  <View style={{ marginTop: 10 }}>
                    <Button title="Close" onPress={() => setShowEditCalendar(false)} />
                  </View>
                </View>
              </View>
            </Modal>

            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 12 }}>
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
  header: { fontSize: 26, fontWeight: "bold", textAlign: "center", marginBottom: 15 },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  input: { flex: 1, borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 8 },
  dateLabel: { textAlign: "center", color: "#333", marginBottom: 10 },

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
  completedText: { textDecorationLine: "line-through", color: "gray" },
  dueDate: { color: "#666", fontSize: 14 },
  actions: { flexDirection: "row", gap: 10 },
  editButton: { backgroundColor: "#4CAF50", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  deleteButton: { backgroundColor: "#ff6b6b", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  actionText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

  modalOverlay: {
    flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.3)"
  },
  editCard: { backgroundColor: "#fff", width: "85%", padding: 20, borderRadius: 12 },
  calendarCard: { backgroundColor: "#fff", width: "90%", padding: 14, borderRadius: 12 },

  modalHeader: { fontSize: 20, fontWeight: "600", textAlign: "center", marginBottom: 10 },
  modalInput: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginBottom: 10 },
});
