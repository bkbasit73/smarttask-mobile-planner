import React, { useContext, useEffect, useState } from "react";
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
import { ThemeContext } from "../_layout";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";

type Task = { id: string; title: string; completed: boolean; dueDate?: string };

const toYMD = (date: Date) => date.toISOString().split("T")[0];

export default function TasksScreen() {
  const { theme } = useContext(ThemeContext);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskTitle, setTaskTitle] = useState("");

  const [addDueDate, setAddDueDate] = useState<Date | null>(null);
  const [showAddPicker, setShowAddPicker] = useState(false);
  const [showAddCalendar, setShowAddCalendar] = useState(false);

  const [editTask, setEditTask] = useState<Task | null>(null);
  const [editText, setEditText] = useState("");
  const [editDate, setEditDate] = useState<Date | null>(null);
  const [showEditPicker, setShowEditPicker] = useState(false);
  const [showEditCalendar, setShowEditCalendar] = useState(false);

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
    const interval = setInterval(loadTasks, 2000);
    return () => clearInterval(interval);
  }, []);

  const addTask = async () => {
    if (!taskTitle.trim()) return;
    await addDoc(collection(db, "tasks"), {
      title: taskTitle.trim(),
      completed: false,
      dueDate: addDueDate ? toYMD(addDueDate) : "",
    });
    setTaskTitle("");
    setAddDueDate(null);
    loadTasks();
  };

  const deleteTask = async (id: string) => {
    await deleteDoc(doc(db, "tasks", id));
    loadTasks();
  };

  const toggleComplete = async (task: Task) => {
    await updateDoc(doc(db, "tasks", task.id), {
      completed: !task.completed,
    });
    loadTasks();
  };

  const openEdit = (t: Task) => {
    setEditTask(t);
    setEditText(t.title);
    setEditDate(t.dueDate ? new Date(t.dueDate) : null);
  };

  const saveEdit = async () => {
    if (!editTask) return;
    await updateDoc(doc(db, "tasks", editTask.id), {
      title: editText.trim(),
      dueDate: editDate ? toYMD(editDate) : "",
    });
    setEditTask(null);
    loadTasks();
  };

  const openAddDatePicker = () =>
    Platform.OS === "web" ? setShowAddCalendar(true) : setShowAddPicker(true);

  const openEditDatePicker = () =>
    Platform.OS === "web" ? setShowEditCalendar(true) : setShowEditPicker(true);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.header, { color: theme.text }]}>Your Tasks</Text>

      <View style={styles.inputRow}>
        <TextInput
          placeholder="Enter new task..."
          placeholderTextColor={theme.text}
          value={taskTitle}
          onChangeText={setTaskTitle}
          style={[styles.input, { color: theme.text, borderColor: theme.text }]}
        />
        <Button title="Pick Date" onPress={openAddDatePicker} />
        <Button title="Add" onPress={addTask} />
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(t) => t.id}
        renderItem={({ item }) => (
          <View style={[styles.taskRow, { backgroundColor: theme.card }]}>
            <TouchableOpacity onPress={() => toggleComplete(item)}>
              <Text
                style={[
                  styles.taskText,
                  {
                    color: theme.text,
                    textDecorationLine: item.completed ? "line-through" : "none",
                  },
                ]}
              >
                {item.title}
              </Text>
              {item.dueDate ? (
                <Text style={{ color: theme.text }}>📅 {item.dueDate}</Text>
              ) : null}
            </TouchableOpacity>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => openEdit(item)}
              >
                <Text style={styles.buttonTxt}>✎</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteTask(item.id)}
              >
                <Text style={styles.buttonTxt}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Edit modal */}
      <Modal visible={!!editTask} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.editCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalHeader, { color: theme.text }]}>
              Edit Task
            </Text>

            <TextInput
              value={editText}
              onChangeText={setEditText}
              style={[
                styles.modalInput,
                { color: theme.text, borderColor: theme.text },
              ]}
            />

            <Button title="Change Date" onPress={openEditDatePicker} />

            {editDate && (
              <Text style={{ color: theme.text }}>Due: {toYMD(editDate)}</Text>
            )}

            <View
              style={{
                flexDirection: "row",
                marginTop: 15,
                justifyContent: "space-between",
              }}
            >
              <Button title="Cancel" onPress={() => setEditTask(null)} />
              <Button title="Save" onPress={saveEdit} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
  },
  inputRow: { flexDirection: "row", gap: 10, marginBottom: 15 },
  input: { flex: 1, borderWidth: 1, padding: 10, borderRadius: 8 },
  taskRow: { padding: 15, borderRadius: 10, marginBottom: 10 },
  taskText: { fontSize: 18 },
  editButton: { backgroundColor: "#4CAF50", padding: 6, borderRadius: 6 },
  deleteButton: { backgroundColor: "#FF5252", padding: 6, borderRadius: 6 },
  buttonTxt: { color: "#fff", fontSize: 18 },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  editCard: { width: "85%", padding: 20, borderRadius: 12 },
  modalHeader: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  modalInput: { borderWidth: 1, padding: 10, borderRadius: 8, marginBottom: 10 },
});
