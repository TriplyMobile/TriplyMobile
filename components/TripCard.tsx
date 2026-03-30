import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Badge from './Badge';
import { Colors } from '@/lib/types';

interface TripCardProps {
  name: string;
  participantCount: number;
  startDate: string | null;
  endDate: string | null;
  openPollCount: number;
  status: 'planning' | 'confirmed' | 'completed';
  onPress: () => void;
}

function formatDateRange(start: string | null, end: string | null): string | null {
  if (!start) return null;
  const format = (d: string) => {
    const date = new Date(d + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  if (!end) return format(start);
  return `${format(start)} - ${format(end)}`;
}

function getBadge(openPollCount: number, status: string): { label: string; variant: 'success' | 'warning' | 'info' } | null {
  if (openPollCount > 0) {
    return { label: `${openPollCount} vote${openPollCount > 1 ? 's' : ''}`, variant: 'warning' };
  }
  if (status === 'confirmed' || status === 'completed') {
    return { label: 'Confirmed', variant: 'success' };
  }
  return { label: 'Pending', variant: 'info' };
}

export default function TripCard({
  name,
  participantCount,
  startDate,
  endDate,
  openPollCount,
  status,
  onPress,
}: TripCardProps) {
  const dateRange = formatDateRange(startDate, endDate);
  const badge = getBadge(openPollCount, status);
  const isInactive = openPollCount === 0 && status === 'planning';

  return (
    <TouchableOpacity
      style={[styles.card, isInactive && styles.inactive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.topRow}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        {badge && <Badge label={badge.label} variant={badge.variant} />}
      </View>
      <View style={styles.bottomRow}>
        <Text style={styles.meta}>
          {participantCount} participant{participantCount !== 1 ? 's' : ''}
        </Text>
        {dateRange && <Text style={styles.meta}>{dateRange}</Text>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  inactive: {
    opacity: 0.5,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  name: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    gap: 12,
  },
  meta: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
});
