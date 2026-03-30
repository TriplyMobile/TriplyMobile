import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Colors } from "@/lib/types";

const TAB_CONFIG: Record<
  string,
  { icon: keyof typeof Ionicons.glyphMap; label: string }
> = {
  planning: { icon: "calendar-outline", label: "Planning" },
  polls: { icon: "bar-chart-outline", label: "Polls" },
};

const TAB_ORDER = ["planning", "polls"];

export default function BottomNavBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const orderedRoutes = TAB_ORDER.map((name) =>
    state.routes.find((r) => r.name === name)
  ).filter(Boolean) as (typeof state.routes)[number][];

  return (
    <View style={styles.bar}>
      {orderedRoutes.map((route) => {
        const config = TAB_CONFIG[route.name];
        if (!config) return null;

        const routeIndex = state.routes.indexOf(route);
        const isFocused = state.index === routeIndex;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            accessibilityRole="tab"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={config.label}
            style={styles.tab}
          >
            <Ionicons
              name={config.icon}
              size={24}
              color={isFocused ? Colors.primary : Colors.textTertiary}
            />
            <Text
              style={[
                styles.label,
                { color: isFocused ? Colors.primary : Colors.textTertiary },
              ]}
            >
              {config.label}
            </Text>
            {isFocused && <View style={styles.activeIndicator} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#FFFFFF",
    height: 80,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  label: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: "500",
  },
  activeIndicator: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.primary,
    marginTop: 3,
  },
});
