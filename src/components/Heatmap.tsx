import * as React from 'react'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip'
import { cn, toLocalDateStr } from '~/lib/utils'

import type { CheckIn } from '~/types/habit'

type HeatmapProps = {
  checkIns: CheckIn[]
  habitId?: string
  className?: string
}

type DayData = {
  date: Date
  dateStr: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
}

const RECT_SIZE = 10
const RECT_GAP = 2
const CELL_SIZE = RECT_SIZE + RECT_GAP
const WEEK_COUNT = 53
const DAY_COUNT = 7

// GitHub-style colors
const COLORS = {
  0: '#ebedf0',
  1: '#9be9a8',
  2: '#40c463',
  3: '#30a14e',
  4: '#216e39',
}

export function Heatmap({ checkIns, habitId, className }: HeatmapProps) {
  const calendarData = React.useMemo(() => {
    const today = new Date()
    const currentDayOfWeek = today.getDay()

    // Align to Sunday of the current week
    const currentWeekStart = new Date(today)
    currentWeekStart.setDate(today.getDate() - currentDayOfWeek)
    currentWeekStart.setHours(0, 0, 0, 0)

    // Start date is 52 weeks before current week start to get 53 columns total
    const startDate = new Date(currentWeekStart)
    startDate.setDate(currentWeekStart.getDate() - 52 * 7)

    const data: DayData[] = []

    const filteredCheckIns = habitId ? checkIns.filter((c) => c.habitId === habitId) : checkIns

    const checkInsByDate = new Map<string, number>()
    filteredCheckIns.forEach((c) => {
      const dateKey = toLocalDateStr(new Date(c.date))
      checkInsByDate.set(dateKey, (checkInsByDate.get(dateKey) || 0) + 1)
    })

    for (let i = 0; i < WEEK_COUNT * DAY_COUNT; i++) {
      const currentDate = new Date(startDate)
      currentDate.setDate(startDate.getDate() + i)

      const dateStr = toLocalDateStr(currentDate)
      const count = checkInsByDate.get(dateStr) || 0

      let level: 0 | 1 | 2 | 3 | 4 = 0
      if (count === 0) level = 0
      else if (count === 1) level = 1
      else if (count === 2) level = 2
      else if (count === 3) level = 3
      else level = 4

      data.push({
        date: currentDate,
        dateStr,
        count,
        level,
      })
    }

    return data
  }, [checkIns, habitId])

  const weeks = React.useMemo(() => {
    const weeksArray: DayData[][] = []
    for (let i = 0; i < calendarData.length; i += 7) {
      weeksArray.push(calendarData.slice(i, i + 7))
    }
    return weeksArray
  }, [calendarData])

  return (
    <TooltipProvider>
      <div className={cn('overflow-x-auto', className)}>
        <svg width={weeks.length * CELL_SIZE} height={DAY_COUNT * CELL_SIZE} className='block'>
          {weeks.map((week, weekIndex) => (
            <g key={weekIndex} transform={`translate(${weekIndex * CELL_SIZE}, 0)`}>
              {week.map((day, dayIndex) => (
                <Tooltip key={day.dateStr}>
                  <TooltipTrigger asChild>
                    <rect
                      x={0}
                      y={dayIndex * CELL_SIZE}
                      width={RECT_SIZE}
                      height={RECT_SIZE}
                      rx={2}
                      ry={2}
                      fill={COLORS[day.level]}
                      className='transition-colors duration-200 hover:stroke-foreground/20 hover:stroke-2'
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className='text-center'>
                      <div className='font-semibold'>
                        {day.count} {day.count === 1 ? 'check-in' : 'check-ins'}
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
              ))}
            </g>
          ))}
        </svg>
      </div>
    </TooltipProvider>
  )
}
