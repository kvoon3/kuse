import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip'
import { cn, toLocalDateStr } from '~/lib/utils'

import type { CheckIn, Todo } from '~/types/habit'

type HeatmapProps = {
  checkIns: CheckIn[]
  todos?: Todo[]
  habitId?: string
  className?: string
}

type DayData = {
  date: Date
  dateStr: string
  habitCount: number
  todoCount: number
  completedTodoCount: number
  incompleteTodoCount: number
  greenLevel: 0 | 1 | 2 | 3 | 4
  orangeLevel: 0 | 1 | 2 | 3 | 4
  hasIncompleteTodos: boolean
  hasCompletedItems: boolean
}

const RECT_SIZE = 10
const RECT_GAP = 2
const CELL_SIZE = RECT_SIZE + RECT_GAP
const WEEK_COUNT = 53
const DAY_COUNT = 7

const GREEN_COLORS = ['var(--heatmap-0)', 'var(--heatmap-1)', 'var(--heatmap-2)', 'var(--heatmap-3)', 'var(--heatmap-4)'] as const
const ORANGE_COLORS = [
  'var(--heatmap-orange-0)',
  'var(--heatmap-orange-1)',
  'var(--heatmap-orange-2)',
  'var(--heatmap-orange-3)',
  'var(--heatmap-orange-4)',
] as const

function getLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0
  if (count === 1) return 1
  if (count === 2) return 2
  if (count === 3) return 3
  return 4
}

export function Heatmap({ checkIns, todos = [], habitId, className }: HeatmapProps) {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)
  const gridRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = containerRef.current.scrollWidth
    }
  }, [])

  const calendarData = useMemo(() => {
    const today = new Date()
    const currentDayOfWeek = today.getDay()

    const currentWeekStart = new Date(today)
    currentWeekStart.setDate(today.getDate() - currentDayOfWeek)
    currentWeekStart.setHours(0, 0, 0, 0)

    const startDate = new Date(currentWeekStart)
    startDate.setDate(currentWeekStart.getDate() - 52 * 7)

    const data: DayData[] = []

    const filteredCheckIns = habitId ? checkIns.filter((c) => c.habitId === habitId) : checkIns

    const checkInsByDate = new Map<string, number>()
    filteredCheckIns.forEach((c) => {
      const dateKey = toLocalDateStr(new Date(c.date))
      checkInsByDate.set(dateKey, (checkInsByDate.get(dateKey) || 0) + 1)
    })

    const todosByDate = new Map<string, { total: number; completed: number }>()
    todos.forEach((t) => {
      const dateKey = t.date
      const existing = todosByDate.get(dateKey) || { total: 0, completed: 0 }
      existing.total += 1
      if (t.completed) {
        existing.completed += 1
      }
      todosByDate.set(dateKey, existing)
    })

    for (let i = 0; i < WEEK_COUNT * DAY_COUNT; i++) {
      const currentDate = new Date(startDate)
      currentDate.setDate(startDate.getDate() + i)

      const dateStr = toLocalDateStr(currentDate)
      const habitCount = checkInsByDate.get(dateStr) || 0
      const todoData = todosByDate.get(dateStr) || { total: 0, completed: 0 }
      const todoCount = todoData.total
      const completedTodoCount = todoData.completed

      const incompleteTodoCount = todoCount - completedTodoCount
      const hasIncompleteTodos = incompleteTodoCount > 0
      const hasCompletedItems = habitCount > 0 || completedTodoCount > 0

      const orangeLevel = getLevel(incompleteTodoCount)

      const completedCount = habitCount + completedTodoCount
      const greenLevel = getLevel(completedCount)

      data.push({
        date: currentDate,
        dateStr,
        habitCount,
        todoCount,
        completedTodoCount,
        incompleteTodoCount,
        greenLevel,
        orangeLevel,
        hasIncompleteTodos,
        hasCompletedItems,
      })
    }

    return data
  }, [checkIns, todos, habitId])

  const weeks = useMemo(() => {
    const weeksArray: DayData[][] = []
    for (let i = 0; i < calendarData.length; i += 7) {
      weeksArray.push(calendarData.slice(i, i + 7))
    }
    return weeksArray
  }, [calendarData])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent, weekIndex: number, dayIndex: number) => {
      const currentIndex = weekIndex * 7 + dayIndex
      let newIndex: number | null = null

      switch (event.key) {
        case 'ArrowRight':
          event.preventDefault()
          newIndex = Math.min(currentIndex + 7, calendarData.length - 1)
          break
        case 'ArrowLeft':
          event.preventDefault()
          newIndex = Math.max(currentIndex - 7, 0)
          break
        case 'ArrowDown':
          event.preventDefault()
          newIndex = Math.min(currentIndex + 1, calendarData.length - 1)
          break
        case 'ArrowUp':
          event.preventDefault()
          newIndex = Math.max(currentIndex - 1, 0)
          break
        case 'Home':
          event.preventDefault()
          newIndex = weekIndex * 7
          break
        case 'End':
          event.preventDefault()
          newIndex = Math.min(weekIndex * 7 + 6, calendarData.length - 1)
          break
        default:
          return
      }

      if (newIndex !== null) {
        setFocusedIndex(newIndex)
        setTimeout(() => {
          const element = document.querySelector(`[data-heatmap-index="${newIndex}"]`) as HTMLElement
          element?.focus()
        }, 0)
      }
    },
    [calendarData.length]
  )

  const handleFocus = useCallback((index: number) => {
    setFocusedIndex(index)
  }, [])

  const handleBlur = useCallback(() => {
    setFocusedIndex(null)
  }, [])

  const getAriaLabel = useCallback((day: DayData): string => {
    const dateStr = day.date.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    const parts: string[] = []
    if (day.habitCount > 0) {
      parts.push(`${day.habitCount} ${day.habitCount === 1 ? 'habit' : 'habits'}`)
    }
    const incompleteTodos = day.todoCount - day.completedTodoCount
    if (incompleteTodos > 0) {
      parts.push(`${incompleteTodos} pending ${incompleteTodos === 1 ? 'todo' : 'todos'}`)
    }
    if (day.completedTodoCount > 0) {
      parts.push(`${day.completedTodoCount} completed ${day.completedTodoCount === 1 ? 'todo' : 'todos'}`)
    }
    if (parts.length === 0) {
      return `No activity on ${dateStr}`
    }
    return `${parts.join(', ')} on ${dateStr}`
  }, [])

  const getCellColor = (day: DayData): string => {
    if (day.hasIncompleteTodos) {
      return ORANGE_COLORS[day.orangeLevel]
    }
    if (day.hasCompletedItems) {
      return GREEN_COLORS[day.greenLevel]
    }
    return GREEN_COLORS[0]
  }

  return (
    <TooltipProvider>
      <div
        ref={containerRef}
        className={cn('overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0', 'touch-pan-x', className)}
        role='region'
        aria-label='Activity heatmap showing habits and todos over the past year'
      >
        <svg
          ref={gridRef}
          width={weeks.length * CELL_SIZE}
          height={DAY_COUNT * CELL_SIZE}
          className='block mx-auto sm:mx-0'
          role='grid'
          aria-label='Activity grid'
        >
          {weeks.map((week, weekIndex) => (
            <g key={weekIndex} transform={`translate(${weekIndex * CELL_SIZE}, 0)`} role='row'>
              {week.map((day, dayIndex) => {
                const index = weekIndex * 7 + dayIndex
                const isFocused = focusedIndex === index
                const cellColor = getCellColor(day)

                return (
                  <Tooltip key={day.dateStr}>
                    <TooltipTrigger asChild>
                      <rect
                        data-heatmap-index={index}
                        x={0}
                        y={dayIndex * CELL_SIZE}
                        width={RECT_SIZE}
                        height={RECT_SIZE}
                        rx={2}
                        ry={2}
                        fill={cellColor}
                        tabIndex={0}
                        role='gridcell'
                        aria-label={getAriaLabel(day)}
                        aria-selected={isFocused}
                        onFocus={() => handleFocus(index)}
                        onBlur={handleBlur}
                        onKeyDown={(e) => handleKeyDown(e, weekIndex, dayIndex)}
                        className={cn(
                          'transition-colors duration-200 hover:stroke-foreground/20 hover:stroke-2',
                          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
                          isFocused && 'stroke-foreground/40 stroke-2'
                        )}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className='text-center'>
                        <div className='font-semibold'>
                          {day.habitCount > 0 && (
                            <div className='text-green-600 dark:text-green-400'>
                              {day.habitCount} {day.habitCount === 1 ? 'habit' : 'habits'}
                            </div>
                          )}
                          {day.todoCount > 0 && (
                            <div
                              className={
                                day.completedTodoCount === day.todoCount ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'
                              }
                            >
                              {day.completedTodoCount}/{day.todoCount} todos
                            </div>
                          )}
                          {day.habitCount === 0 && day.todoCount === 0 && <div>No activity</div>}
                        </div>
                        <div className='text-xs text-muted-foreground'>
                          {day.date.toLocaleDateString(undefined, {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                )
              })}
            </g>
          ))}
        </svg>
        <div className='sr-only' role='status' aria-live='polite' aria-atomic='true'>
          {focusedIndex !== null && calendarData[focusedIndex] ? getAriaLabel(calendarData[focusedIndex]) : ''}
        </div>
      </div>
    </TooltipProvider>
  )
}
