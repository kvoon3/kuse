# Work Plan: kuse - GitHub-Style Habit Tracker

## TL;DR

> **Goal**: Build a minimal habit tracker with GitHub-style contribution heatmap using localStorage persistence.
>
> **Deliverables**:
>
> - Add/delete habits with custom colors
> - Daily binary check-in with commit message
> - Full-year heatmap visualization (combined + per-habit)
> - localStorage data persistence
> - Clean Shadcn/ui styling
>
> **Estimated Effort**: Medium (~2-3 hours)
> **Parallel Execution**: NO - sequential tasks with clear dependencies
> **Critical Path**: Data Layer → Heatmap Component → Routes → Integration

---

## Context

### Original Request

Build kuse from scratch as a GitHub heatmap-style habit tracker with:

1. Custom habit creation
2. Daily check-in with commit message
3. Overall heatmap showing all habits
4. Individual habit heatmap view
5. Shadcn/ui design, simple code, easy maintenance

### Interview Summary

**Key Decisions**:

- Data persistence: localStorage (simple, no backend)
- Heatmap range: Full year (365 days)
- Habit tracking: Binary (done/not done)
- Commit message: Plain text only
- UI scope: Minimal (core features only)
- Testing: None required
- Code style: Minimal comments, human-readable

**Research Findings**:

- Project already initialized with TanStack Start + React 19 + TypeScript 5.9 + Tailwind v4 + Shadcn/ui
- Basic habit list exists with local state
- Path alias ~/\* configured
- Recommended heatmap: SVG-based with 5-level GitHub colors
- Color intensity: Dynamic threshold based on max count
- Tooltip: Shadcn/ui Tooltip component

### Guardrails (Self-Applied)

Based on requirements analysis:

- **NO scope creep**: Only binary tracking, no counters
- **NO complex features**: No reminders, goals, statistics beyond streak
- **NO backend**: localStorage only
- **NO tests**: Skip test infrastructure entirely
- **NO over-commenting**: Code should be self-explanatory

---

## Work Objectives

### Core Objective

Implement a functional habit tracker with GitHub-style contribution heatmap visualization using localStorage for data persistence.

### Concrete Deliverables

1. `~/lib/storage.ts` - localStorage persistence layer
2. `~/types/habit.ts` - TypeScript types for habits and check-ins
3. `~/components/Heatmap.tsx` - Reusable heatmap visualization component
4. `~/routes/index.tsx` - Updated main page with habit list and combined heatmap
5. `~/routes/habits.$habitId.tsx` - Individual habit detail page with heatmap
6. Updated `~/components/Header.tsx` - Add navigation to individual habits

### Definition of Done

- User can add habits with name and color
- User can check in daily with commit message
- Combined heatmap shows all habits (1+ check-in = colored square)
- Individual habit pages show per-habit heatmap
- Data persists across page reloads
- UI follows Shadcn/ui design patterns

### Must Have

- Add/delete habits
- Binary daily check-in
- Commit message per check-in
- Full-year heatmap (52 weeks)
- Combined view (all habits)
- Individual habit view
- localStorage persistence

### Must NOT Have (Guardrails)

- Counter-based tracking (only binary)
- Backend/API integration
- Authentication
- Statistics/analytics beyond streak count
- Reminders/notifications
- Data export/import
- Multi-user support
- Rich text for commit messages
- Test files
- Over-commented code

---

## Verification Strategy

### Test Decision

- **Infrastructure exists**: YES (Vitest configured but won't use)
- **Automated tests**: None
- **Framework**: N/A

### Agent-Executed QA Scenarios (MANDATORY)

Every task must be verifiable via Playwright or direct browser interaction. No human intervention required.

**Verification Tools**:

- **Frontend/UI**: Playwright (navigate, fill, click, assert, screenshot)
- **localStorage**: Browser DevTools or Playwright page.evaluate()

---

## Execution Strategy

### Sequential Dependencies

```
Task 1: Types & Storage Layer
    ↓
Task 2: Heatmap Component
    ↓
Task 3: Habit List & Combined View
    ↓
Task 4: Individual Habit Route
    ↓
Task 5: Integration & Navigation
```

**No Parallel Tasks**: Each task depends on the previous. Execute sequentially.

---

## TODOs

---

- [x] 1. Create Types and Storage Layer

  **What to do**:
  - Define types in `~/types/habit.ts`: Habit, CheckIn, HeatmapData
  - Create storage utilities in `~/lib/storage.ts`
  - Implement load/save to localStorage with error handling
  - Add migration/versioning for future compatibility

  **Must NOT do**:
  - Add encryption (not required)
  - Add sync functionality
  - Add complex data validation

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `frontend-ui-ux`
  - **Justification**: Straightforward TypeScript types and localStorage utilities

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Sequential**: Must complete before other tasks
  - **Blocks**: Tasks 2, 3, 4, 5
  - **Blocked By**: None

  **References**:
  - `~/src/routes/index.tsx` - Current Habit type definition (inline)
  - `~/src/lib/utils.ts` - Utility patterns (cn function)
  - localStorage API: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: Types compile without errors
    Tool: Bash
    Steps:
      1. Run: pnpm tsc --noEmit
      2. Assert: No TypeScript errors in new files
    Expected Result: Clean TypeScript compilation

  Scenario: localStorage save and load works
    Tool: Playwright
    Preconditions: Dev server running on localhost:3000
    Steps:
      1. Navigate to http://localhost:3000
      2. Open DevTools console
      3. Execute: localStorage.setItem('kuse_habits', JSON.stringify([{id: '1', name: 'Test', color: '#ff0000', createdAt: new Date().toISOString()}]))
      4. Refresh page
      5. Execute in console: JSON.parse(localStorage.getItem('kuse_habits') || '[]')
      6. Assert: Returns array with test habit
    Expected Result: Data persists in localStorage
    Evidence: Screenshot of DevTools console showing data
  ```

  **Commit**: YES
  - Message: `feat: add types and localStorage persistence`
  - Files: `~/types/habit.ts`, `~/lib/storage.ts`

---

- [x] 2. Build Heatmap Component

  **What to do**:
  - Create `~/components/Heatmap.tsx`
  - Implement SVG-based grid: 7 rows (days) x 53 columns (weeks)
  - Calculate date positions for full year view
  - Implement 5-level color intensity (GitHub style)
  - Add Shadcn/ui Tooltip for date/details on hover
  - Support both combined view (any check-in) and single habit view

  **Must NOT do**:
  - Use external heatmap libraries
  - Implement animations (keep it simple)
  - Add filtering/sorting (not required)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `frontend-ui-ux`
  - **Justification**: SVG visualization with precise positioning and styling

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Sequential**: Depends on Task 1 (types defined)
  - **Blocks**: Tasks 3, 4, 5
  - **Blocked By**: Task 1

  **References**:
  - Heatmap patterns from research:
    - SVG grid: 7 rows × 53 columns
    - Color levels: 0=#ebedf0, 1=#9be9a8, 2=#40c463, 3=#30a14e, 4=#216e39
    - Date calculation: startDate + (weekIndex _ 7 + dayIndex) _ 86400000
  - Shadcn/ui Tooltip: `pnpm dlx shadcn@latest add tooltip`
  - `~/src/styles.css` - CSS variables for theming

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: Heatmap renders 365 squares
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to http://localhost:3000
      2. Add a test habit via UI
      3. Wait for: .heatmap-grid visible (timeout: 5s)
      4. Count: document.querySelectorAll('.heatmap-cell').length
      5. Assert: Count equals approximately 365-371 (full year)
    Expected Result: Grid shows full year of squares
    Evidence: Screenshot of heatmap

  Scenario: Tooltip shows on hover
    Tool: Playwright
    Steps:
      1. Navigate to http://localhost:3000
      2. Add habit and check in for today
      3. Hover over today's cell in heatmap
      4. Wait for: [role="tooltip"] visible (timeout: 3s)
      5. Assert: Tooltip contains date text
    Expected Result: Tooltip appears with date information
    Evidence: Screenshot showing tooltip

  Scenario: Different colors for different activity levels
    Tool: Playwright
    Steps:
      1. Navigate to http://localhost:3000
      2. Create habit with check-ins on 3 different days
      3. Inspect heatmap cells
      4. Assert: At least 2 different fill colors visible
    Expected Result: Cells show varying color intensities
    Evidence: Screenshot of colored grid
  ```

  **Commit**: YES
  - Message: `feat: add heatmap component`
  - Files: `~/components/Heatmap.tsx`

---

- [x] 3. Update Main Page with Combined View

  **What to do**:
  - Update `~/routes/index.tsx`
  - Integrate storage layer for persistence
  - Add check-in functionality with commit message input
  - Display combined heatmap (any habit check-in = colored)
  - Show list of habits with check-in buttons
  - Add delete habit functionality

  **Must NOT do**:
  - Add complex filtering
  - Add statistics/charts
  - Add habit categories/tags

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `frontend-ui-ux`
  - **Justification**: UI integration with existing TanStack Router patterns

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Sequential**: Depends on Tasks 1, 2
  - **Blocks**: Task 5
  - **Blocked By**: Tasks 1, 2

  **References**:
  - `~/src/routes/index.tsx` - Current implementation to update
  - `~/src/components/Header.tsx` - Navigation patterns
  - Shadcn/ui components: Button, Input, Card
  - localStorage usage: `~/lib/storage.ts` (from Task 1)

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: Add new habit
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to http://localhost:3000
      2. Fill: input[name="habitName"] → "Exercise"
      3. Select: color picker → green
      4. Click: button "Add Habit"
      5. Wait for: .habit-list visible
      6. Assert: Text "Exercise" appears in habit list
      7. Refresh page
      8. Assert: "Exercise" still in list (persisted)
    Expected Result: Habit added and persisted
    Evidence: Screenshot before and after refresh

  Scenario: Daily check-in with message
    Tool: Playwright
    Steps:
      1. Navigate to http://localhost:3000
      2. Add habit "Read"
      3. Fill: input[name="message"] → "Finished Chapter 3"
      4. Click: Check-in button for "Read" habit
      5. Wait for: .heatmap-cell colored (timeout: 3s)
      6. Assert: Today's cell has non-empty color
      7. Hover: Today's cell
      8. Assert: Tooltip contains "Finished Chapter 3"
    Expected Result: Check-in recorded with message
    Evidence: Screenshot of heatmap with tooltip

  Scenario: Combined heatmap shows any activity
    Tool: Playwright
    Steps:
      1. Navigate to http://localhost:3000
      2. Add habit "Meditate"
      3. Check in for "Meditate"
      4. Add habit "Code"
      5. Check in for "Code"
      6. Inspect: Combined heatmap cells
      7. Assert: Both check-ins reflected in combined view
    Expected Result: Combined view aggregates all habits
    Evidence: Screenshot of heatmap
  ```

  **Commit**: YES
  - Message: `feat: add check-in and combined heatmap`
  - Files: `~/routes/index.tsx`

---

- [x] 4. Create Individual Habit Route

  **What to do**:
  - Create `~/routes/habits.$habitId.tsx`
  - Display single habit details
  - Show individual heatmap for this habit only
  - List check-in history with messages
  - Add back button to main page

  **Must NOT do**:
  - Add habit editing (delete and recreate instead)
  - Add complex analytics
  - Add share functionality

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `frontend-ui-ux`
  - **Justification**: Similar to Task 3 but for single habit view

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Sequential**: Depends on Tasks 1, 2
  - **Blocks**: Task 5
  - **Blocked By**: Tasks 1, 2

  **References**:
  - `~/src/routes/index.tsx` - Patterns for habit display
  - `~/components/Heatmap.tsx` - Reuse heatmap component
  - TanStack Router dynamic routes: filename with $param

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: Navigate to individual habit page
    Tool: Playwright
    Preconditions: Dev server running, at least 1 habit exists
    Steps:
      1. Navigate to http://localhost:3000
      2. Add habit "Journal"
      3. Click: habit name link or detail button
      4. Wait for: URL contains /habits/
      5. Assert: H1 contains "Journal"
      6. Assert: Heatmap visible
    Expected Result: Individual habit page loads
    Evidence: Screenshot of habit detail page

  Scenario: Individual heatmap shows only this habit
    Tool: Playwright
    Steps:
      1. Navigate to http://localhost:3000
      2. Add habit "Run"
      3. Check in for "Run"
      4. Add habit "Swim"
      5. DO NOT check in for "Swim"
      6. Navigate to /habits/{run-habit-id}
      7. Inspect: Heatmap cells
      8. Assert: Run check-in visible
      9. Navigate to /habits/{swim-habit-id}
      10. Assert: All cells empty (no check-ins)
    Expected Result: Heatmap filtered to single habit
    Evidence: Screenshots of both habit pages

  Scenario: Check-in history displayed
    Tool: Playwright
    Steps:
      1. Navigate to individual habit page
      2. Check in with message "Day 1"
      3. Check in with message "Day 2"
      4. Wait for: .checkin-list visible
      5. Assert: List contains "Day 1"
      6. Assert: List contains "Day 2"
    Expected Result: History shows all check-ins
    Evidence: Screenshot of check-in list
  ```

  **Commit**: YES
  - Message: `feat: add individual habit page`
  - Files: `~/routes/habits.$habitId.tsx`

---

- [x] 5. Add Navigation and Polish

  **What to do**:
  - Update `~/components/Header.tsx` - Add links if needed
  - Add click handler on habit names in main list to navigate to detail
  - Ensure responsive design works on mobile
  - Add loading states
  - Verify all interactions work end-to-end

  **Must NOT do**:
  - Add complex animations
  - Add theme switching
  - Add user preferences

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `frontend-ui-ux`
  - **Justification**: Final integration and polish

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Sequential**: Final integration task
  - **Blocks**: None
  - **Blocked By**: Tasks 3, 4

  **References**:
  - `~/src/components/Header.tsx` - Current navigation
  - `~/src/routes/__root.tsx` - Root layout
  - TanStack Router Link component

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: Complete user flow
    Tool: Playwright
    Steps:
      1. Navigate to http://localhost:3000
      2. Add habit "Drink Water"
      3. Check in with message "8 glasses today"
      4. Click: habit name to go to detail page
      5. Assert: On detail page for "Drink Water"
      6. Click: back button or home link
      7. Assert: Back on main page
      8. Refresh page
      9. Assert: Data still present
    Expected Result: Full CRUD flow works
    Evidence: Screenshots at each step

  Scenario: Mobile responsive
    Tool: Playwright
    Steps:
      1. Set viewport: 375x667 (iPhone SE)
      2. Navigate to http://localhost:3000
      3. Add test habit
      4. Assert: No horizontal overflow
      5. Assert: All buttons clickable
    Expected Result: Works on mobile
    Evidence: Mobile viewport screenshot

  Scenario: Empty state handled
    Tool: Playwright
    Steps:
      1. Clear localStorage: localStorage.removeItem('kuse_habits')
      2. Refresh page
      3. Assert: Page shows "No habits yet" or similar
      4. Assert: Add habit form visible and working
    Expected Result: Graceful empty state
    Evidence: Screenshot of empty state
  ```

  **Commit**: YES
  - Message: `feat: add navigation and polish`
  - Files: `~/components/Header.tsx`, `~/routes/index.tsx`

---

## Commit Strategy

| After Task | Message                                        | Files                                  |
| ---------- | ---------------------------------------------- | -------------------------------------- |
| 1          | `feat: add types and localStorage persistence` | `~/types/habit.ts`, `~/lib/storage.ts` |
| 2          | `feat: add heatmap component`                  | `~/components/Heatmap.tsx`             |
| 3          | `feat: add check-in and combined heatmap`      | `~/routes/index.tsx`                   |
| 4          | `feat: add individual habit page`              | `~/routes/habits.$habitId.tsx`         |
| 5          | `feat: add navigation and polish`              | `~/components/Header.tsx`              |

---

## Success Criteria

### Verification Commands

```bash
# TypeScript compilation
pnpm tsc --noEmit

# Dev server starts
pnpm dev

# Build succeeds
pnpm build
```

### Final Checklist

- [x] Add habit with name and color
- [x] Delete habit
- [x] Check in daily with commit message
- [x] Combined heatmap shows all activity
- [x] Individual habit pages show per-habit heatmap
- [x] Data persists in localStorage across reloads
- [x] Navigation between pages works
- [x] Mobile responsive
- [x] No console errors
- [x] No TypeScript errors
- [x] Code is minimal and readable

---

## Implementation Notes

### Data Structure

```typescript
// ~/types/habit.ts
type Habit = {
  id: string
  name: string
  color: string
  createdAt: string
}

type CheckIn = {
  habitId: string
  date: string // ISO date
  message: string
}

type StorageData = {
  habits: Habit[]
  checkIns: CheckIn[]
  version: 1
}
```

### Heatmap Grid

- 53 columns (weeks in year)
- 7 rows (days: Sun-Sat)
- Square size: 10-12px
- Gap: 2-3px
- Colors: 5 levels (GitHub style)

### localStorage Keys

- `kuse_habits` - Habits array
- `kuse_checkins` - CheckIns array

### Color Calculation

```typescript
const COLORS = ['var(--heatmap-0, #ebedf0)', 'var(--heatmap-1, #9be9a8)', 'var(--heatmap-2, #40c463)', 'var(--heatmap-3, #30a14e)', 'var(--heatmap-4, #216e39)']
```

---

**Plan generated by Prometheus**
**Date**: 2026-02-07
**Requirements**: Minimal habit tracker with localStorage persistence and GitHub-style heatmap
