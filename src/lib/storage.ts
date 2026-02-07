import { Habit, CheckIn } from '~/types/habit'

const HABITS_KEY = 'kuse_habits'
const CHECKINS_KEY = 'kuse_checkins'

export function loadHabits(): Habit[] {
  try {
    const data = localStorage.getItem(HABITS_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function saveHabits(habits: Habit[]): void {
  try {
    localStorage.setItem(HABITS_KEY, JSON.stringify(habits))
  } catch {
    console.error('Failed to save habits to localStorage')
  }
}

export function loadCheckIns(): CheckIn[] {
  try {
    const data = localStorage.getItem(CHECKINS_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function saveCheckIns(checkIns: CheckIn[]): void {
  try {
    localStorage.setItem(CHECKINS_KEY, JSON.stringify(checkIns))
  } catch {
    console.error('Failed to save checkIns to localStorage')
  }
}
