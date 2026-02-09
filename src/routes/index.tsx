import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocalStorage } from 'react-use'

import { HabitItem } from '~/components/HabitItem'
import { Heatmap } from '~/components/Heatmap'
import { KeyboardShortcuts, KeyboardShortcutsButton } from '~/components/KeyboardShortcuts'
import { toLocalDateStr } from '~/lib/utils'

import type { Habit, CheckIn } from '~/types/habit'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const [habits, setHabits] = useLocalStorage<Habit[]>('habits', [])
  const [checkIns, setCheckIns] = useLocalStorage<CheckIn[]>('checkIns', [])
  const [liveRegionText, setLiveRegionText] = useState('')
  const [focusedHabitId, setFocusedHabitId] = useState<string | null>(null)
  const [newlyAddedId, setNewlyAddedId] = useState<string | null>(null)
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const habitRefs = useRef<Map<string, HTMLLIElement>>(new Map())

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        inputRef.current?.focus()
        return
      }

      if (
        e.key === '?' &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        e.target instanceof HTMLElement &&
        e.target.tagName !== 'INPUT' &&
        e.target.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault()
        setShowKeyboardShortcuts((prev) => !prev)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (newlyAddedId && focusedHabitId === newlyAddedId) {
      setNewlyAddedId(null)
    }
  }, [newlyAddedId, focusedHabitId])

  const announce = useCallback((message: string) => {
    setLiveRegionText(message)
    setTimeout(() => setLiveRegionText(''), 1000)
  }, [])

  const addHabit = (name: string): void => {
    if (!name.trim()) return
    const newHabit: Habit = {
      id: crypto.randomUUID(),
      name: name.trim(),
      color: 'default',
      createdAt: new Date().toISOString(),
    }
    setHabits([...(habits || []), newHabit])
    setNewlyAddedId(newHabit.id)
    setFocusedHabitId(newHabit.id)
    announce(`Added habit: ${newHabit.name}`)
  }

  const deleteHabit = (id: string, name: string): void => {
    const currentIndex = habits?.findIndex((h) => h.id === id) ?? -1
    setHabits(habits?.filter((h) => h.id !== id) || [])
    setCheckIns(checkIns?.filter((c) => c.habitId !== id) || [])
    announce(`Deleted habit: ${name}`)

    if (habits && habits.length > 1) {
      const nextIndex = Math.min(currentIndex, habits.length - 2)
      const nextHabit = habits[nextIndex === currentIndex ? nextIndex + 1 : nextIndex]
      if (nextHabit && nextHabit.id !== id) {
        setFocusedHabitId(nextHabit.id)
      } else if (habits.length > 1) {
        setFocusedHabitId(habits[0].id)
      }
    }
  }

  const toggleCheckIn = (habitId: string, habitName: string): void => {
    const today = toLocalDateStr(new Date())
    const existing = checkIns?.find((c) => c.habitId === habitId && toLocalDateStr(new Date(c.date)) === today)

    if (existing) {
      setCheckIns(checkIns?.filter((c) => c !== existing) || [])
      announce(`Unchecked: ${habitName}`)
    } else {
      setCheckIns([...(checkIns || []), { habitId, date: new Date().toISOString(), message: '' }])
      announce(`Checked: ${habitName}`)
    }
  }

  const isCheckedToday = (habitId: string): boolean => {
    const today = toLocalDateStr(new Date())
    return checkIns?.some((c) => c.habitId === habitId && toLocalDateStr(new Date(c.date)) === today) || false
  }

  const handleNavigate = (habitId: string, direction: 'up' | 'down') => {
    if (!habits) return
    const currentIndex = habits.findIndex((h) => h.id === habitId)
    if (currentIndex === -1) return

    let newIndex: number
    if (direction === 'up') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : habits.length - 1
    } else {
      newIndex = currentIndex < habits.length - 1 ? currentIndex + 1 : 0
    }

    setFocusedHabitId(habits[newIndex].id)
  }

  return (
    <div className='p-3 sm:p-4 pt-4 sm:pt-6'>
      <a href='#main-content' className='skip-link'>
        Skip to main content
      </a>

      <div className='max-w-6xl mx-auto'>
        {habits && habits.length > 0 && (
          <div className='mb-6 sm:mb-8 p-3 sm:p-4 border border-base rounded-lg bg-card overflow-hidden' role='region' aria-label='Activity overview'>
            <Heatmap checkIns={checkIns || []} />
          </div>
        )}

        <main id='main-content' role='main'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6'>
            <section aria-label='Your habits' className='w-full min-w-0'>
              <h2 className='text-lg font-semibold mb-3 px-1'>Habits</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const input = e.currentTarget.elements.namedItem('habit') as HTMLInputElement
                  addHabit(input.value)
                  input.value = ''
                }}
                className='flex gap-2 mb-4'
                aria-label='Add new habit'
              >
                <input
                  ref={inputRef}
                  id='habit-input'
                  name='habit'
                  type='text'
                  placeholder='New habit...'
                  aria-label='New habit name'
                  aria-describedby='habit-help shortcut-help'
                  className='flex-1 min-w-0 px-3 py-2.5 sm:py-2 text-base sm:text-sm border border-base rounded-lg bg-base focus:outline-none focus:ring-2 focus-visible:ring-ring'
                />
                <button
                  type='submit'
                  className='px-4 sm:px-6 py-2.5 sm:py-2 bg-primary-solid text-inverted rounded-lg hover:bg-primary-solid-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring whitespace-nowrap'
                  aria-label='Add habit'
                >
                  Add
                </button>
              </form>

              <p id='habit-help' className='sr-only'>
                Enter a habit name and press Add or Enter to create it
              </p>
              <p id='shortcut-help' className='sr-only'>
                Press Control N to quickly focus this input, use J and K or arrow keys to navigate habits, Space to toggle
              </p>

              <ul className='space-y-2 sm:space-y-3' role='list'>
                {habits?.map((habit) => (
                  <HabitItem
                    ref={(el) => {
                      if (el) {
                        habitRefs.current.set(habit.id, el)
                      }
                    }}
                    key={habit.id}
                    habit={habit}
                    isChecked={isCheckedToday(habit.id)}
                    isFocused={focusedHabitId === habit.id}
                    onToggle={() => toggleCheckIn(habit.id, habit.name)}
                    onDelete={() => deleteHabit(habit.id, habit.name)}
                    onFocus={() => setFocusedHabitId(habit.id)}
                    onNavigate={(direction) => handleNavigate(habit.id, direction)}
                  />
                ))}
              </ul>

              {habits && habits.length === 0 && (
                <p className='text-center text-muted py-12' role='status'>
                  No habits yet. Add one above!
                </p>
              )}
            </section>

            <section aria-label='Todo list' className='w-full min-w-0'>
              <h2 className='text-lg font-semibold mb-3 px-1'>Todo List</h2>
              <div className='p-4 sm:p-6 border border-dashed border-base rounded-lg bg-muted/30 text-center'>
                <p className='text-muted text-sm sm:text-base'>Todo list coming soon...</p>
                <p className='text-muted-foreground text-xs sm:text-sm mt-2'>Track your daily tasks here</p>
              </div>
            </section>
          </div>
        </main>
      </div>

      <div className='sr-only' role='status' aria-live='polite' aria-atomic='true'>
        {liveRegionText}
      </div>

      <KeyboardShortcutsButton onClick={() => setShowKeyboardShortcuts(true)} />
      <KeyboardShortcuts isOpen={showKeyboardShortcuts} onClose={() => setShowKeyboardShortcuts(false)} />
    </div>
  )
}
