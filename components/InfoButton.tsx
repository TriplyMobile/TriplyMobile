import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';
import { Colors } from '@/lib/types';

interface InfoButtonProps {
  onPress: () => void;
}

export default function InfoButton({ onPress }: InfoButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.button}
      accessibilityLabel="Trip info"
      accessibilityRole="button"
    >
      <Ionicons name="information-circle-outline" size={26} color={Colors.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 4,
  },
});
