import React, { useContext, useEffect, useState } from "react";
import {
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

import { MaterialIcons } from "@expo/vector-icons";
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
      <View style={styles.headerRow}>
        <Text style={[styles.header, { color: theme.text }]}>Your Tasks</Text>
        <View
          style={[
            styles.headerIconBadge,
            { borderColor: theme.accent, backgroundColor: theme.card },
          ]}
        >
          <MaterialIcons
            name="checklist"
            size={22}
            color={theme.accent || "#4CAF50"}
          />
        </View>
      </View>

      <View style={styles.inputRow}>
        <TextInput
          placeholder="Enter new task..."
          placeholderTextColor={theme.subtle}
          value={taskTitle}
          onChangeText={setTaskTitle}
          style={[
            styles.input,
            {
              color: theme.text,
              borderColor: theme.subtle,
              backgroundColor: theme.card,
            },
          ]}
        />
        <TouchableOpacity
          style={[styles.smallButton, { backgroundColor: theme.card }]}
          onPress={openAddDatePicker}
        >
          <MaterialIcons
            name="event"
            size={18}
            color={theme.accent || "#2196f3"}
          />
          <Text style={[styles.smallButtonText, { color: theme.text }]}>
            Date
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.smallButton, { backgroundColor: theme.accent }]}
          onPress={addTask}
        >
          <MaterialIcons name="add" size={18} color="#ffffff" />
          <Text style={[styles.smallButtonText, { color: "#ffffff" }]}>
            Add
          </Text>
        </TouchableOpacity>
      </View>

      {/* Task list */}
      <FlatList
        data={tasks}
        keyExtractor={(t) => t.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View
            style={[
              styles.taskRow,
              {
                backgroundColor: theme.card,
                borderColor: item.completed ? theme.accent : theme.card,
              },
            ]}
          >
            {/* Left: status + text */}
            <TouchableOpacity
              style={styles.taskLeft}
              onPress={() => toggleComplete(item)}
            >
              <View
                style={[
                  styles.statusDot,
                  {
                    borderColor: item.completed
                      ? theme.accent
                      : theme.subtle || theme.text,
                    backgroundColor: item.completed ? theme.accent : "transparent",
                  },
                ]}
              >
                {item.completed && (
                  <MaterialIcons name="check" size={14} color="#000" />
                )}
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.taskText,
                    {
                      color: theme.text,
                      textDecorationLine: item.completed
                        ? "line-through"
                        : "none",
                    },
                  ]}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                {item.dueDate ? (
                  <View style={styles.taskMetaRow}>
                    <MaterialIcons
                      name="event"
                      size={14}
                      color={theme.subtle}
                      style={{ marginRight: 4 }}
                    />
                    <Text
                      style={[styles.taskMeta, { color: theme.subtle }]}
                    >{`Due: ${item.dueDate}`}</Text>
                  </View>
                ) : (
                  <Text
                    style={[styles.taskMeta, { color: theme.subtle }]}
                  >
                    No due date
                  </Text>
                )}
              </View>
            </TouchableOpacity>

            {/* Right: edit/delete buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.iconButton, { backgroundColor: "#4CAF50" }]}
                onPress={() => openEdit(item)}
              >
                <MaterialIcons name="edit" size={18} color="#ffffff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconButton, { backgroundColor: "#FF5252" }]}
                onPress={() => deleteTask(item.id)}
              >
                <MaterialIcons name="delete" size={18} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Edit modal */}
      <Modal visible={!!editTask} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.editCard,
              { backgroundColor: theme.card, borderColor: theme.accent },
            ]}
          >
            <Text style={[styles.modalHeader, { color: theme.text }]}>
              Edit Task
            </Text>

            <TextInput
              value={editText}
              onChangeText={setEditText}
              style={[
                styles.modalInput,
                { color: theme.text, borderColor: theme.subtle },
              ]}
            />

            <TouchableOpacity
              style={[
                styles.dateChangeButton,
                { borderColor: theme.accent },
              ]}
              onPress={openEditDatePicker}
            >
              <MaterialIcons
                name="event"
                size={18}
                color={theme.accent || "#4CAF50"}
                style={{ marginRight: 6 }}
              />
              <Text style={{ color: theme.text }}>Change date</Text>
            </TouchableOpacity>

            {editDate && (
              <Text style={{ color: theme.text, marginTop: 4 }}>
                Due: {toYMD(editDate)}
              </Text>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: theme.card, borderColor: theme.subtle },
                ]}
                onPress={() => setEditTask(null)}
              >
                <Text style={{ color: theme.text }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: theme.accent, borderColor: theme.accent },
                ]}
                onPress={saveEdit}
              >
                <Text style={{ color: "#fff" }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
  },
  headerIconBadge: {
    padding: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    fontSize: 14,
  },
  smallButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 0,
    gap: 4,
  },
  smallButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
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
  taskText: {
    fontSize: 16,
    fontWeight: "500",
  },
  taskMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  taskMeta: {
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  editCard: {
    width: "85%",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  modalHeader: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
  modalInput: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  dateChangeButton: {
    marginTop: 4,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  modalActions: {
    flexDirection: "row",
    marginTop: 16,
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    marginHorizontal: 4,
  },
});
