import { router, useNavigation } from "expo-router";
import { signOut } from "firebase/auth";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { useEffect, useLayoutEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "@/firebaseConfig";
import TripCard from "@/components/TripCard";
import { Colors, Trip } from "@/lib/types";

function generateShareCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

interface TripWithMeta extends Trip {
  participantCount: number;
  openPollCount: number;
}

export default function Trips() {
  const navigation = useNavigation();
  const [trips, setTrips] = useState<TripWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [tripName, setTripName] = useState("");
  const [tripDescription, setTripDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [joinCode, setJoinCode] = useState("");

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => setMenuVisible(true)}
          style={{ paddingHorizontal: 12 }}
          testID="burger-menu-button"
        >
          <Text style={{ fontSize: 24 }}>☰</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut(auth);
            router.replace("/login");
          } catch (err) {
            console.error("Failed to sign out:", err);
          }
        },
      },
    ]);
  };

  const fetchTrips = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        router.replace("/login");
        return;
      }

      // Query trips where user is in the participantIds array
      const tripsSnap = await getDocs(
        query(
          collection(db, "trips"),
          where("participantIds", "array-contains", user.uid)
        )
      );

      const userTrips: TripWithMeta[] = [];

      for (const tripDoc of tripsSnap.docs) {
        const data = tripDoc.data();

        let openPollCount = 0;
        try {
          const pollsSnap = await getDocs(
            query(
              collection(db, "trips", tripDoc.id, "polls"),
              where("status", "==", "open")
            )
          );
          openPollCount = pollsSnap.size;
        } catch {}

        const participantIds: string[] = data.participantIds ?? [];

        userTrips.push({
          id: tripDoc.id,
          name: data.name ?? "Unnamed trip",
          description: data.description ?? null,
          coverImageUrl: data.coverImageUrl ?? null,
          createdBy: data.createdBy ?? data.userId ?? "",
          shareCode: data.shareCode ?? "",
          status: data.status ?? "planning",
          startDate: data.startDate ?? null,
          endDate: data.endDate ?? null,
          countryDestination: data.countryDestination ?? null,
          maxBudget: data.maxBudget ?? null,
          currency: data.currency ?? null,
          createdAt: data.createdAt,
          participantCount: Math.max(participantIds.length, 1),
          openPollCount,
        });
      }

      setTrips(userTrips);
    } catch (err) {
      setError("Unable to load trips right now.");
      console.error("Failed to load trips:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleCreateTrip = async () => {
    if (!tripName.trim()) return;

    setCreating(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      const shareCode = generateShareCode();
      const tripRef = await addDoc(collection(db, "trips"), {
        name: tripName.trim(),
        description: tripDescription.trim() || null,
        coverImageUrl: null,
        createdBy: user.uid,
        shareCode,
        status: "planning",
        startDate: null,
        endDate: null,
        countryDestination: null,
        maxBudget: null,
        currency: null,
        participantIds: [user.uid],
        createdAt: serverTimestamp(),
      });

      // Add creator as organizer participant
      await setDoc(doc(db, "trips", tripRef.id, "participants", user.uid), {
        userId: user.uid,
        role: "organizer",
        joinedAt: serverTimestamp(),
      });

      setTripName("");
      setTripDescription("");
      setModalVisible(false);
      await fetchTrips();
    } catch (err) {
      console.error("Failed to create trip:", err);
      setError("Unable to create trip right now.");
    } finally {
      setCreating(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTrips();
  };

  return (
    <View style={styles.container}>
      {loading && <ActivityIndicator size="large" color={Colors.primary} />}

      {!loading && error && <Text style={styles.errorText}>{error}</Text>}

      {!loading && !error && (
        <>
          <FlatList
            data={trips}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TripCard
                name={item.name}
                participantCount={item.participantCount}
                startDate={item.startDate}
                endDate={item.endDate}
                openPollCount={item.openPollCount}
                status={item.status}
                onPress={() => router.push(`/trips/${item.id}`)}
              />
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No trips yet.</Text>
            }
            contentContainerStyle={[
              { paddingHorizontal: 20, paddingTop: 12 },
              trips.length === 0 && styles.emptyListContainer,
              { paddingBottom: 100 },
            ]}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
          <View style={styles.bottomButtons}>
            <TouchableOpacity
              style={styles.joinButton}
              onPress={() => setJoinModalVisible(true)}
            >
              <Text style={styles.joinButtonText}>Join a trip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.createButtonText}>+ New trip</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Burger menu */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          style={styles.menuOverlay}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                router.push("/profile");
              }}
            >
              <Text style={styles.menuItemIcon}>👤</Text>
              <Text style={styles.menuItemText}>Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                router.push("/settings");
              }}
            >
              <Text style={styles.menuItemIcon}>⚙️</Text>
              <Text style={styles.menuItemText}>Settings</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                handleLogout();
              }}
            >
              <Text style={styles.menuItemIcon}>🚪</Text>
              <Text style={[styles.menuItemText, { color: Colors.danger }]}>
                Log Out
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Join trip modal */}
      <Modal
        visible={joinModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setJoinModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Join a Trip</Text>
            <Text style={styles.joinHint}>
              Enter the 8-character code shared by the trip organizer.
            </Text>
            <TextInput
              style={[styles.textInput, styles.codeInput]}
              placeholder="e.g. ABCD1234"
              value={joinCode}
              onChangeText={(t) => setJoinCode(t.toUpperCase())}
              autoFocus={true}
              autoCapitalize="characters"
              maxLength={8}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setJoinModalVisible(false);
                  setJoinCode("");
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => {
                  if (joinCode.trim().length > 0) {
                    setJoinModalVisible(false);
                    router.push(`/join/${joinCode.trim()}`);
                    setJoinCode("");
                  }
                }}
                disabled={joinCode.trim().length === 0}
              >
                <Text style={styles.confirmButtonText}>Join</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Create trip modal */}
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
              placeholder="Trip name"
              value={tripName}
              onChangeText={setTripName}
              autoFocus={true}
            />
            <TextInput
              style={[styles.textInput, { height: 60 }]}
              placeholder="Description (optional)"
              value={tripDescription}
              onChangeText={setTripDescription}
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setTripName("");
                  setTripDescription("");
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
                  <Text style={styles.confirmButtonText}>Create</Text>
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
    backgroundColor: Colors.background,
  },
  errorText: {
    marginTop: 20,
    color: Colors.danger,
    fontSize: 16,
    textAlign: "center",
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    marginTop: 20,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  bottomButtons: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    gap: 10,
  },
  joinButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  joinButtonText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  createButton: {
    flex: 1,
    backgroundColor: Colors.primary,
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
  joinHint: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  codeInput: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "600",
    letterSpacing: 4,
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
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: Colors.surface,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: Colors.surface,
  },
  confirmButton: {
    backgroundColor: Colors.primary,
  },
  cancelButtonText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: "600",
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  menuContainer: {
    backgroundColor: "#FFFFFF",
    marginTop: 100,
    marginLeft: 16,
    borderRadius: 12,
    paddingVertical: 8,
    width: 220,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  menuItemIcon: {
    fontSize: 20,
    marginRight: 14,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.textPrimary,
  },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
  },
});
