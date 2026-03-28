import { StyleSheet, Text, View } from "react-native";

export default function ChecklistsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Checklists</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 18,
    color: "#666",
  },
});
