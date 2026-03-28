# Feature Specification: Bottom Navigation Bar

**Feature Branch**: `bottom-navigation-bar`
**Created**: 2026-03-28
**Status**: Implemented
**Input**: User description: "Add a bottom navigation bar on the trip screen with three tabs (Dashboard, Finances, Checklists) and a plus button. Follow the Figma design."
**Design**: [Figma](https://www.figma.com/design/mKLEOPIduibHHVJ2Cbz8zz/VERY-GOOD-TRIP?node-id=238-2684)

## User Scenarios & Testing

### User Story 1 - Bottom Navigation Bar Display (Priority: P1)

A user on the trip screen sees a bottom navigation bar with three evenly spaced tab icons (Finances, Dashboard, Checklists). The active tab is visually indicated with a blue dot.

**Acceptance Scenarios**:

1. **Given** a user navigates to the trip screen, **When** the screen loads, **Then** a bottom navigation bar is visible at the bottom
2. **Given** the bottom nav is visible, **When** the user looks at it, **Then** they see Finances (left), Dashboard (center), and Checklists (right) icons with equal spacing
3. **Given** the user is on the Dashboard tab, **When** they look at the nav bar, **Then** the Dashboard icon has an active indicator (blue dot)

### User Story 2 - Tab Navigation (Priority: P1)

Pressing a tab icon navigates to the corresponding screen. The Dashboard is the default/main tab.

**Acceptance Scenarios**:

1. **Given** a user taps the Dashboard icon, **When** the navigation completes, **Then** they see the Dashboard screen
2. **Given** a user taps the Finances icon, **When** the navigation completes, **Then** they see the Finances screen
3. **Given** a user taps the Checklists icon, **When** the navigation completes, **Then** they see the Checklists screen
4. **Given** a user navigates to a trip, **When** the trip screen loads, **Then** the Dashboard tab is selected by default

### User Story 3 - Plus Button (Priority: P2)

A floating action button (FAB) appears on the bottom right of the Dashboard screen, above the nav bar. It does not perform any action yet.

**Acceptance Scenarios**:

1. **Given** the user is on the Dashboard tab, **When** they look at the bottom right, **Then** a circular plus button is visible floating above the nav bar
2. **Given** the user taps the plus button, **When** the tap completes, **Then** nothing happens (placeholder for future functionality)
3. **Given** the user switches to another tab, **When** the tab loads, **Then** the plus button is not visible

### User Story 4 - Header Navigation (Priority: P1)

All tab screens show a header with the trip name, a back button (left) that navigates to the Trips list with a slide-right animation, and an info icon (right) that navigates to the trip details page.

**Acceptance Scenarios**:

1. **Given** the user is on any tab, **When** they look at the header, **Then** the trip name is centered, a back chevron is on the left, and an info icon is on the right
2. **Given** the user taps the back button, **When** the navigation completes, **Then** they return to the Trips list with a slide-right animation
3. **Given** the user taps the info icon, **When** the navigation completes, **Then** they see the Trip Details page (without the bottom nav bar)

## Requirements

### Functional Requirements

- **FR-001**: The trip screen MUST display a bottom navigation bar
- **FR-002**: The nav bar MUST have three tabs in order: Finances (left), Dashboard (center), Checklists (right)
- **FR-003**: Tabs MUST be evenly spaced across the nav bar
- **FR-004**: Tapping a tab MUST navigate to the corresponding screen
- **FR-005**: The Dashboard tab MUST be the default active tab
- **FR-006**: A floating plus button MUST appear on the Dashboard screen (bottom right, above nav bar)
- **FR-007**: The plus button MUST NOT perform any action (placeholder)
- **FR-008**: The active tab MUST have a blue dot indicator
- **FR-009**: All tabs MUST show a header with back button, trip name, and info icon
- **FR-010**: The back button MUST navigate to the Trips list with a slide-right animation (`router.dismiss()`)

### Visual Requirements (from Figma, adapted)

- Nav bar background: white (`#FFFFFF`) with top shadow (`0px -1px 6px rgba(0,0,0,0.1)`)
- Nav bar height: 80px with 16px bottom padding (safe area for home indicator)
- Plus button (FAB): circular, 52px, gray (`#8D8C8C`) background, white plus icon, positioned bottom-right of Dashboard screen
- Tab icons: Finances (cash-outline), Dashboard (calendar-outline, 30px), Checklists (list-outline, 28px)
- Active indicator: small blue dot (`#4A90E2`, 5px) below active tab icon
- Inactive icon color: `#8D8C8C`, active: `#000000`

### Key Entities

- **Bottom Nav Bar** (`components/BottomNavBar.tsx`): Custom tab bar component with 3 evenly spaced tabs
- **Dashboard Screen** (`app/trips/[id]/(tabs)/dashboard.tsx`): Main trip screen with floating plus button
- **Finances Screen** (`app/trips/[id]/(tabs)/finances.tsx`): Empty placeholder screen
- **Checklists Screen** (`app/trips/[id]/(tabs)/checklists.tsx`): Empty placeholder screen
- **Tabs Layout** (`app/trips/[id]/(tabs)/_layout.tsx`): Tabs navigator with header (trip name, back, info icon)
- **Trip Layout** (`app/trips/[id]/_layout.tsx`): Stack wrapping (tabs) group and details screen

## Success Criteria

- **SC-001**: Bottom nav bar is visible on all trip tab screens
- **SC-002**: Tab navigation works between Finances, Dashboard, and Checklists
- **SC-003**: Plus button floats on bottom-right of Dashboard only
- **SC-004**: Active tab has a blue dot indicator
- **SC-005**: Back button slides right to Trips list
- **SC-006**: Details page shows without bottom nav bar
- **SC-007**: Nav bar has sufficient height to avoid home indicator/Siri conflicts
