# AGENTS.md - kuse

> A GitHub heatmap-style habit tracker web app built with TanStack Start

## Project Overview

**kuse** is a habit tracker web application featuring a GitHub-style contribution heatmap visualization. Built with modern React and TanStack ecosystem.

- **Framework**: TanStack Start + TanStack Router
- **Frontend**: React 19, TypeScript 5.9
- **Styling**: Tailwind CSS v4, Shadcn/ui
- **Build Tool**: Vite 7
- **Testing**: Vitest + @testing-library/react

## Build Commands

```bash
# Development server
pnpm dev

# Production build
pnpm build

# Preview production build
pnpm preview

# Run all tests
pnpm test

# Run single test file
pnpm test <filename>.test.tsx
# OR: npx vitest run <filename>.test.tsx

# Update dependencies
pnpm up
```

## Code Style Guidelines

### Imports

- Use `~/` alias for all internal imports (CHANGED from `@/`)
- External library imports first, then internal imports
- Group imports: React/framework → libraries → internal (~/\*) → relative

```typescript
// Good
import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { cn } from '~/lib/utils'
import { Header } from '~/components/Header'

// Bad - mixing order or using wrong alias
import { Header } from '@/components/Header'
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
  routes/           # TanStack file-based routes
  lib/              # Utilities, helpers
  data/             # Data types, mock data (remove demo files!)
  styles.css        # Global styles + Tailwind
```

## Important Notes

### Path Alias Migration

⚠️ **CRITICAL**: This codebase is migrating from `@/` to `~/` alias:

- Update `tsconfig.json`: `"~/*": ["./src/*"]`
- Update `vite.config.ts`: `'~': fileURLToPath(new URL('./src', import.meta.url))`
- Update `components.json` aliases accordingly
- Replace all `@/` imports with `~/`

### Demo Files to Remove

The following demo/template files should be cleared/deleted:

- `src/routes/demo/*` - All demo route files
- `src/data/demo.punk-songs.ts` - Demo data
- Demo links in `src/components/Header.tsx`
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
3. Clear demo files before implementing features
4. Use `~/` alias for all internal imports
5. Follow strict TypeScript - no shortcuts
6. Test with `pnpm test` before committing changes

## Project Context

kuse is a habit tracker with:

- GitHub-style contribution heatmap visualization
- Daily habit tracking and streaks
- Color-coded habit categories
- Progress statistics and insights

Build a clean, focused UI that puts the habit heatmap front and center.
