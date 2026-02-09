import { forwardRef, useEffect, useImperativeHandle, useRef, type KeyboardEvent } from 'react'

import { cn } from '~/lib/utils'

import type { Habit } from '~/types/habit'

type HabitItemProps = {
  habit: Habit
  isChecked: boolean
  isFocused: boolean
  onToggle: () => void
  onDelete: () => void
  onFocus: () => void
  onNavigate: (direction: 'up' | 'down') => void
}

export const HabitItem = forwardRef<HTMLLIElement, HabitItemProps>(function HabitItem(
  { habit, isChecked, isFocused, onToggle, onDelete, onFocus, onNavigate },
  ref
) {
  const itemRef = useRef<HTMLLIElement>(null)

  useImperativeHandle(ref, () => itemRef.current!)

  useEffect(() => {
    if (isFocused) {
      itemRef.current?.focus()
    }
  }, [isFocused])

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case ' ':
      case 'Spacebar':
        e.preventDefault()
        onToggle()
        break
      case 'j':
      case 'ArrowDown':
        e.preventDefault()
        onNavigate('down')
        break
      case 'k':
      case 'ArrowUp':
        e.preventDefault()
        onNavigate('up')
        break
      case 'Delete':
      case 'Backspace':
        if (document.activeElement === itemRef.current) {
          e.preventDefault()
          onDelete()
        }
        break
    }
  }

  return (
    <li
      ref={itemRef}
      tabIndex={0}
      onFocus={onFocus}
      onKeyDown={handleKeyDown}
      className={cn(
        'flex items-center justify-between p-3 sm:p-4 border border-base rounded-lg bg-card',
        'min-h-[56px] sm:min-h-[48px]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus:bg-muted',
        isFocused && 'bg-muted ring-2 ring-ring'
      )}
      role='listitem'
      aria-selected={isFocused}
    >
      <div className='flex items-center gap-3 sm:gap-4 min-w-0 flex-1'>
        <input
          type='checkbox'
          id={`habit-${habit.id}`}
          checked={isChecked}
          onChange={onToggle}
          className='w-5 h-5 sm:w-4 sm:h-4 flex-shrink-0 cursor-pointer'
          tabIndex={-1}
          aria-label={`Mark ${habit.name} as ${isChecked ? 'not completed' : 'completed'}`}
        />
        <label
          htmlFor={`habit-${habit.id}`}
          className={cn(isChecked ? 'line-through text-muted' : '', 'cursor-pointer select-none text-base sm:text-sm truncate')}
        >
          {habit.name}
        </label>
      </div>
      <button
        onClick={onDelete}
        className='text-muted hover:text-base text-lg sm:text-sm p-2 sm:p-1 -mr-2 sm:mr-0 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring flex-shrink-0 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center'
        aria-label={`Delete ${habit.name}`}
        title={`Delete ${habit.name}`}
        tabIndex={-1}
      >
        ×
      </button>
    </li>
  )
})
