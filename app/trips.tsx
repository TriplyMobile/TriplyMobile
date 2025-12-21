import { router } from "expo-router";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { db } from "../firebaseConfig";

export default function Trips() {
  const [trips, setTrips] = useState<Array<{ id: string; name?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [tripName, setTripName] = useState("");
  const [creating, setCreating] = useState(false);

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

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleCreateTrip = async () => {
    if (!tripName.trim()) {
      return;
    }

    setCreating(true);
    try {
      await addDoc(collection(db, "trips"), {
        name: tripName.trim(),
      });
      setTripName("");
      setModalVisible(false);
      await fetchTrips();
    } catch (err) {
      console.error("Failed to create trip:", err);
      setError("Unable to create trip right now.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <View style={styles.container}>
      {loading && <ActivityIndicator size="large" color="#4A90E2" />}

      {!loading && error && <Text style={styles.errorText}>{error}</Text>}

      {!loading && !error && (
        <>
          <FlatList
            data={trips}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() => router.push(`/trips/${item.id}`)}
                activeOpacity={0.7}
              >
                <Text style={styles.tripName}>{item.name ?? "Unnamed trip"}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={styles.emptyText}>No trips yet.</Text>}
            contentContainerStyle={[
              trips.length === 0 && styles.emptyListContainer,
              { paddingBottom: 100 },
            ]}
            showsVerticalScrollIndicator={false}
          />
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.createButtonText}>Create new trip</Text>
          </TouchableOpacity>
        </>
      )}

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Trip</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter trip name"
              value={tripName}
              onChangeText={setTripName}
              autoFocus={true}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setTripName("");
                }}
                disabled={creating}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleCreateTrip}
                disabled={creating || !tripName.trim()}
              >
                {creating ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmButtonText}>Confirm</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  createButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#4A90E2",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    width: "85%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: "#F9F9F9",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F5F7FB",
  },
  confirmButton: {
    backgroundColor: "#4A90E2",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
