import { useNavigation } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { COUNTRIES } from "../../constants/countries";
import { CURRENCIES } from "../../constants/currencies";
import { db } from "../../firebaseConfig";
import { Trip, TripFormData } from "../../types/trip";

export default function TripDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<TripFormData>({ name: "" });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);

  useEffect(() => {
    const loadTrip = async () => {
      if (!id || typeof id !== "string") {
        setError("Invalid trip ID");
        setLoading(false);
        return;
      }

      try {
        const tripRef = doc(db, "trips", id);
        const tripSnap = await getDoc(tripRef);

        if (!tripSnap.exists()) {
          setError("Trip not found");
          setLoading(false);
          return;
        }

        const tripData = {
          id: tripSnap.id,
          ...tripSnap.data(),
        } as Trip;

        setTrip(tripData);
        // Initialize form data
        setFormData({
          name: tripData.name || "",
          startDate: tripData.startDate || "",
          endDate: tripData.endDate || "",
          countryDestination: tripData.countryDestination || "",
          maxBudget: tripData.maxBudget?.toString() || "",
          currency: tripData.currency || "",
          description: tripData.description || "",
        });
      } catch (err) {
        console.error("Failed to load trip:", err);
        setError("Unable to load trip. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    loadTrip();
  }, [id]);

  // Unsaved changes detection
  const hasUnsavedChanges = (): boolean => {
    if (!trip || !isEditing) return false;
    return (
      formData.name !== (trip.name || "") ||
      formData.startDate !== (trip.startDate || "") ||
      formData.endDate !== (trip.endDate || "") ||
      formData.countryDestination !== (trip.countryDestination || "") ||
      formData.maxBudget !== (trip.maxBudget?.toString() || "") ||
      formData.currency !== (trip.currency || "") ||
      formData.description !== (trip.description || "")
    );
  };

  // Navigation guard for unsaved changes
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      if (!hasUnsavedChanges()) {
        return;
      }

      e.preventDefault();

      Alert.alert(
        "Discard changes?",
        "You have unsaved changes. Are you sure you want to leave?",
        [
          { text: "Don't leave", style: "cancel", onPress: () => {} },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => navigation.dispatch(e.data.action),
          },
        ]
      );
    });

    return unsubscribe;
  }, [navigation, isEditing, formData, trip]);

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "Not set";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const formatBudget = (budget?: number, currency?: string): string => {
    if (budget === undefined || budget === null) return "Not set";
    const currencySymbol = currency || "USD";
    return `${currencySymbol} ${budget.toLocaleString()}`;
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (trip) {
      setFormData({
        name: trip.name || "",
        startDate: trip.startDate || "",
        endDate: trip.endDate || "",
        countryDestination: trip.countryDestination || "",
        maxBudget: trip.maxBudget?.toString() || "",
        currency: trip.currency || "",
        description: trip.description || "",
      });
    }
    setIsEditing(false);
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) {
      return "Trip name is required";
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) {
        return "End date must be after start date";
      }
    }

    if (formData.maxBudget) {
      const budget = parseFloat(formData.maxBudget);
      if (isNaN(budget) || budget < 0) {
        return "Budget must be a valid non-negative number";
      }
    }

    return null;
  };

  const handleSave = async () => {
    const validationError = validateForm();
    if (validationError) {
      Alert.alert("Validation Error", validationError);
      return;
    }

    setSaving(true);
    try {
      if (!id || typeof id !== "string") {
        throw new Error("Invalid trip ID");
      }

      const tripRef = doc(db, "trips", id);
      const updateData: Partial<Trip> = {
        name: formData.name.trim(),
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        countryDestination: formData.countryDestination || undefined,
        currency: formData.currency || undefined,
        description: formData.description || undefined,
      };

      if (formData.maxBudget) {
        const budget = parseFloat(formData.maxBudget);
        if (!isNaN(budget)) {
          updateData.maxBudget = budget;
        }
      } else {
        updateData.maxBudget = undefined;
      }

      await updateDoc(tripRef, updateData);

      // Reload trip data
      const tripSnap = await getDoc(tripRef);
      if (tripSnap.exists()) {
        const updatedTrip = {
          id: tripSnap.id,
          ...tripSnap.data(),
        } as Trip;
        setTrip(updatedTrip);
        setFormData({
          name: updatedTrip.name || "",
          startDate: updatedTrip.startDate || "",
          endDate: updatedTrip.endDate || "",
          countryDestination: updatedTrip.countryDestination || "",
          maxBudget: updatedTrip.maxBudget?.toString() || "",
          currency: updatedTrip.currency || "",
          description: updatedTrip.description || "",
        });
      }

      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save trip:", err);
      Alert.alert("Error", "Unable to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Trip",
      "Are you sure you want to delete this trip? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            try {
              if (!id || typeof id !== "string") {
                throw new Error("Invalid trip ID");
              }
              const { deleteDoc } = await import("firebase/firestore");
              const tripRef = doc(db, "trips", id);
              await deleteDoc(tripRef);
              router.back();
            } catch (err) {
              console.error("Failed to delete trip:", err);
              Alert.alert("Error", "Unable to delete trip. Please try again.");
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Trip not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.label}>Trip Name *</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Enter trip name"
              editable={!saving}
              accessibilityLabel="Trip name input"
              accessibilityHint="Enter the name of your trip. This field is required."
            />
          ) : (
            <Text style={styles.value}>{trip.name || "Not set"}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Start Date</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={formData.startDate}
              onChangeText={(text) =>
                setFormData({ ...formData, startDate: text })
              }
              placeholder="YYYY-MM-DD"
              editable={!saving}
            />
          ) : (
            <Text style={styles.value}>{formatDate(trip.startDate)}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>End Date</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={formData.endDate}
              onChangeText={(text) =>
                setFormData({ ...formData, endDate: text })
              }
              placeholder="YYYY-MM-DD"
              editable={!saving}
            />
          ) : (
            <Text style={styles.value}>{formatDate(trip.endDate)}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Country Destination</Text>
          {isEditing ? (
            <>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setCountryModalVisible(true)}
                disabled={saving}
                accessibilityLabel="Country destination selector"
                accessibilityHint="Tap to select the country destination for your trip"
                accessibilityRole="button"
              >
                <Text
                  style={
                    formData.countryDestination
                      ? styles.inputText
                      : styles.placeholderText
                  }
                >
                  {formData.countryDestination || "Select country"}
                </Text>
              </TouchableOpacity>
              <Modal
                visible={countryModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setCountryModalVisible(false)}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Select Country</Text>
                    <FlatList
                      data={COUNTRIES}
                      keyExtractor={(item) => item.code}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={styles.modalItem}
                          onPress={() => {
                            setFormData({
                              ...formData,
                              countryDestination: item.name,
                            });
                            setCountryModalVisible(false);
                          }}
                        >
                          <Text style={styles.modalItemText}>{item.name}</Text>
                        </TouchableOpacity>
                      )}
                    />
                    <TouchableOpacity
                      style={styles.modalButton}
                      onPress={() => setCountryModalVisible(false)}
                    >
                      <Text style={styles.modalButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            </>
          ) : (
            <Text style={styles.value}>
              {trip.countryDestination || "Not set"}
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Maximum Budget</Text>
          {isEditing ? (
            <View style={styles.budgetRow}>
              <TextInput
                style={[styles.input, styles.budgetInput]}
                value={formData.maxBudget}
                onChangeText={(text) =>
                  setFormData({ ...formData, maxBudget: text })
                }
                placeholder="0"
                keyboardType="numeric"
                editable={!saving}
              />
              <TouchableOpacity
                style={styles.currencyButton}
                onPress={() => setCurrencyModalVisible(true)}
                disabled={saving}
                accessibilityLabel="Currency selector"
                accessibilityHint="Tap to select the currency for your trip budget"
                accessibilityRole="button"
              >
                <Text style={styles.currencyButtonText}>
                  {formData.currency || "USD"}
                </Text>
              </TouchableOpacity>
              <Modal
                visible={currencyModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setCurrencyModalVisible(false)}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Select Currency</Text>
                    <FlatList
                      data={CURRENCIES}
                      keyExtractor={(item) => item.code}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={styles.modalItem}
                          onPress={() => {
                            setFormData({ ...formData, currency: item.code });
                            setCurrencyModalVisible(false);
                          }}
                        >
                          <Text style={styles.modalItemText}>
                            {item.code} - {item.name} ({item.symbol})
                          </Text>
                        </TouchableOpacity>
                      )}
                    />
                    <TouchableOpacity
                      style={styles.modalButton}
                      onPress={() => setCurrencyModalVisible(false)}
                    >
                      <Text style={styles.modalButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            </View>
          ) : (
            <Text style={styles.value}>
              {formatBudget(trip.maxBudget, trip.currency)}
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description</Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) =>
                setFormData({ ...formData, description: text })
              }
              placeholder="Enter trip description"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={!saving}
            />
          ) : (
            <Text style={styles.value}>
              {trip.description || "Not set"}
            </Text>
          )}
        </View>
      </ScrollView>

      {!isEditing && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.button, styles.editButton]}
            onPress={handleEdit}
            disabled={deleting}
            accessibilityLabel="Edit trip"
            accessibilityHint="Tap to edit trip details"
            accessibilityRole="button"
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={handleDelete}
            disabled={deleting}
            accessibilityLabel="Delete trip"
            accessibilityHint="Tap to delete this trip. This action cannot be undone."
            accessibilityRole="button"
          >
            {deleting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.deleteButtonText}>Delete</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {isEditing && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleCancel}
            disabled={saving}
            accessibilityLabel="Cancel editing"
            accessibilityHint="Tap to cancel editing and discard changes"
            accessibilityRole="button"
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSave}
            disabled={saving}
            accessibilityLabel="Save trip changes"
            accessibilityHint="Tap to save your trip changes"
            accessibilityRole="button"
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
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
    backgroundColor: "#FFFFFF",
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 18,
    color: "#333",
    lineHeight: 24,
  },
  input: {
    fontSize: 18,
    color: "#333",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#F9F9F9",
  },
  inputText: {
    fontSize: 18,
    color: "#333",
  },
  placeholderText: {
    fontSize: 18,
    color: "#999",
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  budgetRow: {
    flexDirection: "row",
    gap: 8,
  },
  budgetInput: {
    flex: 1,
  },
  currencyButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#F5F7FB",
    borderRadius: 8,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#DDD",
  },
  currencyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  actionButtons: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  editButton: {
    backgroundColor: "#4A90E2",
  },
  editButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: "#E53935",
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: "#F5F7FB",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#4A90E2",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    marginTop: 20,
    color: "#E53935",
    fontSize: 16,
    textAlign: "center",
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
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  modalItemText: {
    fontSize: 16,
    color: "#333",
  },
  modalButton: {
    marginTop: 16,
    padding: 14,
    backgroundColor: "#F5F7FB",
    borderRadius: 8,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
});
