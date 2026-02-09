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
        'flex items-center justify-between p-3 border border-slate-200 rounded',
        'focus:outline-none focus:ring-2 focus:ring-slate-400 focus:bg-slate-50',
        isFocused && 'bg-slate-50 ring-2 ring-slate-400'
      )}
      role='listitem'
      aria-selected={isFocused}
    >
      <div className='flex items-center gap-3'>
        <input
          type='checkbox'
          id={`habit-${habit.id}`}
          checked={isChecked}
          onChange={onToggle}
          className='w-4 h-4'
          tabIndex={-1}
          aria-label={`Mark ${habit.name} as ${isChecked ? 'not completed' : 'completed'}`}
        />
        <label htmlFor={`habit-${habit.id}`} className={cn(isChecked ? 'line-through text-slate-500' : '', 'cursor-pointer select-none')}>
          {habit.name}
        </label>
      </div>
      <button
        onClick={onDelete}
        className='text-slate-400 hover:text-slate-600 text-sm p-1 rounded focus:outline-none focus:ring-2 focus:ring-slate-400'
        aria-label={`Delete ${habit.name}`}
        title={`Delete ${habit.name}`}
        tabIndex={-1}
      >
        ×
      </button>
    </li>
  )
})
