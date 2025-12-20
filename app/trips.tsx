import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { db } from "../firebaseConfig";

export default function Trips() {
  const [trips, setTrips] = useState<Array<{ id: string; name?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const snapshot = await getDocs(collection(db, "trips"));
        const allTrips = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as { name?: string }),
        }));

        setTrips(allTrips);
      } catch (err) {
        setError("Unable to load trips right now.");
        console.error("Failed to load trips:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  return (
    <View style={styles.container}>

      {loading && <ActivityIndicator size="large" color="#4A90E2" />}

      {!loading && error && <Text style={styles.errorText}>{error}</Text>}

      {!loading && !error && (
        <FlatList
          data={trips}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.tripName}>{item.name ?? "Unnamed trip"}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No trips yet.</Text>}
          contentContainerStyle={trips.length === 0 && styles.emptyListContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  card: {
    width: "100%",
    padding: 16,
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: "#F5F7FB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  tripName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    marginTop: 20,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    marginTop: 20,
    color: "#E53935",
    fontSize: 16,
  },
});
