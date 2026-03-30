import { StyleSheet, Text, View } from 'react-native';

const AVATAR_COLORS = [
  '#378ADD', '#1D9E75', '#BA7517', '#E24B4A',
  '#8B5CF6', '#EC4899', '#14B8A6', '#F97316',
];

function getColorForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

interface AvatarProps {
  name: string;
  size?: number;
}

export default function Avatar({ name, size = 28 }: AvatarProps) {
  const initial = name.charAt(0).toUpperCase();
  const bg = getColorForName(name);

  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg }]}>
      <Text style={[styles.initial, { fontSize: size * 0.45 }]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
