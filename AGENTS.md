# AGENTS.md - kuse

> A GitHub heatmap-style habit tracker web app built with TanStack Start

## Project Overview

**kuse** is a habit tracker web application featuring a GitHub-style contribution heatmap visualization. Built with modern React and TanStack ecosystem.

- **Framework**: TanStack Start + TanStack Router
- **Frontend**: React 19, TypeScript 5.9
- **Styling**: Tailwind CSS v4, Shadcn/ui
- **State**: react-use (`useLocalStorage` for persistence)
- **Build Tool**: Vite 7
- **Testing**: Vitest + @testing-library/react

## Code Style Guidelines

### Imports

- Accessibility is a first-class consideration – always consider ARIA attributes and keyboard navigation

```typescript
// Good
import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useLocalStorage } from 'react-use'
import { cn } from '~/lib/utils'
import { Heatmap } from '~/components/Heatmap'

// Bad - mixing order or using wrong alias
import { Heatmap } from '@/components/Heatmap'
import { useState } from 'react'
```

### TypeScript

- **Strict mode enabled** - no `any`, no `@ts-ignore`
- Always define return types for exported functions
- Use `type` over `interface` for object shapes
- No unused locals/parameters (compiler enforced)

```typescript
// Good
export type Habit = {
  id: string
  name: string
  color: string
  createdAt: Date
}

export function calculateStreak(habit: Habit): number {
  // implementation
}

// Bad - implicit any, missing types
function calculateStreak(habit) {
  // ...
}
```

### Naming Conventions

- Components: PascalCase (`HabitCard.tsx`)
- Functions/variables: camelCase (`getHabits()`)
- Constants: UPPER_SNAKE_CASE for true constants
- Types: PascalCase with descriptive names
- Route files: lowercase with dots (TanStack convention: `habits.index.tsx`)

### Component Patterns

- Use function declarations for components
- Destructure props in parameter
- Prefer composition over configuration
- Use `cn()` utility from `~/lib/utils` for conditional classes

```typescript
// Good
import { cn } from '~/lib/utils'

export function HabitCard({
  habit,
  className
}: {
  habit: Habit
  className?: string
}) {
  return (
    <div className={cn('rounded-lg border', className)}>
      {/* content */}
    </div>
  )
}
```

### Styling (Tailwind CSS v4)

- Use CSS variables from `src/styles.css` for theming
- Prefer utility classes over arbitrary values
- Use `cn()` for conditional classes
- Dark mode supported via `dark:` variant

### Error Handling

- Use explicit error boundaries for route errors
- Server functions should return typed errors
- Never suppress errors with empty catch blocks
- Log errors before handling them

### File Organization

```
src/
  components/        # React components
    ui/              # Shadcn/ui components
  routes/           # TanStack file-based routes
  lib/              # Utilities, helpers
  types/            # TypeScript type definitions
  styles.css        # Global styles + Tailwind
```

## Important Notes

### Path Alias Migration

✅ **COMPLETED**: Migrated from `@/` to `~/` alias. All imports now use `~/`.

### State Management

Use `useLocalStorage` from `react-use` for client-side persistence:

```typescript
const [habits, setHabits] = useLocalStorage<Habit[]>('habits', [])
```

- Auto-persists to localStorage on every state change
- Auto-loads from localStorage on mount
- No manual useEffect sync needed
- Fully type-safe

### Demo Files to Remove

The following demo/template files should be cleared/deleted:

- `src/routes/demo/*` - All demo route files
- `src/data/demo.punk-songs.ts` - Demo data
- Replace `src/routes/index.tsx` landing page with habit tracker UI

### Route Conventions (TanStack Router)

- Routes auto-generated from `src/routes/` file structure
- Layout route: `__root.tsx`
- Index route: `index.tsx`
- Nested routes use dot notation: `habits.index.tsx`
- Dynamic params use `$`: `habits.$habitId.tsx`

### Testing

- Co-locate tests next to source files: `Component.test.tsx`
- Use @testing-library/react for component tests
- Use jsdom environment (configured in Vitest)
- Run single test: `pnpm test Component.test.tsx`

### Shadcn/ui Components

- Add components: `pnpm dlx shadcn@latest add <component>`
- Components install to `~/components/ui/`
- Customize in component files directly
- Uses Lucide React for icons

## Quick Start for Agents

1. Install dependencies: `pnpm install`
2. Start dev server: `pnpm dev`
3. Use `~/` alias for all internal imports
4. Follow strict TypeScript - no shortcuts
5. Test with `pnpm test` before committing changes

## Project Context

kuse is a habit tracker with:

- GitHub-style contribution heatmap visualization
- Daily habit tracking (checkbox toggle)
- Minimalist UI design (flat borders, white background)
- `useLocalStorage` from react-use for automatic persistence

Build a clean, focused UI that puts the habit heatmap front and center.
