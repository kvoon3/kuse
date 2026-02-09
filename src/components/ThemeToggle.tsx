import { Moon, Sun } from 'lucide-react'

import { useTheme } from '~/components/ThemeProvider'
import { cn } from '~/lib/utils'

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'p-2 rounded-lg',
        'bg-secondary text-secondary-foreground',
        'hover:bg-secondary/80',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'transition-colors duration-200',
        className
      )}
      aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {resolvedTheme === 'dark' ? <Sun className='h-5 w-5' aria-hidden='true' /> : <Moon className='h-5 w-5' aria-hidden='true' />}
    </button>
  )
}
