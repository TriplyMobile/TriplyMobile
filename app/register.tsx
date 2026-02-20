import { createUserWithEmailAndPassword } from "firebase/auth";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { auth } from "@/firebaseConfig";

const { height } = Dimensions.get("window");

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password || !repeatPassword) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    if (password !== repeatPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.replace("/trips");
    } catch (error: any) {
      const code = error.code;
      let message = "An error occurred. Please try again.";
      if (code === "auth/email-already-in-use") {
        message = "An account with this email already exists.";
      } else if (code === "auth/invalid-email") {
        message = "Please enter a valid email address.";
      } else if (code === "auth/weak-password") {
        message = "Password should be at least 6 characters.";
      }
      Alert.alert("Sign Up Failed", message);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={["#4A90E2", "#7B68EE", "#FF6B6B"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Decorative circles */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Back button */}
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.logoText}>✈️</Text>
              <Text style={styles.title}>Start your journey</Text>
              <Text style={styles.subtitle}>Sign up to start planning your next trip</Text>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="rgba(74, 144, 226, 0.5)"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor="rgba(74, 144, 226, 0.5)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Repeat Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Repeat your password"
                  placeholderTextColor="rgba(74, 144, 226, 0.5)"
                  value={repeatPassword}
                  onChangeText={setRepeatPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                activeOpacity={0.8}
                disabled={loading}
              >
                <Text style={styles.submitButtonText}>
                  {loading ? "Signing Up..." : "Sign Up"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  decorativeCircle1: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    top: -50,
    right: -50,
  },
  decorativeCircle2: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    bottom: 100,
    left: -30,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 40,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  header: {
    alignItems: "center",
    marginBottom: 50,
  },
  logoText: {
    fontSize: 60,
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
    letterSpacing: 1,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "300",
  },
  formContainer: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#4A90E2",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#4A90E2",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});
