import { Timestamp } from 'firebase/firestore';

export interface User {
  userId: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  createdAt: Timestamp;
}

export interface Trip {
  id: string;
  name: string;
  description: string | null;
  coverImageUrl: string | null;
  createdBy: string;
  shareCode: string;
  status: 'planning' | 'confirmed' | 'completed';
  startDate: string | null;
  endDate: string | null;
  countryDestination: string | null;
  maxBudget: number | null;
  currency: string | null;
  createdAt: Timestamp;
}

export interface Participant {
  userId: string;
  role: 'organizer' | 'participant';
  joinedAt: Timestamp;
}

export interface Poll {
  id: string;
  title: string;
  category: 'dates' | 'destination' | 'transport' | 'accommodation' | 'activity';
  allowMultipleVotes: boolean;
  status: 'open' | 'closed';
  createdBy: string;
  createdAt: Timestamp;
}

export interface PollOption {
  id: string;
  label: string;
  description: string | null;
  price: string | null;
  url: string | null;
  createdBy: string;
  createdAt: Timestamp;
}

export interface Vote {
  id: string;
  userId: string;
  createdAt: Timestamp;
}

export interface PlanningItem {
  id: string;
  pollId: string | null;
  title: string;
  description: string | null;
  category: 'transport' | 'accommodation' | 'activity';
  date: string | null;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'all_day' | null;
  status: 'confirmed' | 'booked';
  bookingReference: string | null;
  bookingUrl: string | null;
  price: string | null;
  createdAt: Timestamp;
}

// Colors from the spec design system
export const Colors = {
  primary: '#378ADD',
  success: '#1D9E75',
  warning: '#BA7517',
  danger: '#E24B4A',

  background: '#FFFFFF',
  surface: '#F5F5F3',
  textPrimary: '#1A1A1A',
  textSecondary: '#6B6B6B',
  textTertiary: '#A0A0A0',
  border: 'rgba(0,0,0,0.12)',

  blueBg: '#E6F1FB',
  blueText: '#185FA5',
  greenBg: '#E1F5EE',
  greenText: '#0F6E56',
  amberBg: '#FAEEDA',
  amberText: '#854F0B',
} as const;
