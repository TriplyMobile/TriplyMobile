import { StyleSheet, Text, View } from "react-native";

export default function FinancesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Finances</Text>
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
