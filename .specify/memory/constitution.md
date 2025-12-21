<!--
Sync Impact Report:
Version: 0.0.0 → 1.0.0 (Initial constitution)
Modified principles: N/A (initial creation)
Added sections: Core Principles (6 categories), Development Workflow, Technical Standards, Performance Guidelines, User Experience, Architecture
Removed sections: N/A
Templates requiring updates:
  ✅ plan-template.md (Constitution Check section remains valid - gates determined at runtime)
  ✅ spec-template.md (No constitution-specific constraints found)
  ✅ tasks-template.md (No constitution-specific constraints found)
Follow-up TODOs: None
-->
# TriplyMobile Constitution

## Core Principles

### I. Code Quality & Simplicity
Prefer simple, explicit TypeScript over clever type gymnastics. Keep components small and focused on single responsibilities. Minimize dependencies - evaluate each library addition carefully. Use TypeScript's type inference; only add explicit types when they add clarity.

**Rationale**: Simplicity reduces cognitive load, improves maintainability, and accelerates development. Explicit code is easier to understand and debug than clever abstractions.

### II. Development Approach
Ship fast, iterate based on feedback. Start with working code, refactor when patterns emerge. Embrace Expo's development workflow and hot reload. Write tests for critical paths, not 100% coverage.

**Rationale**: Rapid iteration enables faster learning and value delivery. Practical testing focuses effort on high-impact areas while maintaining quality.

### III. Technical Decisions
Default to Expo's managed workflow unless ejection is clearly needed. Use React Native's built-in components before third-party libraries. Prefer Expo SDK modules over custom native code. Choose documented, stable packages over bleeding-edge.

**Rationale**: Defaulting to standard, well-supported solutions reduces maintenance burden and leverages community expertise. Stability beats novelty for production applications.

### IV. Performance
Optimize only after measuring with React DevTools Profiler. Profile before making assumptions. Use React.memo and useMemo judiciously, not by default.

**Rationale**: Premature optimization wastes effort and can introduce unnecessary complexity. Data-driven optimization ensures efforts target actual bottlenecks.

### V. User Experience
Fast feedback loops (quick load times, responsive interactions). Clear error messages and loading states. Mobile-first design patterns. Handle offline scenarios gracefully.

**Rationale**: Mobile users expect responsive, reliable experiences. Graceful degradation maintains usability even when network or device constraints occur.

### VI. Architecture
Keep state management simple (useState/useContext before Redux/Zustand). Co-locate related code (components, hooks, types together). Avoid premature abstraction.

**Rationale**: Simple state management reduces complexity and learning curve. Co-location improves discoverability and maintainability. YAGNI (You Aren't Gonna Need It) prevents over-engineering.

## Development Workflow

All development must align with the principles above. Code reviews must verify compliance with simplicity, proper dependency evaluation, and appropriate use of React Native/Expo patterns.

## Technical Standards

Default to Expo managed workflow unless clearly justified. Use React Native built-ins before third-party alternatives. Prefer Expo SDK modules over custom implementations. Evaluate all new dependencies against necessity and maintenance burden.

## Performance Guidelines

Performance optimizations must be justified with profiling data. React.memo and useMemo are opt-in optimizations, not defaults. Measure first, optimize second.

## User Experience Standards

All user-facing features must provide fast feedback, clear states, and graceful error handling. Mobile-first patterns are mandatory. Offline functionality must be considered for core features.

## Architecture Standards

State management complexity must be justified. Start with React built-in state management (useState, useContext). Co-locate related code to improve maintainability. Reject premature abstractions.

## Governance

This constitution supersedes all other development practices. Amendments require:
- Documentation of the rationale
- Review of impact on existing codebase
- Update to this document with version increment

All pull requests and code reviews must verify compliance with constitution principles. Complexity and abstractions must be justified when they deviate from simplicity principles.

**Version**: 1.0.0 | **Ratified**: 2025-01-27 | **Last Amended**: 2025-01-27
