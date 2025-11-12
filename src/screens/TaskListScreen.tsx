import React from "react";
import { Button, FlatList, StyleSheet, Text, View } from "react-native";
import { useTasks } from "../context/TasksContext";
import { Task } from "../types/Task";

export default function TaskListScreen() {
  const { tasks, addTask, deleteTask } = useTasks();

  const handleAdd = () => {
    const newTask: Task = {
      id: Date.now().toString(),
      userId: "demo",
      title: `Task ${tasks.length + 1}`,
      priority: "MEDIUM",
      status: "OPEN",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addTask(newTask);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Your Tasks</Text>
      <Button title="Add Sample Task" onPress={handleAdd} />
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <Text style={styles.taskTitle}>{item.title}</Text>
            <Button title="Delete" onPress={() => deleteTask(item.id)} />
          </View>
        )}
        ListEmptyComponent={<Text>No tasks yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  heading: { fontSize: 22, fontWeight: "bold", marginBottom: 12 },
  taskItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  taskTitle: { fontSize: 16 },
});
