import { createFileRoute, Link, useParams, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { Heatmap } from '~/components/Heatmap'
import { loadHabits, loadCheckIns, saveCheckIns } from '~/lib/storage'

import type { Habit, CheckIn } from '~/types/habit'

export const Route = createFileRoute('/habits/$habitId')({
  component: HabitDetail,
})

function HabitDetail() {
  const { habitId } = useParams({ from: '/habits/$habitId' })
  const navigate = useNavigate()

  const [habit, setHabit] = useState<Habit | null>(null)
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [checkInMessage, setCheckInMessage] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const habits = loadHabits()
    const found = habits.find((h) => h.id === habitId)

    if (!found) {
      navigate({ to: '/' })
      return
    }

    setHabit(found)
    setCheckIns(loadCheckIns())
    setMounted(true)
  }, [habitId, navigate])

  const habitCheckIns = checkIns.filter((c) => c.habitId === habitId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const getTodayCheckIn = (): CheckIn | undefined => {
    const today = new Date().toISOString().split('T')[0]
    return checkIns.find((c) => c.habitId === habitId && c.date.split('T')[0] === today)
  }

  const addCheckIn = (): void => {
    if (!habit) return

    const today = new Date().toISOString()
    const todayDate = today.split('T')[0]

    const existing = checkIns.find((c) => c.habitId === habitId && c.date.split('T')[0] === todayDate)

    let updated: CheckIn[]
    if (existing) {
      updated = checkIns.map((c) => (c === existing ? { ...c, message: checkInMessage } : c))
    } else {
      updated = [
        ...checkIns,
        {
          habitId,
          date: today,
          message: checkInMessage,
        },
      ]
    }

    saveCheckIns(updated)
    setCheckIns(updated)
    setCheckInMessage('')
  }

  if (!mounted || !habit) {
    return null
  }

  const todayCheckIn = getTodayCheckIn()
  const isCheckedInToday = !!todayCheckIn
  const createdDate = new Date(habit.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6'>
      <div className='max-w-3xl mx-auto'>
        <div className='mb-8'>
          <Link to='/' className='text-sm text-slate-600 hover:text-slate-900 transition-colors mb-4 inline-block font-medium'>
            ← Back to All Habits
          </Link>
          <div className='flex items-center gap-3'>
            <div
              className='w-4 h-4 rounded-full border-2 border-slate-300'
              style={{
                backgroundColor: `var(--color-${habit.color})`,
              }}
            />
            <h1 className='text-4xl font-bold text-slate-900'>{habit.name}</h1>
          </div>
          <p className='text-slate-600 text-sm mt-2'>Created {createdDate}</p>
        </div>

        <div className='bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-8'>
          <h2 className='text-sm font-semibold text-slate-600 uppercase tracking-wide mb-4'>Activity</h2>
          <Heatmap checkIns={checkIns} habitId={habitId} className='overflow-x-auto' />
        </div>

        <div className='bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-8'>
          <h2 className='text-lg font-semibold text-slate-900 mb-4'>{isCheckedInToday ? '✓ Checked In Today' : 'Check In Today'}</h2>

          {!isCheckedInToday ? (
            <div className='flex gap-2'>
              <input
                type='text'
                placeholder='Check in message (optional)...'
                className='flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white text-slate-900'
                value={checkInMessage}
                onChange={(e) => setCheckInMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCheckIn()}
              />
              <button onClick={addCheckIn} className='px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium'>
                Check In
              </button>
            </div>
          ) : (
            <div className='flex items-center gap-2 text-slate-600'>
              <span>✓</span>
              <span>{todayCheckIn?.message || 'No message'}</span>
            </div>
          )}
        </div>

        <div className='bg-white rounded-lg shadow-sm border border-slate-200 p-6'>
          <h2 className='text-lg font-semibold text-slate-900 mb-4'>History</h2>

          {habitCheckIns.length === 0 ? (
            <p className='text-center py-8 text-slate-500'>No check-ins yet. Start tracking!</p>
          ) : (
            <div className='space-y-3'>
              {habitCheckIns.map((checkIn) => {
                const checkInDate = new Date(checkIn.date)
                const dateStr = checkInDate.toLocaleDateString(undefined, {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
                const timeStr = checkInDate.toLocaleTimeString(undefined, {
                  hour: '2-digit',
                  minute: '2-digit',
                })

                return (
                  <div
                    key={`${checkIn.date}-${checkIn.message}`}
                    className='flex items-start justify-between p-3 bg-slate-50 rounded-lg border border-slate-200'
                  >
                    <div>
                      <p className='font-medium text-slate-900'>
                        {dateStr} at {timeStr}
                      </p>
                      {checkIn.message && <p className='text-sm text-slate-600 mt-1'>{checkIn.message}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
