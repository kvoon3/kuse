import { Link } from '@tanstack/react-router'

import { ThemeToggle } from '~/components/ThemeToggle'
import { cn } from '~/lib/utils'

export function Header({ className }: { className?: string }) {
  return (
    <header className={cn('sticky top-0 z-40', 'w-full', 'border-b border-base', 'bg-base/80 backdrop-blur-sm', className)}>
      <div className='max-w-3xl mx-auto px-4 h-14 flex items-center justify-between'>
        <Link
          to='/'
          className={cn(
            'text-lg font-semibold',
            'text-base',
            'hover:opacity-80',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'rounded-md px-2 -ml-2'
          )}
          aria-label='Kuse - Habit Tracker'
        >
          Kuse
        </Link>

        <ThemeToggle />
      </div>
    </header>
  )
}
