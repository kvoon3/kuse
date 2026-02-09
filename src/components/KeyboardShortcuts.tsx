import { Keyboard } from 'lucide-react'
import { useEffect, useRef } from 'react'

import { cn } from '~/lib/utils'

type KeyboardShortcutsProps = {
  isOpen: boolean
  onClose: () => void
}

type ShortcutItem = {
  key: string
  description: string
}

const SHORTCUTS: ShortcutItem[] = [
  { key: '?', description: 'Toggle keyboard shortcuts' },
  { key: 'Ctrl + N', description: 'Focus new habit input' },
  { key: 'Space', description: 'Toggle habit check' },
  { key: 'J / ↓', description: 'Next habit' },
  { key: 'K / ↑', description: 'Previous habit' },
  { key: 'Delete / Backspace', description: 'Delete focused habit' },
  { key: 'Tab', description: 'Navigate between elements' },
]

export function KeyboardShortcuts({ isOpen, onClose }: KeyboardShortcutsProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      panelRef.current?.focus()
    }

    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      <div className='fixed inset-0 bg-black/20 z-40' onClick={onClose} aria-hidden='true' />
      <div
        ref={panelRef}
        tabIndex={-1}
        role='dialog'
        aria-modal='true'
        aria-labelledby='keyboard-shortcuts-title'
        className={cn(
          'fixed bottom-20 right-4 z-50 w-80',
          'bg-card border border-base rounded-lg shadow-lg',
          'p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
        )}
      >
        <div className='flex items-center justify-between mb-4'>
          <h2 id='keyboard-shortcuts-title' className='text-lg font-semibold text-base'>
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className='text-muted  p-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            aria-label='Close keyboard shortcuts'
          >
            <span aria-hidden='true'>×</span>
          </button>
        </div>

        <dl className='space-y-2'>
          {SHORTCUTS.map(({ key, description }) => (
            <div key={key} className='flex items-center justify-between'>
              <dt className='text-muted text-sm'>{description}</dt>
              <dd>
                <kbd
                  className={cn(
                    'inline-flex items-center justify-center',
                    'px-2 py-1 text-xs font-medium',
                    'bg-muted text-muted-foreground rounded',
                    'border border-base',
                    'min-w-[2rem]'
                  )}
                >
                  {key}
                </kbd>
              </dd>
            </div>
          ))}
        </dl>

        <p className='mt-4 text-xs text-muted'>
          Press <kbd className='px-1 py-0.5 bg-muted rounded border border-base'>?</kbd> anytime to toggle this panel
        </p>
      </div>
    </>
  )
}

export function KeyboardShortcutsButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'fixed bottom-4 right-4 z-30',
        'w-12 h-12 rounded-full',
        'bg-muted text-muted-foreground',
        'flex items-center justify-center',
        'shadow-lg hover:bg-secondary hover:text-secondary-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'transition-colors duration-200'
      )}
      aria-label='Show keyboard shortcuts (press ?)'
      title='Keyboard shortcuts (?)'
    >
      <Keyboard className='h-6 w-6' aria-hidden='true' />
    </button>
  )
}
