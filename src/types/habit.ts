export type Habit = {
  id: string
  name: string
  color: string
  createdAt: string
}

export type CheckIn = {
  habitId: string
  date: string
  message: string
}

export type Todo = {
  id: string
  name: string
  completed: boolean
  date: string
  createdAt: string
}
