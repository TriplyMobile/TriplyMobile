import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Avatar from "@/components/Avatar";
import Badge from "@/components/Badge";
import { auth, db } from "@/firebaseConfig";
import { Colors, Poll, PollOption, Vote } from "@/lib/types";

interface PollWithOptions extends Poll {
  options: (PollOption & { votes: Vote[] })[];
}

export default function PollsScreen() {
  const { id: tripId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [polls, setPolls] = useState<PollWithOptions[]>([]);
  const [participantCount, setParticipantCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userNames, setUserNames] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!tripId) return;

    // Load participant count and names
    const loadParticipants = async () => {
      const snap = await getDocs(
        collection(db, "trips", tripId, "participants")
      );
      setParticipantCount(snap.size);

      const names: Record<string, string> = {};
      for (const d of snap.docs) {
        const userId = d.data().userId;
        try {
          const userSnap = await getDoc(doc(db, "users", userId));
          if (userSnap.exists()) {
            const data = userSnap.data();
            names[userId] = data.displayName || data.email || "?";
          }
        } catch {}
      }
      setUserNames(names);
    };
    loadParticipants();

    // Realtime polls subscription (no orderBy to avoid index requirement)
    const pollsRef = collection(db, "trips", tripId, "polls");

    const unsubscribe = onSnapshot(pollsRef, async (snapshot) => {
      const pollList: PollWithOptions[] = [];

      for (const pollDoc of snapshot.docs) {
        const pollData = pollDoc.data();
        const optionsSnap = await getDocs(
          collection(db, "trips", tripId, "polls", pollDoc.id, "options")
        );

        const options: (PollOption & { votes: Vote[] })[] = [];
        for (const optDoc of optionsSnap.docs) {
          const votesSnap = await getDocs(
            collection(
              db,
              "trips",
              tripId,
              "polls",
              pollDoc.id,
              "options",
              optDoc.id,
              "votes"
            )
          );
          options.push({
            id: optDoc.id,
            ...(optDoc.data() as Omit<PollOption, "id">),
            votes: votesSnap.docs.map((v) => ({
              id: v.id,
              ...(v.data() as Omit<Vote, "id">),
            })),
          });
        }

        pollList.push({
          id: pollDoc.id,
          ...(pollData as Omit<Poll, "id">),
          options,
        });
      }

      setPolls(pollList);
      setLoading(false);
    }, (err) => {
      console.error("Failed to load polls:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [tripId]);

  const getTotalVoters = (poll: PollWithOptions): number => {
    const voterIds = new Set<string>();
    poll.options.forEach((opt) => opt.votes.forEach((v) => voterIds.add(v.userId)));
    return voterIds.size;
  };

  const getMaxVotes = (poll: PollWithOptions): number => {
    return Math.max(0, ...poll.options.map((o) => o.votes.length));
  };

  const renderPoll = ({ item: poll }: { item: PollWithOptions }) => {
    const totalVoters = getTotalVoters(poll);
    const maxVotes = getMaxVotes(poll);
    const isClosed = poll.status === "closed";

    return (
      <TouchableOpacity
        style={[styles.pollCard, isClosed && styles.closedPoll]}
        onPress={() =>
          router.push(`/trips/${tripId}/poll/${poll.id}`)
        }
        activeOpacity={0.7}
      >
        <View style={styles.pollHeader}>
          <Text style={styles.pollTitle}>{poll.title}</Text>
          <View style={styles.pollBadgeRow}>
            {isClosed ? (
              <Badge label="Done" variant="success" />
            ) : (
              <Badge
                label={`${totalVoters}/${participantCount}`}
                variant={
                  totalVoters === participantCount ? "success" : "warning"
                }
              />
            )}
          </View>
        </View>

        {poll.options.map((option) => {
          const isLeading =
            !isClosed &&
            option.votes.length === maxVotes &&
            maxVotes > 0;
          return (
            <View
              key={option.id}
              style={[
                styles.optionRow,
                isLeading && styles.optionLeading,
              ]}
            >
              <View style={styles.optionInfo}>
                <Text style={styles.optionLabel}>{option.label}</Text>
                {option.price && (
                  <Text style={styles.optionPrice}>{option.price}</Text>
                )}
              </View>
              <View style={styles.optionVoters}>
                {option.votes.slice(0, 4).map((vote) => (
                  <View key={vote.id} style={{ marginLeft: -4 }}>
                    <Avatar
                      name={userNames[vote.userId] || "?"}
                      size={22}
                    />
                  </View>
                ))}
                {option.votes.length > 4 && (
                  <Text style={styles.moreVoters}>
                    +{option.votes.length - 4}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </TouchableOpacity>
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
    <View style={styles.container}>
      <FlatList
        data={polls}
        keyExtractor={(item) => item.id}
        renderItem={renderPoll}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No polls yet</Text>
            <Text style={styles.emptySubtext}>
              Create a poll to start deciding together
            </Text>
          </View>
        }
      />
      <TouchableOpacity
        style={styles.createPollButton}
        onPress={() => router.push(`/trips/${tripId}/poll/new`)}
      >
        <Ionicons name="add" size={20} color={Colors.primary} />
        <Text style={styles.createPollText}>Create a poll</Text>
      </TouchableOpacity>
    </View>
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
    paddingTop: 60,
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
  },
  pollCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  closedPoll: {
    opacity: 0.5,
  },
  pollHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  pollTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.textPrimary,
    flex: 1,
  },
  pollBadgeRow: {
    marginLeft: 8,
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  optionLeading: {
    backgroundColor: Colors.blueBg,
  },
  optionInfo: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 13,
    color: Colors.textPrimary,
  },
  optionPrice: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  optionVoters: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  moreVoters: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  createPollButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: Colors.primary,
    backgroundColor: Colors.background,
    gap: 6,
  },
  createPollText: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.primary,
  },
});
