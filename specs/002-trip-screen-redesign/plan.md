# Implementation Plan: Trip Screen Redesign

**Branch**: `specify-cli-upgrade` | **Date**: 2026-03-27 | **Spec**: [spec.md](./spec.md)

## Summary

Restructure the trip detail route by splitting it into two pages:
1. `trips/[id]/index.tsx` — empty screen, trip name centered in header, info icon navigating to details
2. `trips/[id]/details.tsx` — all existing content from the current `trips/[id].tsx`

## Technical Context

**Language/Version**: TypeScript, React Native 0.81, Expo Router 6
**Storage**: Cloud Firestore (existing "trips" collection)
**Icon Library**: `@expo/vector-icons` (Ionicons)

## Project Structure Changes

```text
Before:
app/trips/[id].tsx         ← all detail content

After:
app/trips/[id]/
├── index.tsx              ← empty screen + header (trip name + info icon)
└── details.tsx            ← all detail content (moved from [id].tsx)

app/_layout.tsx            ← add trips/[id]/details Stack.Screen
```

## Constitution Check

✅ **Simplicity**: Single-responsibility screens, no new abstractions
✅ **Technical Decisions**: Expo Router file-based routing, @expo/vector-icons (already installed)
✅ **Architecture**: useState for trip name loading, no new state management
✅ **UX**: Fast header load, info icon is a standard mobile pattern

## Tasks

See [tasks.md](./tasks.md)
