import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="trips" options={{ title: "My Trips", headerBackVisible: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
      <Stack.Screen name="trips/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ title: "Profile", headerBackTitle: "Trips" }} />
      <Stack.Screen name="settings" options={{ title: "Settings", headerBackTitle: "Trips" }} />
    </Stack>
  );
}
