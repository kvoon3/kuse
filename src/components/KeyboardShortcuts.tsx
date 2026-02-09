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
          'bg-white border border-slate-200 rounded-lg shadow-lg',
          'p-4 focus:outline-none focus:ring-2 focus:ring-slate-400'
        )}
      >
        <div className='flex items-center justify-between mb-4'>
          <h2 id='keyboard-shortcuts-title' className='text-lg font-semibold text-slate-900'>
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className='text-slate-400 hover:text-slate-600 p-1 rounded focus:outline-none focus:ring-2 focus:ring-slate-400'
            aria-label='Close keyboard shortcuts'
          >
            <span aria-hidden='true'>×</span>
          </button>
        </div>

        <dl className='space-y-2'>
          {SHORTCUTS.map(({ key, description }) => (
            <div key={key} className='flex items-center justify-between'>
              <dt className='text-slate-600 text-sm'>{description}</dt>
              <dd>
                <kbd
                  className={cn(
                    'inline-flex items-center justify-center',
                    'px-2 py-1 text-xs font-medium',
                    'bg-slate-100 text-slate-700 rounded',
                    'border border-slate-200',
                    'min-w-[2rem]'
                  )}
                >
                  {key}
                </kbd>
              </dd>
            </div>
          ))}
        </dl>

        <p className='mt-4 text-xs text-slate-500'>
          Press <kbd className='px-1 py-0.5 bg-slate-100 rounded border border-slate-200'>?</kbd> anytime to toggle this panel
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
        'bg-slate-900 text-white',
        'flex items-center justify-center',
        'shadow-lg hover:bg-slate-800',
        'focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2',
        'transition-colors duration-200'
      )}
      aria-label='Show keyboard shortcuts (press ?)'
      title='Keyboard shortcuts (?)'
    >
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='24'
        height='24'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
        aria-hidden='true'
      >
        <path d='M10 9a3 3 0 0 1 3-3 3 3 0 0 1 3 3 3 3 0 0 1-3 3h-1' />
        <path d='M14 17h-1a2 2 0 0 1-2-2 2 2 0 0 1 2-2h1' />
        <rect x='2' y='4' width='20' height='16' rx='2' />
        <line x1='6' y1='8' x2='6' y2='8.01' />
        <line x1='18' y1='8' x2='18' y2='8.01' />
        <line x1='6' y1='16' x2='6' y2='16.01' />
        <line x1='18' y1='16' x2='18' y2='16.01' />
      </svg>
    </button>
  )
}
