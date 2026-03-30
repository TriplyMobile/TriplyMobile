import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/lib/types';

type BadgeVariant = 'success' | 'warning' | 'info';

const VARIANT_STYLES: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: Colors.greenBg, text: Colors.greenText },
  warning: { bg: Colors.amberBg, text: Colors.amberText },
  info: { bg: Colors.blueBg, text: Colors.blueText },
};

interface BadgeProps {
  label: string;
  variant: BadgeVariant;
}

export default function Badge({ label, variant }: BadgeProps) {
  const colors = VARIANT_STYLES[variant];
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.text, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 10,
    fontWeight: '500',
  },
});
