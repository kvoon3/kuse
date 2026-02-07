import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { Heatmap } from '~/components/Heatmap'
import { loadHabits, saveHabits, loadCheckIns, saveCheckIns } from '~/lib/storage'

import type { Habit, CheckIn } from '~/types/habit'

export const Route = createFileRoute('/')({ component: Home })

const COLOR_PRESETS = ['emerald', 'blue', 'violet', 'rose', 'amber'] as const
type ColorPreset = (typeof COLOR_PRESETS)[number]

const colorClasses: Record<ColorPreset, string> = {
  emerald: 'bg-emerald-100',
  blue: 'bg-blue-100',
  violet: 'bg-violet-100',
  rose: 'bg-rose-100',
  amber: 'bg-amber-100',
}

const colorBorderClasses: Record<ColorPreset, string> = {
  emerald: 'border-emerald-300 text-emerald-700',
  blue: 'border-blue-300 text-blue-700',
  violet: 'border-violet-300 text-violet-700',
  rose: 'border-rose-300 text-rose-700',
  amber: 'border-amber-300 text-amber-700',
}

function Home() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [newHabitName, setNewHabitName] = useState('')
  const [selectedColor, setSelectedColor] = useState<ColorPreset>('emerald')
  const [checkInMessage, setCheckInMessage] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setHabits(loadHabits())
    setCheckIns(loadCheckIns())
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      saveHabits(habits)
    }
  }, [habits, mounted])

  useEffect(() => {
    if (mounted) {
      saveCheckIns(checkIns)
    }
  }, [checkIns, mounted])

  const addHabit = (): void => {
    if (newHabitName.trim()) {
      const newHabit: Habit = {
        id: crypto.randomUUID(),
        name: newHabitName,
        color: selectedColor,
        createdAt: new Date().toISOString(),
      }
      setHabits([...habits, newHabit])
      setNewHabitName('')
    }
  }

  const deleteHabit = (habitId: string): void => {
    setHabits(habits.filter((h) => h.id !== habitId))
    setCheckIns(checkIns.filter((c) => c.habitId !== habitId))
  }

  const getTodayCheckIn = (habitId: string): CheckIn | undefined => {
    const today = new Date().toISOString().split('T')[0]
    return checkIns.find((c) => c.habitId === habitId && c.date.split('T')[0] === today)
  }

  const addCheckIn = (habitId: string): void => {
    const today = new Date().toISOString()
    const todayDate = today.split('T')[0]

    const existing = checkIns.find((c) => c.habitId === habitId && c.date.split('T')[0] === todayDate)
    if (existing) {
      setCheckIns(checkIns.map((c) => (c === existing ? { ...c, message: checkInMessage } : c)))
    } else {
      setCheckIns([
        ...checkIns,
        {
          habitId,
          date: today,
          message: checkInMessage,
        },
      ])
    }
    setCheckInMessage('')
  }

  if (!mounted) {
    return null
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6'>
      <div className='max-w-5xl mx-auto'>
        <div className='mb-12'>
          <h1 className='text-4xl font-bold text-slate-900 mb-2'>My Habits</h1>
          <p className='text-slate-600'>Track your daily habits at a glance</p>
        </div>

        {habits.length > 0 && (
          <div className='bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-8'>
            <h2 className='text-sm font-semibold text-slate-600 uppercase tracking-wide mb-4'>All Activity</h2>
            <Heatmap checkIns={checkIns} className='overflow-x-auto' />
          </div>
        )}

        <div className='bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-8'>
          <h2 className='text-lg font-semibold text-slate-900 mb-4'>Add New Habit</h2>
          <div className='flex gap-3 flex-wrap'>
            <input
              type='text'
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addHabit()}
              placeholder='Habit name...'
              className='flex-1 min-w-[200px] px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white text-slate-900'
            />
            <select
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value as ColorPreset)}
              className='px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white text-slate-900'
            >
              {COLOR_PRESETS.map((color) => (
                <option key={color} value={color}>
                  {color.charAt(0).toUpperCase() + color.slice(1)}
                </option>
              ))}
            </select>
            <button onClick={addHabit} className='px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium'>
              Add
            </button>
          </div>
        </div>

        {habits.length === 0 ? (
          <div className='text-center py-12'>
            <p className='text-lg text-slate-600 mb-2'>No habits yet.</p>
            <p className='text-slate-500'>Add your first habit above to start tracking!</p>
          </div>
        ) : (
          <div className='space-y-4'>
            {habits.map((habit) => {
              const todayCheckIn = getTodayCheckIn(habit.id)
              const isCheckedInToday = !!todayCheckIn

              return (
                <div
                  key={habit.id}
                  className={`rounded-lg border p-5 transition-colors ${
                    isCheckedInToday ? `${colorClasses[habit.color as ColorPreset]} border-slate-300` : 'bg-white border-slate-200'
                  }`}
                >
                  <div className='flex items-center justify-between mb-3'>
                    <div className='flex items-center gap-3'>
                      <div
                        className={`w-3 h-3 rounded-full border-2 ${colorBorderClasses[habit.color as ColorPreset]}`}
                        style={{
                          backgroundColor: `var(--color-${habit.color})`,
                        }}
                      />
                      <div>
                        <Link
                          to='/habits/$habitId'
                          params={{ habitId: habit.id }}
                          className='font-semibold text-slate-900 hover:underline cursor-pointer inline-block'
                        >
                          {habit.name}
                        </Link>
                        {isCheckedInToday && <p className='text-xs text-slate-600 mt-0.5'>{todayCheckIn.message || 'Checked in today'}</p>}
                      </div>
                    </div>
                    <button onClick={() => deleteHabit(habit.id)} className='text-slate-400 hover:text-red-600 transition-colors text-sm font-medium'>
                      Delete
                    </button>
                  </div>

                  {!isCheckedInToday ? (
                    <div className='flex gap-2'>
                      <input
                        type='text'
                        placeholder='Check in message (optional)...'
                        className='flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white text-slate-900'
                        value={checkInMessage}
                        onChange={(e) => setCheckInMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addCheckIn(habit.id)}
                      />
                      <button
                        onClick={() => addCheckIn(habit.id)}
                        className='px-4 py-2 text-sm bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium'
                      >
                        Check In
                      </button>
                    </div>
                  ) : (
                    <div className='text-sm text-slate-600'>✓ Checked in today</div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
