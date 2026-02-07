import { createFileRoute } from '@tanstack/react-router'
import { useLocalStorage } from 'react-use'

import { Heatmap } from '~/components/Heatmap'
import { toLocalDateStr } from '~/lib/utils'

import type { Habit, CheckIn } from '~/types/habit'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const [habits, setHabits] = useLocalStorage<Habit[]>('habits', [])
  const [checkIns, setCheckIns] = useLocalStorage<CheckIn[]>('checkIns', [])

  const addHabit = (name: string): void => {
    if (!name.trim()) return
    const newHabit: Habit = {
      id: crypto.randomUUID(),
      name: name.trim(),
      color: 'default',
      createdAt: new Date().toISOString(),
    }
    setHabits([...(habits || []), newHabit])
  }

  const deleteHabit = (id: string): void => {
    setHabits(habits?.filter((h) => h.id !== id) || [])
    setCheckIns(checkIns?.filter((c) => c.habitId !== id) || [])
  }

  const toggleCheckIn = (habitId: string): void => {
    const today = toLocalDateStr(new Date())
    const existing = checkIns?.find((c) => c.habitId === habitId && toLocalDateStr(new Date(c.date)) === today)

    if (existing) {
      setCheckIns(checkIns?.filter((c) => c !== existing) || [])
    } else {
      setCheckIns([...(checkIns || []), { habitId, date: new Date().toISOString(), message: '' }])
    }
  }

  const isCheckedToday = (habitId: string): boolean => {
    const today = toLocalDateStr(new Date())
    return checkIns?.some((c) => c.habitId === habitId && toLocalDateStr(new Date(c.date)) === today) || false
  }

  return (
    <div className='min-h-screen bg-white p-4'>
      <div className='max-w-3xl mx-auto'>
        {/* Header */}
        <h1 className='text-2xl font-bold mb-8'>Habits</h1>

        {/* Heatmap */}
        {habits && habits.length > 0 && (
          <div className='mb-8 p-4 border border-slate-200 rounded'>
            <Heatmap checkIns={checkIns || []} />
          </div>
        )}

        {/* Add Habit */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const input = e.currentTarget.elements.namedItem('habit') as HTMLInputElement
            addHabit(input.value)
            input.value = ''
          }}
          className='flex gap-2 mb-8'
        >
          <input
            name='habit'
            type='text'
            placeholder='New habit...'
            className='flex-1 px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-400'
          />
          <button type='submit' className='px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-800'>
            Add
          </button>
        </form>

        {/* Habits List */}
        <div className='space-y-2'>
          {habits?.map((habit) => (
            <div key={habit.id} className='flex items-center justify-between p-3 border border-slate-200 rounded'>
              <div className='flex items-center gap-3'>
                <input type='checkbox' checked={isCheckedToday(habit.id)} onChange={() => toggleCheckIn(habit.id)} className='w-4 h-4' />
                <span className={isCheckedToday(habit.id) ? 'line-through text-slate-500' : ''}>{habit.name}</span>
              </div>
              <button onClick={() => deleteHabit(habit.id)} className='text-slate-400 hover:text-slate-600 text-sm'>
                ×
              </button>
            </div>
          ))}
        </div>

        {habits && habits.length === 0 && <div className='text-center text-slate-500 py-12'>No habits yet. Add one above!</div>}
      </div>
    </div>
  )
}
