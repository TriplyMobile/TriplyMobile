import { Ionicons } from "@expo/vector-icons";
import { Tabs, useLocalSearchParams, useRouter } from "expo-router";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import BottomNavBar from "@/components/BottomNavBar";
import InfoButton from "@/components/InfoButton";
import { db } from "@/firebaseConfig";
import { Colors } from "@/lib/types";

export default function TripTabsLayout() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [tripName, setTripName] = useState("");
  const [participantCount, setParticipantCount] = useState(0);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  useEffect(() => {
    const loadTrip = async () => {
      if (!id || typeof id !== "string") return;
      try {
        const tripSnap = await getDoc(doc(db, "trips", id));
        if (tripSnap.exists()) {
          const data = tripSnap.data();
          setTripName(data.name || "");
          setStartDate(data.startDate || null);
          setEndDate(data.endDate || null);
        }
        const participantsSnap = await getDocs(
          collection(db, "trips", id, "participants")
        );
        setParticipantCount(Math.max(participantsSnap.size, 1));
      } catch (err) {
        console.error("Failed to load trip:", err);
      }
    };
    loadTrip();
  }, [id]);

  const subtitle = [
    `${participantCount} participant${participantCount !== 1 ? "s" : ""}`,
    startDate
      ? `${new Date(startDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}${endDate ? ` - ${new Date(endDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : ""}`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Tabs
      initialRouteName="planning"
      tabBar={(props) => <BottomNavBar {...props} />}
      screenOptions={{
        headerTitle: () => (
          <View style={{ alignItems: "center" }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: Colors.textPrimary,
              }}
              numberOfLines={1}
            >
              {tripName}
            </Text>
            {subtitle ? (
              <Text
                style={{
                  fontSize: 11,
                  color: Colors.textSecondary,
                  marginTop: 1,
                }}
              >
                {subtitle}
              </Text>
            ) : null}
          </View>
        ),
        headerLeft: () => (
          <Pressable
            onPress={() => router.dismiss()}
            accessibilityLabel="Back to trips"
            accessibilityRole="button"
            style={{ paddingLeft: 8 }}
          >
            <Ionicons name="chevron-back" size={28} color={Colors.primary} />
          </Pressable>
        ),
        headerRight: () => (
          <InfoButton onPress={() => router.push(`/trips/${id}/info`)} />
        ),
      }}
    >
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="planning" />
      <Tabs.Screen name="polls" />
    </Tabs>
  );
}
