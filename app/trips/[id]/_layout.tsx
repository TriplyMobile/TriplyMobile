import { Stack } from "expo-router";

export default function TripLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="details"
        options={{ title: "Trip Details", headerBackTitle: "Back" }}
      />
    </Stack>
  );
}
