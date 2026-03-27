import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useLayoutEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { db } from "../../../firebaseConfig";

export default function TripScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const [tripName, setTripName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTripName = async () => {
      if (!id || typeof id !== "string") {
        setLoading(false);
        return;
      }

      try {
        const tripRef = doc(db, "trips", id);
        const tripSnap = await getDoc(tripRef);

        if (tripSnap.exists()) {
          setTripName(tripSnap.data().name || "");
        }
      } catch (err) {
        console.error("Failed to load trip name:", err);
      } finally {
        setLoading(false);
      }
    };

    loadTripName();
  }, [id]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: tripName,
      headerRight: () => (
        <Ionicons
          name="information-circle-outline"
          size={32}
          color="#007AFF"
          onPress={() => router.push(`/trips/${id}/details`)}
          accessibilityLabel="Trip details"
          accessibilityHint="Navigate to trip details page"
          accessibilityRole="button"
          style={{"paddingLeft": 2}}
        />
      ),
    });
  }, [navigation, tripName, id, router]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
});
