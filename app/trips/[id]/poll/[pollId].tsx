import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Avatar from "@/components/Avatar";
import { auth, db } from "@/firebaseConfig";
import { Colors, Poll, PollOption, Vote, PlanningItem } from "@/lib/types";

type VoteState = "voting" | "results";

interface OptionWithVotes extends PollOption {
  votes: Vote[];
}

export default function PollVoteScreen() {
  const { id: tripId, pollId } = useLocalSearchParams<{
    id: string;
    pollId: string;
  }>();
  const router = useRouter();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [options, setOptions] = useState<OptionWithVotes[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [voteState, setVoteState] = useState<VoteState>("voting");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [isOrganizer, setIsOrganizer] = useState(false);

  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (!tripId || !pollId || !userId) return;

    // Load participants
    const loadMeta = async () => {
      const participantsSnap = await getDocs(
        collection(db, "trips", tripId, "participants")
      );
      setParticipantCount(participantsSnap.size);

      const orgDoc = participantsSnap.docs.find((d) => d.id === userId);
      setIsOrganizer(orgDoc?.data().role === "organizer");

      const names: Record<string, string> = {};
      for (const pDoc of participantsSnap.docs) {
        const uid = pDoc.data().userId;
        try {
          const userSnap = await getDoc(doc(db, "users", uid));
          if (userSnap.exists()) {
            names[uid] =
              userSnap.data().displayName || userSnap.data().email || "?";
          }
        } catch {}
      }
      setUserNames(names);
    };
    loadMeta();

    // Realtime poll subscription
    const pollUnsub = onSnapshot(
      doc(db, "trips", tripId, "polls", pollId),
      (snap) => {
        if (snap.exists()) {
          setPoll({ id: snap.id, ...(snap.data() as Omit<Poll, "id">) });
        }
      }
    );

    // Realtime options + votes subscription
    const optionsUnsub = onSnapshot(
      collection(db, "trips", tripId, "polls", pollId, "options"),
      async (snapshot) => {
        const opts: OptionWithVotes[] = [];
        let userHasVoted = false;

        for (const optDoc of snapshot.docs) {
          const votesSnap = await getDocs(
            collection(
              db,
              "trips",
              tripId,
              "polls",
              pollId,
              "options",
              optDoc.id,
              "votes"
            )
          );
          const votes = votesSnap.docs.map((v) => ({
            id: v.id,
            ...(v.data() as Omit<Vote, "id">),
          }));

          if (votes.some((v) => v.userId === userId)) {
            userHasVoted = true;
          }

          opts.push({
            id: optDoc.id,
            ...(optDoc.data() as Omit<PollOption, "id">),
            votes,
          });
        }

        setOptions(opts);
        if (userHasVoted) {
          setVoteState("results");
        }
        setLoading(false);
      }
    );

    return () => {
      pollUnsub();
      optionsUnsub();
    };
  }, [tripId, pollId, userId]);

  // Switch to results if poll is closed
  useEffect(() => {
    if (poll?.status === "closed") {
      setVoteState("results");
    }
  }, [poll?.status]);

  const toggleSelect = (optionId: string) => {
    if (voteState === "results") return;

    const next = new Set(selected);
    if (next.has(optionId)) {
      next.delete(optionId);
    } else {
      if (!poll?.allowMultipleVotes) {
        next.clear();
      }
      next.add(optionId);
    }
    setSelected(next);
  };

  const handleVote = async () => {
    if (!userId || selected.size === 0) return;
    setSubmitting(true);

    try {
      for (const optionId of selected) {
        await addDoc(
          collection(
            db,
            "trips",
            tripId,
            "polls",
            pollId,
            "options",
            optionId,
            "votes"
          ),
          {
            userId,
            createdAt: serverTimestamp(),
          }
        );
      }
      setVoteState("results");
    } catch (err) {
      console.error("Failed to vote:", err);
      Alert.alert("Error", "Failed to submit vote");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmWinner = async (option: OptionWithVotes) => {
    Alert.alert(
      "Confirm Winner",
      `Close this poll and add "${option.label}" to the planning?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              // Close the poll
              await updateDoc(
                doc(db, "trips", tripId, "polls", pollId),
                { status: "closed" }
              );

              // Create planning item from winning option
              await addDoc(
                collection(db, "trips", tripId, "planningItems"),
                {
                  pollId,
                  title: option.label,
                  description: option.description || null,
                  category: poll?.category === "dates" ? "activity" : (poll?.category || "activity"),
                  date: null,
                  timeOfDay: null,
                  status: "confirmed",
                  bookingReference: null,
                  bookingUrl: null,
                  price: option.price || null,
                  createdAt: serverTimestamp(),
                }
              );

              router.back();
            } catch (err) {
              console.error("Failed to confirm winner:", err);
              Alert.alert("Error", "Failed to close poll");
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

  if (!poll) {
    return (
      <View style={styles.centered}>
        <Text>Poll not found</Text>
      </View>
    );
  }

  const totalVoters = new Set(
    options.flatMap((o) => o.votes.map((v) => v.userId))
  ).size;
  const maxVotes = Math.max(0, ...options.map((o) => o.votes.length));
  const totalVotesCast = options.reduce((sum, o) => sum + o.votes.length, 0);
  const isClosed = poll.status === "closed";

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        <Text style={styles.title}>{poll.title}</Text>

        {voteState === "voting" && !isClosed && (
          <Text style={styles.subtitle}>
            {selected.size > 0
              ? `${selected.size} option${selected.size > 1 ? "s" : ""} selected`
              : poll.allowMultipleVotes
                ? "Tap to vote · multiple choice"
                : "Tap to vote · single choice"}
          </Text>
        )}

        {voteState === "results" && (
          <Text style={styles.subtitle}>
            {totalVoters}/{participantCount} voted
          </Text>
        )}

        {/* Options list */}
        {options.map((option) => {
          const isSelected = selected.has(option.id);
          const isWinner =
            voteState === "results" &&
            option.votes.length === maxVotes &&
            maxVotes > 0;
          const votePercent =
            totalVotesCast > 0
              ? (option.votes.length / totalVotesCast) * 100
              : 0;

          return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                voteState === "voting" && isSelected && styles.optionSelected,
                voteState === "results" && isWinner && styles.optionWinner,
              ]}
              onPress={() => {
                if (voteState === "voting" && !isClosed) {
                  toggleSelect(option.id);
                }
              }}
              activeOpacity={voteState === "results" ? 1 : 0.7}
            >
              <View style={styles.optionContent}>
                <View style={styles.optionTop}>
                  <Text style={styles.optionLabel}>{option.label}</Text>

                  {voteState === "voting" && !isClosed && (
                    <Ionicons
                      name={isSelected ? "checkbox" : "square-outline"}
                      size={22}
                      color={isSelected ? Colors.primary : Colors.textTertiary}
                    />
                  )}

                  {voteState === "results" && (
                    <Text style={styles.voteCount}>
                      {option.votes.length}
                    </Text>
                  )}
                </View>

                {option.description && (
                  <Text style={styles.optionDescription}>
                    {option.description}
                  </Text>
                )}
                {option.price && (
                  <Text style={styles.optionPrice}>{option.price}</Text>
                )}

                {/* Results: progress bar + avatars */}
                {voteState === "results" && (
                  <>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${votePercent}%`,
                            backgroundColor: isWinner
                              ? Colors.success
                              : Colors.primary,
                          },
                        ]}
                      />
                    </View>
                    <View style={styles.voterRow}>
                      {option.votes.map((vote) => (
                        <View key={vote.id} style={{ marginRight: -4 }}>
                          <Avatar
                            name={userNames[vote.userId] || "?"}
                            size={24}
                          />
                        </View>
                      ))}
                    </View>
                  </>
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Organizer: confirm winner button */}
        {voteState === "results" && isOrganizer && !isClosed && (
          <View style={{ marginTop: 20 }}>
            <Text style={styles.confirmHint}>
              As organizer, you can close this poll and add the winner to the
              planning.
            </Text>
            {options
              .filter((o) => o.votes.length === maxVotes && maxVotes > 0)
              .map((o) => (
                <TouchableOpacity
                  key={o.id}
                  style={styles.confirmButton}
                  onPress={() => handleConfirmWinner(o)}
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color="#FFFFFF"
                  />
                  <Text style={styles.confirmButtonText}>
                    Confirm "{o.label}"
                  </Text>
                </TouchableOpacity>
              ))}
          </View>
        )}
      </ScrollView>

      {/* Vote button (only in voting state) */}
      {voteState === "voting" && !isClosed && (
        <View style={styles.bottomAction}>
          <TouchableOpacity
            style={[
              styles.voteButton,
              selected.size === 0 && styles.voteButtonDisabled,
            ]}
            onPress={handleVote}
            disabled={selected.size === 0 || submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.voteButtonText}>Submit my vote</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
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
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  optionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  optionSelected: {
    backgroundColor: Colors.blueBg,
    borderColor: Colors.primary,
  },
  optionWinner: {
    backgroundColor: Colors.greenBg,
    borderColor: Colors.success,
  },
  optionContent: {},
  optionTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.textPrimary,
    flex: 1,
  },
  optionDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  optionPrice: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  voteCount: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    marginTop: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  voterRow: {
    flexDirection: "row",
    marginTop: 8,
  },
  confirmHint: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 10,
    textAlign: "center",
  },
  confirmButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.success,
    padding: 14,
    borderRadius: 12,
    gap: 6,
    marginBottom: 8,
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  bottomAction: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  voteButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  voteButtonDisabled: {
    opacity: 0.5,
  },
  voteButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
