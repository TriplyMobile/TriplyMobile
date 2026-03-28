import { Ionicons } from "@expo/vector-icons";
import { Tabs, useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Pressable } from "react-native";
import BottomNavBar from "../../../../components/BottomNavBar";
import { db } from "../../../../firebaseConfig";

export default function TripTabsLayout() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [tripName, setTripName] = useState("");

  useEffect(() => {
    const loadTripName = async () => {
      if (!id || typeof id !== "string") return;
      try {
        const tripRef = doc(db, "trips", id);
        const tripSnap = await getDoc(tripRef);
        if (tripSnap.exists()) {
          setTripName(tripSnap.data().name || "");
        }
      } catch (err) {
        console.error("Failed to load trip name:", err);
      }
    };
    loadTripName();
  }, [id]);

  return (
    <Tabs
      initialRouteName="dashboard"
      tabBar={(props) => <BottomNavBar {...props} />}
      screenOptions={{
        headerTitle: tripName,
        headerLeft: () => (
          <Pressable
            onPress={() => router.dismiss()}
            accessibilityLabel="Back to trips"
            accessibilityRole="button"
            style={{ paddingLeft: 8 }}
          >
            <Ionicons name="chevron-back" size={28} color="#007AFF" />
          </Pressable>
        ),
        headerRight: () => (
          <Ionicons
            name="information-circle-outline"
            size={32}
            color="#007AFF"
            onPress={() => router.push(`/trips/${id}/details`)}
            accessibilityLabel="Trip details"
            accessibilityHint="Navigate to trip details page"
            accessibilityRole="button"
            style={{ paddingLeft: 2, marginRight: 4 }}
          />
        ),
      }}
    >
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="finances" />
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="checklists" />
    </Tabs>
  );
}
