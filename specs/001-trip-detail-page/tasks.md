# Tasks: Trip Detail Page

**Input**: Design documents from `/specs/001-trip-detail-page/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL - not explicitly requested in the feature specification, so test tasks are not included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Mobile app**: `app/` directory for Expo Router routes only, `types/` at root level for TypeScript types, `constants/` at root level for constants

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create directory structure: `app/trips/` directory for dynamic route
- [x] T002 [P] Create TypeScript types file `types/trip.ts` at root level with Trip and TripFormData interfaces
- [x] T003 [P] Create countries constants file `constants/countries.ts` at root level with predefined country list
- [x] T004 [P] Create currencies constants file `constants/currencies.ts` at root level with currency codes and symbols

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Update `app/_layout.tsx` to add Stack.Screen for `trips/[id]` route with title "Trip Details"
- [x] T006 Update `app/trips.tsx` to add navigation to trip detail page on trip card tap using `router.push(\`/trips/\${item.id}\`)`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Trip Details (Priority: P1) 🎯 MVP

**Goal**: Display complete trip information on a dedicated page accessible from the trips list, with navigation back to the list.

**Independent Test**: Navigate from trips list to trip detail page, verify all trip fields are displayed correctly, confirm navigation back to list works. This delivers immediate value by allowing users to access complete trip information.

### Implementation for User Story 1

- [x] T007 [US1] Create trip detail page component `app/trips/[id].tsx` with basic structure, route parameter extraction, and import Trip type from `../../types/trip` (relative path from app/trips/[id].tsx to root types/)
- [x] T008 [US1] Implement trip loading logic in `app/trips/[id].tsx` using Firestore `getDoc` to fetch trip by ID
- [x] T009 [US1] Add loading state with ActivityIndicator in `app/trips/[id].tsx` while fetching trip data
- [x] T010 [US1] Implement error handling for trip loading in `app/trips/[id].tsx` with user-friendly error messages
- [x] T011 [US1] Create view mode UI in `app/trips/[id].tsx` to display all trip fields: name, startDate, endDate, countryDestination, maxBudget, currency, description
- [x] T012 [US1] Format date fields for display in `app/trips/[id].tsx` (convert ISO 8601 to readable format)
- [x] T013 [US1] Handle empty/optional fields display in `app/trips/[id].tsx` (show "Not set" or blank for missing fields)
- [x] T014 [US1] Implement navigation back to trips list in `app/trips/[id].tsx` using router.back() or router.push("/trips")
- [x] T015 [US1] Add styling to trip detail page in `app/trips/[id].tsx` following app design system (consistent with trips.tsx)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Users can navigate to trip detail page, view all trip information, and return to trips list.

---

## Phase 4: User Story 2 - Edit Trip Details (Priority: P2)

**Goal**: Allow users to modify trip field values and save changes, with validation and unsaved changes detection.

**Independent Test**: Open trip detail page, modify field values, save changes, verify updates persist. Cancel editing restores original values. Attempting to navigate back with unsaved changes shows confirmation dialog.

### Implementation for User Story 2

- [x] T016 [US2] Add edit mode state management in `app/trips/[id].tsx` with `isEditing` boolean and `formData` state
- [x] T017 [US2] Implement edit button/control in `app/trips/[id].tsx` to toggle edit mode
- [x] T018 [US2] Create edit mode UI in `app/trips/[id].tsx` with TextInput components for all editable fields
- [x] T019 [US2] Implement date input handling in `app/trips/[id].tsx` for startDate and endDate fields (TextInput with date picker modal or formatted input)
- [x] T020 [US2] Implement country selection dropdown in `app/trips/[id].tsx` using countries from `constants/countries.ts` (import with `../../constants/countries` from root level)
- [x] T021 [US2] Implement currency selection dropdown in `app/trips/[id].tsx` using currencies from `constants/currencies.ts` (import with `../../constants/currencies` from root level)
- [x] T022 [US2] Add form validation in `app/trips/[id].tsx` for required name field (prevent save if empty)
- [x] T023 [US2] Add date validation in `app/trips/[id].tsx` to ensure endDate >= startDate if both provided
- [x] T024 [US2] Add budget validation in `app/trips/[id].tsx` to ensure numeric and non-negative values
- [x] T025 [US2] Implement save functionality in `app/trips/[id].tsx` using Firestore `updateDoc` to persist changes
- [x] T026 [US2] Add loading state during save operation in `app/trips/[id].tsx` with ActivityIndicator
- [x] T027 [US2] Implement error handling for save operation in `app/trips/[id].tsx` with Alert for user-friendly messages
- [x] T028 [US2] Implement cancel editing functionality in `app/trips/[id].tsx` to restore original trip values
- [x] T029 [US2] Implement unsaved changes detection in `app/trips/[id].tsx` by comparing formData to original trip data
- [x] T030 [US2] Add confirmation dialog in `app/trips/[id].tsx` when navigating back with unsaved changes using Alert.alert()
- [x] T031 [US2] Handle confirmation dialog responses in `app/trips/[id].tsx` (discard changes and navigate, or stay on page)
- [x] T032 [US2] Reload trip data after successful save in `app/trips/[id].tsx` to display updated information

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Users can view trip details, edit fields, save changes, and cancel editing. Unsaved changes are detected and confirmed before navigation.

---

## Phase 5: User Story 3 - Delete Trip (Priority: P3)

**Goal**: Allow users to permanently remove trips with confirmation, then navigate back to trips list.

**Independent Test**: Open trip detail page, initiate deletion, confirm action, verify trip is removed from trips list. Cancel deletion keeps trip unchanged.

### Implementation for User Story 3

- [x] T033 [US3] Add delete button/control in `app/trips/[id].tsx` (visible in view mode)
- [x] T034 [US3] Implement delete confirmation dialog in `app/trips/[id].tsx` using Alert.alert() with destructive style
- [x] T035 [US3] Implement delete functionality in `app/trips/[id].tsx` using Firestore `deleteDoc` to remove trip document
- [x] T036 [US3] Add loading state during delete operation in `app/trips/[id].tsx` with ActivityIndicator
- [x] T037 [US3] Implement error handling for delete operation in `app/trips/[id].tsx` with Alert for user-friendly messages
- [x] T038 [US3] Navigate back to trips list after successful deletion in `app/trips/[id].tsx` using router.back() or router.push("/trips")
- [x] T039 [US3] Handle delete cancellation in `app/trips/[id].tsx` to dismiss dialog and remain on page

**Checkpoint**: All user stories should now be independently functional. Users can view, edit, and delete trips with proper confirmation and error handling.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T040 [P] Add consistent error handling across all Firestore operations in `app/trips/[id].tsx` (network errors, permission errors)
- [x] T041 [P] Improve loading states in `app/trips/[id].tsx` with better UX (skeleton screens or improved ActivityIndicator placement)
- [x] T042 [P] Add accessibility labels and hints in `app/trips/[id].tsx` for screen readers
- [x] T043 [P] Optimize date formatting utilities (extract to helper function if reused)
- [x] T044 [P] Add empty state handling in `app/trips/[id].tsx` for trip not found scenario
- [x] T045 [P] Style improvements in `app/trips/[id].tsx` to match app design system consistently
- [x] T046 [P] Code cleanup and refactoring in `app/trips/[id].tsx` (extract helper functions, improve component structure)
- [x] T047 [P] Run quickstart.md validation checklist to ensure all implementation patterns are followed

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Depends on US1 for trip detail page structure, but editing can be added incrementally
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Depends on US1 for trip detail page structure, but deletion can be added incrementally

### Within Each User Story

- Models/types before components
- Loading/error handling before UI features
- Core functionality before polish
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks (T002, T003, T004) marked [P] can run in parallel
- Foundational tasks (T005, T006) can run in parallel
- Once Foundational phase completes, user stories can start in parallel (if team capacity allows)
- Within US2: Date input (T019), country dropdown (T020), currency dropdown (T021) can be implemented in parallel
- Polish tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch foundational tasks together:
Task: "Update app/_layout.tsx to add Stack.Screen for trips/[id] route"
Task: "Update app/trips.tsx to add navigation to trip detail page"

# Launch setup tasks together:
Task: "Create TypeScript types file types/trip.ts at root level"
Task: "Create countries constants file constants/countries.ts at root level"
Task: "Create currencies constants file constants/currencies.ts at root level"
```

---

## Parallel Example: User Story 2

```bash
# Launch form input implementations together:
Task: "Implement date input handling in app/trips/[id].tsx"
Task: "Implement country selection dropdown in app/trips/[id].tsx"
Task: "Implement currency selection dropdown in app/trips/[id].tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T006) - CRITICAL - blocks all stories
3. Complete Phase 3: User Story 1 (T007-T015)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (View)
   - Developer B: User Story 2 (Edit) - can start after US1 structure exists
   - Developer C: User Story 3 (Delete) - can start after US1 structure exists
3. Stories complete and integrate independently

---

## Task Summary

- **Total Tasks**: 47
- **Setup Phase**: 4 tasks
- **Foundational Phase**: 2 tasks
- **User Story 1 (P1)**: 9 tasks
- **User Story 2 (P2)**: 17 tasks
- **User Story 3 (P3)**: 7 tasks
- **Polish Phase**: 8 tasks

### Parallel Opportunities Identified

- **Setup**: 3 tasks can run in parallel (T002, T003, T004)
- **Foundational**: 2 tasks can run in parallel (T005, T006)
- **US2 Form Inputs**: 3 tasks can run in parallel (T019, T020, T021)
- **Polish**: 8 tasks can run in parallel (all marked [P])

### Independent Test Criteria

- **US1**: Navigate from trips list → view trip details → navigate back. All fields display correctly.
- **US2**: Open trip detail → enter edit mode → modify fields → save → verify persistence. Cancel restores values. Unsaved changes show confirmation.
- **US3**: Open trip detail → delete → confirm → verify removal from list. Cancel keeps trip.

### Suggested MVP Scope

**MVP = User Story 1 only** (View Trip Details)
- Complete Setup (T001-T004)
- Complete Foundational (T005-T006)
- Complete User Story 1 (T007-T015)
- **Total MVP Tasks**: 15 tasks

This delivers core value: users can view complete trip information from the trips list.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- All tasks include exact file paths for clarity
- Firestore operations use existing "trips" collection (no new tables)
- **Important**: Types and constants are at root level (`types/`, `constants/`), not under `app/`. Only routes belong in `app/` directory per Expo Router conventions. Import paths from `app/trips/[id].tsx` should use relative paths like `../../types/trip` or `../../constants/countries`.
