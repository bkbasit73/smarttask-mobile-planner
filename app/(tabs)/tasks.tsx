import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useCallback, useContext, useEffect, useState } from "react";
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

import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { ThemeContext } from "../_layout";

type Task = {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
};

const toYMD = (date: Date) => date.toISOString().split("T")[0];

export default function TasksScreen() {
  const { theme } = useContext(ThemeContext);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");

  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const [editTask, setEditTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState<Date | null>(null);
  const [showEditPicker, setShowEditPicker] = useState(false);
  const [showEditCalendar, setShowEditCalendar] = useState(false);

  // --------------------------
  // LOAD FIRESTORE TASKS
  // --------------------------
  const loadTasks = useCallback(async () => {
    const col = collection(db, "tasks");
    const snapshot = await getDocs(col);

    const list: Task[] = snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        title: data.title,
        completed: data.completed,
        dueDate: data.dueDate,
      };
    });

    setTasks(list);
  }, []);

  useEffect(() => {
    loadTasks();

    // Auto-refresh every 2 seconds
    const interval = setInterval(loadTasks, 2000);
    return () => clearInterval(interval);
  }, [loadTasks]);

  // --------------------------
  // ADD TASK
  // --------------------------
  const addTask = async () => {
    if (!title.trim()) return;

    await addDoc(collection(db, "tasks"), {
      title,
      completed: false,
      dueDate: dueDate ? toYMD(dueDate) : null,
    });

    setTitle("");
    setDueDate(null);
    loadTasks();
  };

  // --------------------------
  // DELETE TASK
  // --------------------------
  const deleteTask = async (id: string) => {
    await deleteDoc(doc(db, "tasks", id));
    loadTasks();
  };

  // --------------------------
  // TOGGLE COMPLETE
  // --------------------------
  const toggleComplete = async (task: Task) => {
    await updateDoc(doc(db, "tasks", task.id), {
      completed: !task.completed,
    });
    loadTasks();
  };

  // --------------------------
  // OPEN EDIT
  // --------------------------
  const openEdit = (task: Task) => {
    setEditTask(task);
    setEditTitle(task.title);
    setEditDate(task.dueDate ? new Date(task.dueDate) : null);
  };

  // --------------------------
  // SAVE EDIT
  // --------------------------
  const saveEdit = async () => {
    if (!editTask) return;

    await updateDoc(doc(db, "tasks", editTask.id), {
      title: editTitle,
      dueDate: editDate ? toYMD(editDate) : null,
    });

    setEditTask(null);
    loadTasks();
  };

  // --------------------------
  // RENDER ITEM
  // --------------------------
  const renderItem = ({ item }: { item: Task }) => (
    <View style={[styles.taskRow, { backgroundColor: theme.card }]}>
      <TouchableOpacity onPress={() => toggleComplete(item)}>
        <Text
          style={[
            styles.taskText,
            { color: theme.text },
            item.completed && { textDecorationLine: "line-through", opacity: 0.5 },
          ]}
        >
          {item.title}
        </Text>

        {item.dueDate && (
          <Text style={{ fontSize: 12, color: theme.accent }}>📅 {item.dueDate}</Text>
        )}
      </TouchableOpacity>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <TouchableOpacity
          style={[styles.editButton]}
          onPress={() => openEdit(item)}
        >
          <Text style={styles.editText}>✎</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.deleteButton]}
          onPress={() => deleteTask(item.id)}
        >
          <Text style={styles.deleteText}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.header, { color: theme.text }]}>Your Tasks</Text>

      {/* Input Row */}
      <View style={styles.inputRow}>
        <TextInput
          placeholder="Enter new task..."
          placeholderTextColor="#888"
          value={title}
          onChangeText={setTitle}
          style={[styles.input, { color: theme.text }]}
        />

        <Button title="Date" onPress={() => (Platform.OS === "web" ? setShowCalendar(true) : setShowPicker(true))} />
        <Button title="Add" onPress={addTask} />
      </View>

      {/* ------------------------
          DATE PICKER (ADD)
      ------------------------- */}
      {showPicker && (
        <DateTimePicker
          value={dueDate || new Date()}
          mode="date"
          onChange={(_, d) => {
            setShowPicker(false);
            if (d) setDueDate(d);
          }}
        />
      )}

      {/* Web Calendar */}
      <Modal visible={showCalendar} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.calendarCard}>
            <Calendar
              onDayPress={(d) => {
                setDueDate(new Date(d.dateString));
                setShowCalendar(false);
              }}
            />
            <Button title="Close" onPress={() => setShowCalendar(false)} />
          </View>
        </View>
      </Modal>

      {/* TASK LIST */}
      <FlatList data={tasks} keyExtractor={(t) => t.id} renderItem={renderItem} />

      {/* ------------------------
          EDIT MODAL
      ------------------------- */}
      <Modal visible={!!editTask} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.editCard}>
            <Text style={styles.modalHeader}>Edit Task</Text>

            <TextInput
              value={editTitle}
              onChangeText={setEditTitle}
              style={styles.modalInput}
              placeholder="Task title"
            />

            <Button
              title="Change Date"
              onPress={() =>
                Platform.OS === "web"
                  ? setShowEditCalendar(true)
                  : setShowEditPicker(true)
              }
            />

            {/* Native Edit Picker */}
            {showEditPicker && (
              <DateTimePicker
                value={editDate || new Date()}
                mode="date"
                onChange={(_, d) => {
                  setShowEditPicker(false);
                  if (d) setEditDate(d);
                }}
              />
            )}

            {/* Web Edit Calendar */}
            <Modal visible={showEditCalendar} transparent animationType="fade">
              <View style={styles.modalOverlay}>
                <View style={styles.calendarCard}>
                  <Calendar
                    onDayPress={(d) => {
                      setEditDate(new Date(d.dateString));
                      setShowEditCalendar(false);
                    }}
                  />
                  <Button title="Close" onPress={() => setShowEditCalendar(false)} />
                </View>
              </View>
            </Modal>

            <View style={styles.editButtons}>
              <Button title="Cancel" onPress={() => setEditTask(null)} color="gray" />
              <Button title="Save" onPress={saveEdit} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 18 },
  header: { fontSize: 26, fontWeight: "bold", marginBottom: 15 },

  inputRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#bbb",
    padding: 10,
    borderRadius: 10,
  },

  taskRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  taskText: { fontSize: 18 },

  editButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  deleteButton: {
    backgroundColor: "#ff5555",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  editText: { color: "#fff", fontSize: 16 },
  deleteText: { color: "#fff", fontSize: 16 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  calendarCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    width: "90%",
  },

  editCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "90%",
  },

  modalHeader: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
  },

  editButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
});
