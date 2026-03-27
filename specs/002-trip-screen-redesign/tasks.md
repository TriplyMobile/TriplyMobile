# Tasks: Trip Screen Redesign

## Phase 1: File Restructuring

- [x] T001 Move `app/trips/[id].tsx` → `app/trips/[id]/details.tsx`, update all import paths (../../ → ../../../)
- [x] T002 Create `app/trips/[id]/index.tsx` — empty body, loads trip name, sets header (centered title + info icon → navigates to details)
- [x] T003 Update `app/_layout.tsx` — add `trips/[id]/details` Stack.Screen; update `trips/[id]` header config for centered title
