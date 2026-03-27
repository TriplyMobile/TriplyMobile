# Feature Specification: Trip Screen Redesign

**Feature Branch**: `specify-cli-upgrade`
**Created**: 2026-03-27
**Status**: Draft
**Input**: User description: "Move all the trip details to a dedicated trip details page that is accessible by pressing an information icon on the right of the header when on the trip screen. The original trip screen should be an empty screen with just the trip name in the center of the header."

## User Scenarios & Testing

### User Story 1 - Trip Screen with Info Icon (Priority: P1)

A user navigating to a trip sees the trip name centered in the header and an info (ℹ) icon on the right side of the header. The main body of the trip screen is empty. Pressing the info icon navigates to the trip details page.

**Acceptance Scenarios**:

1. **Given** a user navigates to a trip, **When** the trip screen loads, **Then** the trip name is displayed centered in the header
2. **Given** the trip screen is loaded, **When** the user looks at the header, **Then** an info icon is visible on the right side
3. **Given** a user is on the trip screen, **When** they press the info icon, **Then** they are navigated to the trip details page
4. **Given** a user navigates to a trip, **When** the trip screen body loads, **Then** it is empty (no trip details shown)

---

### User Story 2 - Dedicated Trip Details Page (Priority: P1)

All existing trip detail content (name, dates, country, budget, description) and actions (edit, delete) live on a separate trip details page, reachable only from the info icon on the trip screen header.

**Acceptance Scenarios**:

1. **Given** a user presses the info icon on the trip screen, **When** they arrive at the trip details page, **Then** all trip fields are displayed (name, startDate, endDate, countryDestination, maxBudget, currency, description)
2. **Given** a user is on the trip details page, **When** they tap edit or delete, **Then** those actions work as before
3. **Given** a user is on the trip details page, **When** they tap back, **Then** they return to the trip screen

## Requirements

### Functional Requirements

- **FR-001**: The trip screen (`trips/[id]`) MUST display the trip name centered in the header
- **FR-002**: The trip screen body MUST be empty
- **FR-003**: An info icon MUST appear on the right side of the trip screen header
- **FR-004**: Pressing the info icon MUST navigate to the trip details page (`trips/[id]/details`)
- **FR-005**: The trip details page MUST contain all existing detail/edit/delete functionality

### Key Entities

- **Trip Screen** (`trips/[id]/index.tsx`): Empty body, trip name in header center, info icon header right → navigates to details
- **Trip Details Page** (`trips/[id]/details.tsx`): All existing content from `trips/[id].tsx` (view/edit/delete)

## Success Criteria

- **SC-001**: Trip name is visible and centered in header on trip screen
- **SC-002**: Info icon is tappable and navigates to details page
- **SC-003**: All existing detail/edit/delete functionality works unchanged on the details page
- **SC-004**: Navigation back from details returns to trip screen
