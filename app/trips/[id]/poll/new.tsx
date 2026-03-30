import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "@/firebaseConfig";
import { Colors } from "@/lib/types";

const CATEGORIES = [
  { key: "dates", label: "Dates" },
  { key: "destination", label: "Destination" },
  { key: "transport", label: "Transport" },
  { key: "accommodation", label: "Accommodation" },
  { key: "activity", label: "Activity" },
] as const;

interface OptionDraft {
  label: string;
  description: string;
  price: string;
}

export default function NewPollScreen() {
  const { id: tripId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("activity");
  const [allowMultiple, setAllowMultiple] = useState(true);
  const [options, setOptions] = useState<OptionDraft[]>([
    { label: "", description: "", price: "" },
    { label: "", description: "", price: "" },
  ]);
  const [creating, setCreating] = useState(false);

  const updateOption = (index: number, field: keyof OptionDraft, value: string) => {
    const updated = [...options];
    updated[index] = { ...updated[index], [field]: value };
    setOptions(updated);
  };

  const addOption = () => {
    setOptions([...options, { label: "", description: "", price: "" }]);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== index));
  };

  const canCreate =
    title.trim() &&
    options.filter((o) => o.label.trim()).length >= 2;

  const handleCreate = async () => {
    if (!canCreate) return;
    const user = auth.currentUser;
    if (!user) return;

    setCreating(true);
    try {
      // Create poll
      const pollRef = await addDoc(
        collection(db, "trips", tripId, "polls"),
        {
          title: title.trim(),
          category,
          allowMultipleVotes: allowMultiple,
          status: "open",
          createdBy: user.uid,
          createdAt: serverTimestamp(),
        }
      );

      // Create options
      const validOptions = options.filter((o) => o.label.trim());
      for (const opt of validOptions) {
        await addDoc(
          collection(db, "trips", tripId, "polls", pollRef.id, "options"),
          {
            label: opt.label.trim(),
            description: opt.description.trim() || null,
            price: opt.price.trim() || null,
            url: null,
            createdBy: user.uid,
            createdAt: serverTimestamp(),
          }
        );
      }

      router.back();
    } catch (err) {
      console.error("Failed to create poll:", err);
      Alert.alert("Error", "Failed to create poll");
    } finally {
      setCreating(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title */}
        <Text style={styles.label}>Poll title</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Which hotel?"
          value={title}
          onChangeText={setTitle}
          autoFocus
        />

        {/* Category */}
        <Text style={styles.label}>Category</Text>
        <View style={styles.categoryRow}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={[
                styles.categoryChip,
                category === cat.key && styles.categoryChipActive,
              ]}
              onPress={() => setCategory(cat.key)}
            >
              <Text
                style={[
                  styles.categoryText,
                  category === cat.key && styles.categoryTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Multiple choice toggle */}
        <TouchableOpacity
          style={styles.toggleRow}
          onPress={() => setAllowMultiple(!allowMultiple)}
        >
          <Text style={styles.toggleLabel}>Allow multiple choices</Text>
          <View
            style={[
              styles.toggle,
              allowMultiple && styles.toggleActive,
            ]}
          >
            <View
              style={[
                styles.toggleThumb,
                allowMultiple && styles.toggleThumbActive,
              ]}
            />
          </View>
        </TouchableOpacity>

        {/* Options */}
        <Text style={styles.label}>Options (min 2)</Text>
        {options.map((opt, index) => (
          <View key={index} style={styles.optionCard}>
            <View style={styles.optionHeader}>
              <Text style={styles.optionNumber}>Option {index + 1}</Text>
              {options.length > 2 && (
                <TouchableOpacity onPress={() => removeOption(index)}>
                  <Ionicons name="close-circle" size={20} color={Colors.textTertiary} />
                </TouchableOpacity>
              )}
            </View>
            <TextInput
              style={styles.optionInput}
              placeholder="Option name *"
              value={opt.label}
              onChangeText={(v) => updateOption(index, "label", v)}
            />
            <TextInput
              style={styles.optionInput}
              placeholder="Description (optional)"
              value={opt.description}
              onChangeText={(v) => updateOption(index, "description", v)}
            />
            <TextInput
              style={styles.optionInput}
              placeholder="Price (optional)"
              value={opt.price}
              onChangeText={(v) => updateOption(index, "price", v)}
            />
          </View>
        ))}

        <TouchableOpacity style={styles.addOption} onPress={addOption}>
          <Ionicons name="add" size={18} color={Colors.primary} />
          <Text style={styles.addOptionText}>Add option</Text>
        </TouchableOpacity>

        {/* Create button */}
        <TouchableOpacity
          style={[styles.createButton, !canCreate && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={!canCreate || creating}
        >
          {creating ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.createButtonText}>Create Poll</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  label: {
    fontSize: 11,
    fontWeight: "500",
    color: Colors.textTertiary,
    textTransform: "uppercase",
    marginBottom: 6,
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    backgroundColor: Colors.surface,
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryChipActive: {
    backgroundColor: Colors.blueBg,
    borderColor: Colors.primary,
  },
  categoryText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  categoryTextActive: {
    color: Colors.primary,
    fontWeight: "500",
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    paddingVertical: 4,
  },
  toggleLabel: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.border,
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: Colors.primary,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
  },
  toggleThumbActive: {
    alignSelf: "flex-end",
  },
  optionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  optionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  optionNumber: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.textSecondary,
  },
  optionInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    marginBottom: 6,
    backgroundColor: Colors.background,
  },
  addOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    gap: 4,
    marginTop: 4,
  },
  addOptionText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500",
  },
  createButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
