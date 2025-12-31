import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="trips" options={{ title: "My Trips", headerBackTitle: "Back" }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="trips/[id]" options={{ title: "Trip Details", headerBackTitle: "Trips" }} />
    </Stack>
  );
}
