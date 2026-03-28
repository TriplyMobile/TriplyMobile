# Tasks: Bottom Navigation Bar

## Phase 1: File Restructuring

- [x] T001 Delete `app/trips/[id]/index.tsx`; create `app/trips/[id]/(tabs)/dashboard.tsx` with empty screen + floating plus button (FAB)
- [x] T002 Create `app/trips/[id]/(tabs)/index.tsx` — redirect to `./dashboard`
- [x] T003 Create `app/trips/[id]/(tabs)/finances.tsx` — empty placeholder screen
- [x] T004 Create `app/trips/[id]/(tabs)/checklists.tsx` — empty placeholder screen

## Phase 2: Navigation Setup

- [x] T005 Create `components/BottomNavBar.tsx` — custom tab bar with 3 evenly spaced tabs (Finances | Dashboard | Checklists), active blue dot indicator, 80px height with safe area padding
- [x] T006 Create `app/trips/[id]/(tabs)/_layout.tsx` — Tabs layout with custom BottomNavBar, shared header (back button via `router.dismiss()`, trip name, info icon), `initialRouteName="dashboard"`, hide `index` from tab bar
- [x] T007 Create `app/trips/[id]/_layout.tsx` — Stack layout with `(tabs)` (headerShown: false) and `details` (title: "Trip Details") screens
- [x] T008 Update `app/_layout.tsx` — replace `trips/[id]/index` and `trips/[id]/details` Stack.Screens with single `trips/[id]` (headerShown: false)
