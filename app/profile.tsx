import { StyleSheet, Text, View } from "react-native";
import { auth } from "@/firebaseConfig";

export default function Profile() {
  const user = auth.currentUser;

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {user?.email?.[0]?.toUpperCase() ?? "?"}
        </Text>
      </View>
      <Text style={styles.label}>Email</Text>
      <Text style={styles.value}>{user?.email ?? "N/A"}</Text>

      <Text style={styles.label}>User ID</Text>
      <Text style={styles.value}>{user?.uid ?? "N/A"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    paddingTop: 40,
    paddingHorizontal: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#999",
    alignSelf: "flex-start",
    marginTop: 16,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 17,
    color: "#333",
    alignSelf: "flex-start",
    marginTop: 4,
  },
});
