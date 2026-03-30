import { useLocalSearchParams, useRouter } from "expo-router";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Badge from "@/components/Badge";
import { db } from "@/firebaseConfig";
import { Colors, PlanningItem } from "@/lib/types";

const TIME_ORDER = { morning: 0, afternoon: 1, evening: 2, all_day: 3 };
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function PlanningScreen() {
  const { id: tripId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [items, setItems] = useState<PlanningItem[]>([]);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tripId) return;

    // Load trip dates
    const loadTrip = async () => {
      const tripSnap = await getDoc(doc(db, "trips", tripId));
      if (tripSnap.exists()) {
        const data = tripSnap.data();
        setStartDate(data.startDate || null);
        setEndDate(data.endDate || null);
      }
    };
    loadTrip();

    // Realtime planning items subscription
    const itemsQuery = query(
      collection(db, "trips", tripId, "planningItems"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(itemsQuery, (snapshot) => {
      const list: PlanningItem[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<PlanningItem, "id">),
      }));
      setItems(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [tripId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Group items by day
  const days = getDays(startDate, endDate);
  const itemsByDate = new Map<string, PlanningItem[]>();
  const unassigned: PlanningItem[] = [];

  for (const item of items) {
    if (item.date) {
      const existing = itemsByDate.get(item.date) || [];
      existing.push(item);
      itemsByDate.set(item.date, existing);
    } else {
      unassigned.push(item);
    }
  }

  // Sort items within each day
  for (const [date, dayItems] of itemsByDate) {
    dayItems.sort((a, b) => {
      const aOrder = a.timeOfDay ? TIME_ORDER[a.timeOfDay] : 4;
      const bOrder = b.timeOfDay ? TIME_ORDER[b.timeOfDay] : 4;
      return aOrder - bOrder;
    });
  }

  if (items.length === 0 && days.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No planning items yet</Text>
        <Text style={styles.emptySubtext}>
          Close polls to add items to the planning
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      {days.map((day, index) => {
        const dayItems = itemsByDate.get(day.date) || [];
        const isFirst = index === 0;

        return (
          <View key={day.date} style={styles.daySection}>
            <View style={styles.dayHeader}>
              <View
                style={[
                  styles.dayBadge,
                  isFirst ? styles.dayBadgeActive : styles.dayBadgeInactive,
                ]}
              >
                <Text
                  style={[
                    styles.dayNumber,
                    isFirst
                      ? styles.dayNumberActive
                      : styles.dayNumberInactive,
                  ]}
                >
                  {index + 1}
                </Text>
              </View>
              {index < days.length - 1 && <View style={styles.timeline} />}
              <View style={styles.dayInfo}>
                <Text style={styles.dayLabel}>
                  {DAY_NAMES[new Date(day.date + "T00:00:00").getDay()]}
                  {isFirst ? " · Arrival" : ""}
                </Text>
              </View>
            </View>

            {dayItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.planningCard}
                onPress={() => {
                  if (item.pollId && item.status === "confirmed") {
                    router.push(`/trips/${tripId}/poll/${item.pollId}`);
                  }
                }}
                activeOpacity={0.7}
              >
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  {item.description && (
                    <Text style={styles.cardDescription}>
                      {item.description}
                    </Text>
                  )}
                  {item.timeOfDay && item.timeOfDay !== "all_day" && (
                    <Text style={styles.cardTime}>
                      {item.timeOfDay.charAt(0).toUpperCase() +
                        item.timeOfDay.slice(1)}
                    </Text>
                  )}
                </View>
                <View style={styles.cardBadge}>
                  {item.status === "booked" && (
                    <Badge label="Booked" variant="success" />
                  )}
                  {item.status === "confirmed" && item.pollId && (
                    <Badge label="Vote" variant="warning" />
                  )}
                </View>
              </TouchableOpacity>
            ))}

            {dayItems.length === 0 && (
              <View style={styles.emptyDay}>
                <Text style={styles.emptyDayText}>No activities planned</Text>
              </View>
            )}
          </View>
        );
      })}

      {unassigned.length > 0 && (
        <View style={styles.daySection}>
          <Text style={[styles.dayLabel, { marginBottom: 8, marginLeft: 44 }]}>
            Unscheduled
          </Text>
          {unassigned.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.planningCard}
              onPress={() => {
                if (item.pollId) {
                  router.push(`/trips/${tripId}/poll/${item.pollId}`);
                }
              }}
              activeOpacity={0.7}
            >
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                {item.description && (
                  <Text style={styles.cardDescription}>
                    {item.description}
                  </Text>
                )}
              </View>
              <View style={styles.cardBadge}>
                {item.status === "booked" && (
                  <Badge label="Booked" variant="success" />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function getDays(
  start: string | null,
  end: string | null
): { date: string }[] {
  if (!start || !end) return [];
  const days: { date: string }[] = [];
  const current = new Date(start + "T00:00:00");
  const last = new Date(end + "T00:00:00");

  while (current <= last) {
    days.push({
      date: current.toISOString().split("T")[0],
    });
    current.setDate(current.getDate() + 1);
  }
  return days;
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
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.textSecondary,
  },
  emptySubtext: {
    fontSize: 13,
    color: Colors.textTertiary,
    marginTop: 4,
    textAlign: "center",
  },
  daySection: {
    marginBottom: 16,
  },
  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  dayBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  dayBadgeActive: {
    backgroundColor: Colors.primary,
  },
  dayBadgeInactive: {
    backgroundColor: Colors.blueBg,
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: "600",
  },
  dayNumberActive: {
    color: "#FFFFFF",
  },
  dayNumberInactive: {
    color: Colors.primary,
  },
  timeline: {
    position: "absolute",
    left: 15,
    top: 36,
    bottom: -16,
    width: 2,
    backgroundColor: Colors.blueBg,
  },
  dayInfo: {
    marginLeft: 12,
  },
  dayLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  planningCard: {
    marginLeft: 44,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textPrimary,
  },
  cardDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  cardTime: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  cardBadge: {
    marginLeft: 8,
  },
  emptyDay: {
    marginLeft: 44,
    paddingVertical: 8,
  },
  emptyDayText: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontStyle: "italic",
  },
});
