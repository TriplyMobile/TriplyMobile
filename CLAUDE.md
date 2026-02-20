# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Start Expo dev server
npm run ios        # Run on iOS simulator
npm run android    # Run on Android emulator
npm run web        # Run in browser
npm test           # Run all tests (jest-expo preset)
npm run lint       # Lint with expo lint (ESLint flat config)
```

Run a single test file:
```bash
npx jest __tests__/index.test.tsx
```

## Architecture

**Expo Router (file-based routing)** — all screens live in `app/`. The entry point is `expo-router/entry` (set in `package.json`).

```
app/
  _layout.tsx    # Root Stack navigator — defines all routes and header config
  index.tsx      # Landing page: branding + Login/Sign Up/Simulate login buttons
  login.tsx      # Login form (email + password)
  register.tsx   # Registration form (email + password + confirm)
  trips.tsx      # Trips list (Firestore read/write) + create trip modal
```

**Navigation** uses `router.push()` from `expo-router`. All screens are registered as Stack screens in `_layout.tsx`.

**Backend** is Firebase — `firebaseConfig.js` at root initializes the app and exports `db` (Firestore). `app/trips.tsx` is the only screen currently using Firestore (`trips` collection). Auth, Storage, and Realtime Database imports are present but commented out.

**Tests** live in `__tests__/`. Uses `@testing-library/react-native`. External deps (expo-linear-gradient, expo-status-bar, expo-router) are mocked inline in each test file.

**TypeScript** path alias `@/*` maps to the repo root (e.g. `@/components/Foo`).

**New Architecture + React Compiler** are both enabled (`app.json` experiments).

## Key Dependencies

- `expo` ~54, `react` 19, `react-native` 0.81
- `expo-router` ~6 — file-based routing
- `firebase` ^12 — Firestore backend
- `expo-linear-gradient` — used for backgrounds on every screen
- `react-native-reanimated` ~4, `react-native-gesture-handler` ~2
