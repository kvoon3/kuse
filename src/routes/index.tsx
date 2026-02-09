import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocalStorage } from 'react-use'

import { HabitItem } from '~/components/HabitItem'
import { Heatmap } from '~/components/Heatmap'
import { KeyboardShortcuts, KeyboardShortcutsButton } from '~/components/KeyboardShortcuts'
import { TodoItem } from '~/components/TodoItem'
import { toLocalDateStr } from '~/lib/utils'

import type { Habit, CheckIn, Todo } from '~/types/habit'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const [habits, setHabits] = useLocalStorage<Habit[]>('habits', [])
  const [checkIns, setCheckIns] = useLocalStorage<CheckIn[]>('checkIns', [])
  const [todos, setTodos] = useLocalStorage<Todo[]>('todos', [])
  const [liveRegionText, setLiveRegionText] = useState('')
  const [focusedHabitId, setFocusedHabitId] = useState<string | null>(null)
  const [focusedTodoId, setFocusedTodoId] = useState<string | null>(null)
  const [newlyAddedHabitId, setNewlyAddedHabitId] = useState<string | null>(null)
  const [newlyAddedTodoId, setNewlyAddedTodoId] = useState<string | null>(null)
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)
  const [activeSection, setActiveSection] = useState<'habits' | 'todos'>('habits')
  const habitInputRef = useRef<HTMLInputElement>(null)
  const todoInputRef = useRef<HTMLInputElement>(null)
  const habitRefs = useRef<Map<string, HTMLLIElement>>(new Map())
  const todoRefs = useRef<Map<string, HTMLLIElement>>(new Map())

  const today = toLocalDateStr(new Date())
  const todaysTodos = todos?.filter((t) => t.date === today) || []

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        if (activeSection === 'habits') {
          habitInputRef.current?.focus()
        } else {
          todoInputRef.current?.focus()
        }
        return
      }

      if (e.key === 'Tab' && !e.shiftKey) {
        const activeElement = document.activeElement
        const lastHabit = habits && habits.length > 0 ? habits[habits.length - 1].id : null
        if (lastHabit && habitRefs.current.get(lastHabit) === activeElement) {
          e.preventDefault()
          setActiveSection('todos')
          setFocusedTodoId(todaysTodos[0]?.id || null)
          if (todaysTodos.length > 0 && todoRefs.current.get(todaysTodos[0].id)) {
            todoRefs.current.get(todaysTodos[0].id)?.focus()
          }
          return
        }
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
  }, [activeSection, habits, todaysTodos])

  useEffect(() => {
    if (newlyAddedHabitId && focusedHabitId === newlyAddedHabitId) {
      setNewlyAddedHabitId(null)
    }
  }, [newlyAddedHabitId, focusedHabitId])

  useEffect(() => {
    if (newlyAddedTodoId && focusedTodoId === newlyAddedTodoId) {
      setNewlyAddedTodoId(null)
    }
  }, [newlyAddedTodoId, focusedTodoId])

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
    setNewlyAddedHabitId(newHabit.id)
    setFocusedHabitId(newHabit.id)
    setActiveSection('habits')
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
    return checkIns?.some((c) => c.habitId === habitId && toLocalDateStr(new Date(c.date)) === today) || false
  }

  const handleHabitNavigate = (habitId: string, direction: 'up' | 'down') => {
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

  const addTodo = (name: string): void => {
    if (!name.trim()) return
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      name: name.trim(),
      completed: false,
      date: today,
      createdAt: new Date().toISOString(),
    }
    setTodos([...(todos || []), newTodo])
    setNewlyAddedTodoId(newTodo.id)
    setFocusedTodoId(newTodo.id)
    setActiveSection('todos')
    announce(`Added todo: ${newTodo.name}`)
  }

  const deleteTodo = (id: string, name: string): void => {
    const todaysTodosList = todaysTodos
    const currentIndex = todaysTodosList.findIndex((t) => t.id === id)
    setTodos(todos?.filter((t) => t.id !== id) || [])
    announce(`Deleted todo: ${name}`)

    if (todaysTodosList.length > 1) {
      const nextIndex = Math.min(currentIndex, todaysTodosList.length - 2)
      const nextTodo = todaysTodosList[nextIndex === currentIndex ? nextIndex + 1 : nextIndex]
      if (nextTodo && nextTodo.id !== id) {
        setFocusedTodoId(nextTodo.id)
      } else if (todaysTodosList.length > 1) {
        setFocusedTodoId(todaysTodosList[0].id)
      }
    }
  }

  const toggleTodo = (todoId: string, todoName: string): void => {
    const todo = todos?.find((t) => t.id === todoId)
    if (!todo) return

    const updatedTodos = todos?.map((t) => (t.id === todoId ? { ...t, completed: !t.completed } : t)) || []
    setTodos(updatedTodos)

    if (todo.completed) {
      announce(`Marked as not completed: ${todoName}`)
    } else {
      announce(`Completed: ${todoName}`)
    }
  }

  const handleTodoNavigate = (todoId: string, direction: 'up' | 'down') => {
    if (!todaysTodos.length) return
    const currentIndex = todaysTodos.findIndex((t) => t.id === todoId)
    if (currentIndex === -1) return

    let newIndex: number
    if (direction === 'up') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : todaysTodos.length - 1
    } else {
      newIndex = currentIndex < todaysTodos.length - 1 ? currentIndex + 1 : 0
    }

    setFocusedTodoId(todaysTodos[newIndex].id)
  }

  const hasAnyData = (habits && habits.length > 0) || (todos && todos.length > 0)

  return (
    <div className='p-3 sm:p-4 pt-4 sm:pt-6'>
      <a href='#main-content' className='skip-link'>
        Skip to main content
      </a>

      <div className='mx-auto'>
        {hasAnyData && (
          <div
            className='my-4 border p-4 border-base w-full md:w-fit md:mx-auto rounded-lg bg-card overflow-hidden'
            role='region'
            aria-label='Activity overview'
          >
            <Heatmap checkIns={checkIns || []} todos={todos || []} />
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
                  ref={habitInputRef}
                  id='habit-input'
                  name='habit'
                  type='text'
                  placeholder='New habit...'
                  aria-label='New habit name'
                  aria-describedby='habit-help shortcut-help'
                  className='flex-1 min-w-0 px-3 py-2.5 sm:py-2 text-base sm:text-sm border border-base rounded-lg bg-base focus:outline-none focus:ring-2 focus-visible:ring-ring'
                  onFocus={() => setActiveSection('habits')}
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
                    onFocus={() => {
                      setFocusedHabitId(habit.id)
                      setActiveSection('habits')
                    }}
                    onNavigate={(direction) => handleHabitNavigate(habit.id, direction)}
                  />
                ))}
              </ul>

              {habits && habits.length === 0 && (
                <p className='text-center text-muted py-12' role='status'>
                  No habits yet. Add one above!
                </p>
              )}
            </section>

            <section aria-label='Your todos' className='w-full min-w-0'>
              <h2 className='text-lg font-semibold mb-3 px-1'>Todos</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const input = e.currentTarget.elements.namedItem('todo') as HTMLInputElement
                  addTodo(input.value)
                  input.value = ''
                }}
                className='flex gap-2 mb-4'
                aria-label='Add new todo'
              >
                <input
                  ref={todoInputRef}
                  id='todo-input'
                  name='todo'
                  type='text'
                  placeholder='New todo for today...'
                  aria-label='New todo name'
                  aria-describedby='todo-help todo-shortcut-help'
                  className='flex-1 min-w-0 px-3 py-2.5 sm:py-2 text-base sm:text-sm border border-base rounded-lg bg-base focus:outline-none focus:ring-2 focus-visible:ring-ring'
                  onFocus={() => setActiveSection('todos')}
                />
                <button
                  type='submit'
                  className='px-4 sm:px-6 py-2.5 sm:py-2 bg-primary-solid text-inverted rounded-lg hover:bg-primary-solid-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring whitespace-nowrap'
                  aria-label='Add todo'
                >
                  Add
                </button>
              </form>

              <p id='todo-help' className='sr-only'>
                Enter a todo name and press Add or Enter to create it for today
              </p>
              <p id='todo-shortcut-help' className='sr-only'>
                Press Control N to quickly focus this input, use J and K or arrow keys to navigate todos, Space to toggle
              </p>

              <ul className='space-y-2 sm:space-y-3' role='list'>
                {todaysTodos.map((todo) => (
                  <TodoItem
                    ref={(el) => {
                      if (el) {
                        todoRefs.current.set(todo.id, el)
                      }
                    }}
                    key={todo.id}
                    todo={todo}
                    isFocused={focusedTodoId === todo.id}
                    onToggle={() => toggleTodo(todo.id, todo.name)}
                    onDelete={() => deleteTodo(todo.id, todo.name)}
                    onFocus={() => {
                      setFocusedTodoId(todo.id)
                      setActiveSection('todos')
                    }}
                    onNavigate={(direction) => handleTodoNavigate(todo.id, direction)}
                  />
                ))}
              </ul>

              {todaysTodos.length === 0 && (
                <p className='text-center text-muted py-12' role='status'>
                  No todos for today. Add one above!
                </p>
              )}
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
