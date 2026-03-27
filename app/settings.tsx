import { StyleSheet, Text, View } from "react-native";

export default function Settings() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Settings</Text>
      <Text style={styles.placeholder}>
        Notifications, language, and theme preferences will be available here soon.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: 40,
    paddingHorizontal: 24,
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  placeholder: {
    fontSize: 16,
    color: "#999",
    lineHeight: 24,
  },
});
