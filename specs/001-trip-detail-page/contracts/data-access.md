# Data Access Contracts: Trip Detail Page

**Date**: 2025-01-27  
**Feature**: Trip Detail Page  
**Branch**: `001-trip-detail-page`

## Overview

This feature uses Firestore directly (no REST API layer). Contracts define the data access patterns and expected behaviors for Firestore operations.

## Firestore Collection

**Collection Name**: `trips`  
**Document Structure**: See [data-model.md](../data-model.md)

## Operations

### 1. Get Trip by ID

**Purpose**: Fetch a single trip document for display on detail page

**Firestore Operation**: `getDoc(doc(db, "trips", tripId))`

**Input**:
- `tripId: string` - Firestore document ID

**Output**:
- Success: `Trip` object with all fields
- Not Found: Document doesn't exist
- Error: Firestore error (network, permissions, etc.)

**Error Handling**:
- Document not found: Return null/undefined, show "Trip not found" message
- Network error: Show "Unable to load trip. Please check your connection."
- Permission error: Show "You don't have permission to view this trip."

**Example**:
```typescript
const tripRef = doc(db, "trips", tripId);
const tripSnap = await getDoc(tripRef);
if (!tripSnap.exists()) {
  throw new Error("Trip not found");
}
return { id: tripSnap.id, ...tripSnap.data() } as Trip;
```

---

### 2. Update Trip

**Purpose**: Save edited trip fields to Firestore

**Firestore Operation**: `updateDoc(doc(db, "trips", tripId), updates)`

**Input**:
- `tripId: string` - Firestore document ID
- `updates: Partial<Trip>` - Fields to update (partial update supported)

**Validation** (before save):
- `name` must be non-empty string (required)
- `endDate >= startDate` if both provided
- `maxBudget` must be numeric if provided
- `countryDestination` must be from valid list if provided

**Output**:
- Success: Void (operation completed)
- Validation Error: Field-specific error messages
- Network Error: "Unable to save changes. Please try again."
- Permission Error: "You don't have permission to edit this trip."

**Example**:
```typescript
const tripRef = doc(db, "trips", tripId);
await updateDoc(tripRef, {
  name: formData.name.trim(),
  startDate: formData.startDate,
  endDate: formData.endDate,
  // ... other fields
});
```

---

### 3. Delete Trip

**Purpose**: Permanently remove trip document from Firestore

**Firestore Operation**: `deleteDoc(doc(db, "trips", tripId))`

**Input**:
- `tripId: string` - Firestore document ID

**Confirmation**: Required (per spec FR-008) - user must confirm before deletion

**Output**:
- Success: Void (document deleted)
- Network Error: "Unable to delete trip. Please try again."
- Permission Error: "You don't have permission to delete this trip."
- Not Found: Document already deleted (handle gracefully)

**Example**:
```typescript
const tripRef = doc(db, "trips", tripId);
await deleteDoc(tripRef);
```

---

## Component Contracts

### Trip Detail Page Component

**File**: `app/trips/[id].tsx`

**Props**: None (uses route params)

**Route Parameter**:
- `id: string` - Trip ID from URL (`/trips/:id`)

**State**:
- `trip: Trip | null` - Current trip data
- `loading: boolean` - Loading state
- `error: string | null` - Error message
- `isEditing: boolean` - Edit mode flag
- `formData: TripFormData` - Form state
- `hasUnsavedChanges: boolean` - Track unsaved changes

**Methods**:
- `loadTrip(id: string): Promise<void>` - Fetch trip from Firestore
- `handleEdit(): void` - Enter edit mode
- `handleSave(): Promise<void>` - Save changes to Firestore
- `handleCancel(): void` - Cancel editing, restore original values
- `handleDelete(): Promise<void>` - Delete trip (with confirmation)
- `handleBack(): void` - Navigate back (check for unsaved changes)

**Navigation**:
- Navigate to trips list: `router.back()` or `router.push("/trips")`
- On delete success: Navigate to trips list

---

## Error Response Format

All Firestore errors should be caught and converted to user-friendly messages:

```typescript
try {
  await firestoreOperation();
} catch (error: any) {
  if (error.code === "permission-denied") {
    return "You don't have permission to perform this action.";
  }
  if (error.code === "unavailable") {
    return "Unable to connect. Please check your internet connection.";
  }
  return "An error occurred. Please try again.";
}
```

---

## Performance Expectations

- **Get Trip**: < 500ms (local cache) or < 2s (network)
- **Update Trip**: < 1s (network)
- **Delete Trip**: < 1s (network)

These align with spec success criteria (SC-001, SC-002, SC-003).

---

## Testing Contracts

### Unit Tests

Test each Firestore operation with mocked Firestore:
- Get trip success/failure
- Update trip with validation
- Delete trip with confirmation

### Integration Tests

Test component with real Firestore (test database):
- Load trip and display
- Edit and save trip
- Delete trip
- Handle network errors

---

## Notes

- **No REST API**: Direct Firestore access from mobile app
- **Offline Support**: Firestore offline persistence handles offline scenarios
- **Real-time Updates**: Not required for this feature (can be added later if needed)
- **Security**: Firestore security rules must allow read/write/delete for authenticated users (out of scope for this feature)
