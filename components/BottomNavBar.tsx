import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Pressable, StyleSheet, View } from "react-native";

const TAB_CONFIG: Record<
  string,
  { icon: keyof typeof Ionicons.glyphMap; label: string }
> = {
  finances: { icon: "cash-outline", label: "Finances" },
  dashboard: { icon: "calendar-outline", label: "Dashboard" },
  checklists: { icon: "list-outline", label: "Checklists" },
};

const TAB_ORDER = ["finances", "dashboard", "checklists"];

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
        const { options } = descriptors[route.key];
        const isMain = route.name === "dashboard";

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
            accessibilityLabel={options.tabBarAccessibilityLabel || config.label}
            style={styles.tab}
          >
            <Ionicons
              name={config.icon}
              size={isMain ? 30 : 28}
              color={isFocused ? "#000000" : "#8D8C8C"}
            />
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  activeIndicator: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#4A90E2",
    marginTop: 4,
  },
});
