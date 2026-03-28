# Implementation Plan: Bottom Navigation Bar

**Branch**: `bottom-navigation-bar` | **Date**: 2026-03-28 | **Spec**: [spec.md](./spec.md)

## Summary

Add a bottom tab navigation bar to the trip screen with three evenly spaced tabs (Finances, Dashboard, Checklists) and a floating plus button on the Dashboard screen, using Expo Router with a `(tabs)` route group and a custom tab bar component.

## Technical Context

**Language/Version**: TypeScript, React Native 0.81, Expo Router 6
**Icon Library**: `@expo/vector-icons` (Ionicons)
**Navigation**: Expo Router `Tabs` layout inside a `(tabs)` route group, nested within a Stack at `app/trips/[id]/`

## Architecture Decision

Use a **Stack > (tabs) group** pattern inside `app/trips/[id]/`:
- `_layout.tsx` — Stack navigator wrapping the `(tabs)` group and `details` screen
- `(tabs)/_layout.tsx` — Tabs navigator with a custom `tabBar` component and shared header (trip name, back button, info icon)
- `details.tsx` — Stack screen outside the tabs group (no bottom nav bar)

This separates tab screens from the details screen cleanly. The `(tabs)` group name is excluded from URLs, so routes remain `/trips/[id]/dashboard`, `/trips/[id]/finances`, etc.

## Project Structure Changes

```text
Before:
app/trips/[id]/
├── index.tsx              ← empty trip screen
└── details.tsx            ← trip detail content

After:
app/trips/[id]/
├── _layout.tsx            ← Stack: (tabs) group + details
├── details.tsx            ← trip detail content (Stack screen, no tab bar)
└── (tabs)/
    ├── _layout.tsx        ← Tabs with custom BottomNavBar + shared header
    ├── index.tsx          ← Redirect to dashboard
    ├── dashboard.tsx      ← empty trip screen + floating plus button
    ├── finances.tsx       ← empty placeholder screen
    └── checklists.tsx     ← empty placeholder screen

components/
└── BottomNavBar.tsx       ← custom tab bar (3 evenly spaced tabs, active dot)

app/_layout.tsx            ← trips/[id] Stack.Screen with headerShown: false
```

## Constitution Check

- Simplicity: Custom tab bar is a single component, tab screens are minimal
- Technical Decisions: Expo Router Tabs with (tabs) group (file-based), Ionicons (already installed)
- Architecture: No new state management, Expo Router handles tab state, Stack handles details navigation
- UX: Evenly spaced tabs, FAB for future actions, safe area padding for home indicator

## Tasks

See [tasks.md](./tasks.md)
