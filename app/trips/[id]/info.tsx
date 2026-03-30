import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Avatar from "@/components/Avatar";
import { auth, db } from "@/firebaseConfig";
import { Colors, Participant } from "@/lib/types";

export default function TripInfoScreen() {
  const { id: tripId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [shareCode, setShareCode] = useState("");
  const [participants, setParticipants] = useState<
    (Participant & { displayName: string })[]
  >([]);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tripId) return;
    loadData();
  }, [tripId]);

  const loadData = async () => {
    try {
      const tripSnap = await getDoc(doc(db, "trips", tripId));
      if (!tripSnap.exists()) return;
      const data = tripSnap.data();
      setName(data.name || "");
      setDescription(data.description || "");
      setShareCode(data.shareCode || "");

      const participantsSnap = await getDocs(
        collection(db, "trips", tripId, "participants")
      );

      const participantList: (Participant & { displayName: string })[] = [];
      for (const pDoc of participantsSnap.docs) {
        const pData = pDoc.data() as Participant;
        let displayName = pData.userId;
        try {
          const userSnap = await getDoc(doc(db, "users", pData.userId));
          if (userSnap.exists()) {
            displayName =
              userSnap.data().displayName || userSnap.data().email || pData.userId;
          }
        } catch {}
        participantList.push({ ...pData, displayName });
      }
      setParticipants(participantList);

      const userId = auth.currentUser?.uid;
      setIsOrganizer(
        participantList.some(
          (p) => p.userId === userId && p.role === "organizer"
        )
      );
    } catch (err) {
      console.error("Failed to load trip info:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await updateDoc(doc(db, "trips", tripId), {
        name: name.trim(),
        description: description.trim() || null,
      });
      setEditing(false);
    } catch (err) {
      Alert.alert("Error", "Failed to update trip info");
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join my trip on Triply! Use code: ${shareCode}`,
      });
    } catch {}
  };

  const handleLeave = () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    Alert.alert("Leave Trip", "Are you sure you want to leave this trip?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Leave",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(
              doc(db, "trips", tripId, "participants", userId)
            );
            router.dismiss();
            router.replace("/trips");
          } catch (err) {
            Alert.alert("Error", "Failed to leave trip");
          }
        },
      },
    ]);
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Trip",
      "This will permanently delete the trip and all its data.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "trips", tripId));
              router.dismiss();
              router.replace("/trips");
            } catch (err) {
              Alert.alert("Error", "Failed to delete trip");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      {/* Trip name */}
      <Text style={styles.label}>Name</Text>
      {editing ? (
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
        />
      ) : (
        <Text style={styles.value}>{name}</Text>
      )}

      {/* Description */}
      <Text style={styles.label}>Description</Text>
      {editing ? (
        <TextInput
          style={[styles.input, { height: 80 }]}
          value={description}
          onChangeText={setDescription}
          multiline
          placeholder="No description"
        />
      ) : (
        <Text style={[styles.value, !description && styles.placeholder]}>
          {description || "No description"}
        </Text>
      )}

      {isOrganizer && (
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => {
            if (editing) handleSave();
            else setEditing(true);
          }}
        >
          <Text style={styles.editButtonText}>
            {editing ? "Save" : "Edit"}
          </Text>
        </TouchableOpacity>
      )}

      {/* Share code */}
      <Text style={[styles.label, { marginTop: 24 }]}>Share Code</Text>
      <View style={styles.shareRow}>
        <Text style={styles.shareCode}>{shareCode}</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Ionicons name="share-outline" size={20} color={Colors.primary} />
          <Text style={styles.shareButtonText}>Share</Text>
        </TouchableOpacity>
      </View>

      {/* Participants */}
      <Text style={[styles.label, { marginTop: 24 }]}>
        Participants ({participants.length})
      </Text>
      {participants.map((p) => (
        <View key={p.userId} style={styles.participantRow}>
          <Avatar name={p.displayName} size={32} />
          <Text style={styles.participantName}>{p.displayName}</Text>
          {p.role === "organizer" && (
            <Text style={styles.organizerBadge}>Organizer</Text>
          )}
        </View>
      ))}

      {/* Actions */}
      <View style={styles.actions}>
        {!isOrganizer && (
          <TouchableOpacity style={styles.dangerButton} onPress={handleLeave}>
            <Text style={styles.dangerButtonText}>Leave Trip</Text>
          </TouchableOpacity>
        )}
        {isOrganizer && (
          <TouchableOpacity style={styles.dangerButton} onPress={handleDelete}>
            <Text style={styles.dangerButtonText}>Delete Trip</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    fontSize: 11,
    fontWeight: "500",
    color: Colors.textTertiary,
    textTransform: "uppercase",
    marginBottom: 4,
    marginTop: 16,
  },
  value: {
    fontSize: 15,
    color: Colors.textPrimary,
  },
  placeholder: {
    color: Colors.textTertiary,
    fontStyle: "italic",
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    backgroundColor: Colors.surface,
  },
  editButton: {
    alignSelf: "flex-start",
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.primary,
  },
  editButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  shareRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  shareCode: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textPrimary,
    letterSpacing: 2,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.blueBg,
  },
  shareButtonText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: "500",
  },
  participantRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 10,
  },
  participantName: {
    fontSize: 14,
    color: Colors.textPrimary,
    flex: 1,
  },
  organizerBadge: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: "500",
  },
  actions: {
    marginTop: 40,
    marginBottom: 20,
  },
  dangerButton: {
    padding: 14,
    borderRadius: 10,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
  },
  dangerButtonText: {
    color: Colors.danger,
    fontSize: 15,
    fontWeight: "600",
  },
});
