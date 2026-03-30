import { useLocalSearchParams, useRouter } from "expo-router";
import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "@/firebaseConfig";
import { Colors } from "@/lib/types";

export default function JoinTripScreen() {
  const { shareCode } = useLocalSearchParams<{ shareCode: string }>();
  const router = useRouter();
  const [status, setStatus] = useState<
    "loading" | "not_found" | "already_joined" | "joining" | "joined" | "auth_required"
  >("loading");
  const [tripName, setTripName] = useState("");
  const [tripId, setTripId] = useState("");

  useEffect(() => {
    if (!shareCode) return;
    joinTrip();
  }, [shareCode]);

  const joinTrip = async () => {
    const user = auth.currentUser;
    if (!user) {
      setStatus("auth_required");
      return;
    }

    try {
      // Find trip by share code
      const tripsSnap = await getDocs(
        query(
          collection(db, "trips"),
          where("shareCode", "==", shareCode.toUpperCase())
        )
      );

      if (tripsSnap.empty) {
        setStatus("not_found");
        return;
      }

      const tripDoc = tripsSnap.docs[0];
      setTripId(tripDoc.id);
      setTripName(tripDoc.data().name || "Unnamed trip");

      // Check if already a participant
      const tripData = tripDoc.data();
      const participantIds: string[] = tripData.participantIds ?? [];
      if (participantIds.includes(user.uid)) {
        setStatus("already_joined");
        return;
      }

      // Add as participant
      setStatus("joining");
      await setDoc(
        doc(db, "trips", tripDoc.id, "participants", user.uid),
        {
          userId: user.uid,
          role: "participant",
          joinedAt: serverTimestamp(),
        }
      );
      // Also add to participantIds array on trip doc
      await updateDoc(doc(db, "trips", tripDoc.id), {
        participantIds: arrayUnion(user.uid),
      });

      setStatus("joined");
    } catch (err) {
      console.error("Failed to join trip:", err);
      setStatus("not_found");
    }
  };

  const goToTrip = () => {
    router.replace(`/trips/${tripId}`);
  };

  const goToLogin = () => {
    router.replace("/login");
  };

  const goHome = () => {
    router.replace("/trips");
  };

  return (
    <View style={styles.container}>
      {status === "loading" && (
        <>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.message}>Looking for trip...</Text>
        </>
      )}

      {status === "auth_required" && (
        <>
          <Text style={styles.title}>Login Required</Text>
          <Text style={styles.message}>
            Please log in to join this trip.
          </Text>
          <TouchableOpacity style={styles.button} onPress={goToLogin}>
            <Text style={styles.buttonText}>Go to Login</Text>
          </TouchableOpacity>
        </>
      )}

      {status === "not_found" && (
        <>
          <Text style={styles.title}>Trip Not Found</Text>
          <Text style={styles.message}>
            The share code "{shareCode}" doesn't match any trip.
          </Text>
          <TouchableOpacity style={styles.button} onPress={goHome}>
            <Text style={styles.buttonText}>Go to My Trips</Text>
          </TouchableOpacity>
        </>
      )}

      {status === "joining" && (
        <>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.message}>Joining {tripName}...</Text>
        </>
      )}

      {status === "joined" && (
        <>
          <Text style={styles.title}>Joined!</Text>
          <Text style={styles.message}>
            You've been added to "{tripName}"
          </Text>
          <TouchableOpacity style={styles.button} onPress={goToTrip}>
            <Text style={styles.buttonText}>Open Trip</Text>
          </TouchableOpacity>
        </>
      )}

      {status === "already_joined" && (
        <>
          <Text style={styles.title}>Already a member</Text>
          <Text style={styles.message}>
            You're already part of "{tripName}"
          </Text>
          <TouchableOpacity style={styles.button} onPress={goToTrip}>
            <Text style={styles.buttonText}>Open Trip</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
