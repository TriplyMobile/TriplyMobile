import { Stack } from "expo-router";

export default function TripLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="details"
        options={{ title: "Trip Details", headerBackTitle: "Back" }}
      />
      <Stack.Screen
        name="info"
        options={{
          title: "Trip Info",
          presentation: "modal",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="poll/new"
        options={{
          title: "New Poll",
          presentation: "modal",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="poll/[pollId]"
        options={{
          title: "Poll",
          presentation: "modal",
          headerBackTitle: "Back",
        }}
      />
    </Stack>
  );
}
