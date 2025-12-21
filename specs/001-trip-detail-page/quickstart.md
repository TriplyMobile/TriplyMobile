# Quick Start: Trip Detail Page

**Date**: 2025-01-27  
**Feature**: Trip Detail Page  
**Branch**: `001-trip-detail-page`

## Overview

This guide helps you quickly understand and implement the trip detail page feature.

## Key Files to Create

1. **`app/trips/[id].tsx`** - Main trip detail page component (dynamic route)
2. **`app/types/trip.ts`** - TypeScript types for Trip entity
3. **`app/constants/countries.ts`** - Country list for dropdown
4. **`app/constants/currencies.ts`** - Currency list for dropdown

## Implementation Steps

### Step 1: Create TypeScript Types

Create `app/types/trip.ts`:

```typescript
export interface Trip {
  id: string;
  name: string;
  startDate?: string;
  endDate?: string;
  countryDestination?: string;
  maxBudget?: number;
  currency?: string;
  description?: string;
}

export interface TripFormData {
  name: string;
  startDate?: string;
  endDate?: string;
  countryDestination?: string;
  maxBudget?: string;
  currency?: string;
  description?: string;
}
```

### Step 2: Create Constants

Create `app/constants/countries.ts`:

```typescript
export const COUNTRIES = [
  { name: "United States", code: "US" },
  { name: "United Kingdom", code: "GB" },
  { name: "France", code: "FR" },
  // ... add more countries
];
```

Create `app/constants/currencies.ts`:

```typescript
export const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  // ... add more currencies
];
```

### Step 3: Create Trip Detail Page

Create `app/trips/[id].tsx`:

```typescript
import { useLocalSearchParams, router } from "expo-router";
import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { Trip, TripFormData } from "../../types/trip";
// ... import other components

export default function TripDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<TripFormData>({ name: "" });
  
  // Load trip, handle edit, save, delete functions
  // ... implementation
}
```

### Step 4: Update Navigation

Update `app/_layout.tsx` to include trip detail route:

```typescript
<Stack.Screen 
  name="trips/[id]" 
  options={{ title: "Trip Details", headerBackTitle: "Trips" }} 
/>
```

### Step 5: Update Trips List

Update `app/trips.tsx` to navigate to detail page on trip tap:

```typescript
<TouchableOpacity onPress={() => router.push(`/trips/${item.id}`)}>
  {/* trip card */}
</TouchableOpacity>
```

## Key Implementation Patterns

### Loading Trip Data

```typescript
useEffect(() => {
  const loadTrip = async () => {
    try {
      const tripRef = doc(db, "trips", id);
      const tripSnap = await getDoc(tripRef);
      if (tripSnap.exists()) {
        setTrip({ id: tripSnap.id, ...tripSnap.data() } as Trip);
      }
    } catch (error) {
      // Handle error
    } finally {
      setLoading(false);
    }
  };
  loadTrip();
}, [id]);
```

### Saving Changes

```typescript
const handleSave = async () => {
  if (!formData.name.trim()) {
    Alert.alert("Error", "Trip name is required");
    return;
  }
  
  try {
    const tripRef = doc(db, "trips", id);
    await updateDoc(tripRef, {
      name: formData.name.trim(),
      startDate: formData.startDate || null,
      // ... other fields
    });
    setIsEditing(false);
    // Reload trip data
  } catch (error) {
    Alert.alert("Error", "Unable to save changes");
  }
};
```

### Deleting Trip

```typescript
const handleDelete = () => {
  Alert.alert(
    "Delete Trip",
    "Are you sure you want to delete this trip?",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const tripRef = doc(db, "trips", id);
            await deleteDoc(tripRef);
            router.back();
          } catch (error) {
            Alert.alert("Error", "Unable to delete trip");
          }
        },
      },
    ]
  );
};
```

### Unsaved Changes Detection

```typescript
const hasUnsavedChanges = () => {
  if (!trip || !isEditing) return false;
  return (
    formData.name !== trip.name ||
    formData.startDate !== trip.startDate ||
    // ... compare other fields
  );
};

// Use beforeRemove navigation event or check on back button press
```

## Validation Rules

1. **Name**: Required, non-empty after trim
2. **Dates**: `endDate >= startDate` if both provided
3. **Budget**: Numeric, non-negative
4. **Country**: Must be from predefined list

## Testing Checklist

- [ ] Load trip detail page with valid ID
- [ ] Display all trip fields correctly
- [ ] Enter edit mode
- [ ] Save changes successfully
- [ ] Cancel editing restores original values
- [ ] Delete trip with confirmation
- [ ] Handle network errors gracefully
- [ ] Show unsaved changes confirmation on navigation
- [ ] Validate required fields (name)
- [ ] Validate date constraints (endDate >= startDate)

## Common Issues

**Issue**: Route not found  
**Solution**: Ensure `app/trips/[id].tsx` exists and `_layout.tsx` includes the route

**Issue**: Firestore permission errors  
**Solution**: Check Firestore security rules allow read/write/delete for trips collection

**Issue**: Date format issues  
**Solution**: Use ISO 8601 format (YYYY-MM-DD) for storage, format for display

## Next Steps

1. Implement the component following the patterns above
2. Add date picker for date fields
3. Add country/currency dropdowns
4. Style according to app design system
5. Add loading and error states
6. Test with real Firestore data

## References

- [Specification](./spec.md)
- [Data Model](./data-model.md)
- [Data Access Contracts](./contracts/data-access.md)
- [Research Decisions](./research.md)
