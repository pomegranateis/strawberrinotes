'use client'
import { useEffect, useState } from 'react'
import type { Todo } from '@/types'
import { Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

const PRIORITY_DOT: Record<string, string> = {
  high:   'bg-pink-400',
  medium: 'bg-pink-300',
  low:    'bg-pink-100 border border-pink-200',
}

export default function TodoClient({ userId }: { userId: string }) {
  const [todos, setTodos]       = useState<Todo[]>([])
  const [loading, setLoading]   = useState(true)
  const [newTitle, setNewTitle] = useState('')
  const [newPri,   setNewPri]   = useState<'high'|'medium'|'low'>('medium')
  const [newDue,   setNewDue]   = useState('')
  const [newCat,   setNewCat]   = useState('')
  const [adding,   setAdding]   = useState(false)

  useEffect(() => {
    fetch('/api/todos')
      .then(res => res.json())
      .then(data => { setTodos(data); setLoading(false) })
      .catch(err => { toast.error('Failed to load tasks'); setLoading(false) })
  }, [userId])

  async function addTodo() {
    if (!newTitle.trim()) return
    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          priority: newPri,
          due_date: newDue || null,
          category: newCat || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to add task')
      setTodos(prev => [data, ...prev])
      setNewTitle(''); setNewDue(''); setNewCat(''); setAdding(false)
      toast.success('Task added 🌸')
    } catch (err: any) {
      toast.error(err.message || 'Failed to add task')
    }
  }

  async function toggleTodo(id: string, completed: boolean) {
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update task')
      }
      setTodos(prev => prev.map(t => t.id === id ? { ...t, completed } : t))
    } catch (err: any) {
      toast.error(err.message || 'Failed to update task')
    }
  }

  async function deleteTodo(id: string) {
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete task')
      }
      setTodos(prev => prev.filter(t => t.id !== id))
      toast.success('Task removed')
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete task')
    }
  }

  const pending   = todos.filter(t => !t.completed)
  const completed = todos.filter(t =>  t.completed)
  const pct = todos.length ? Math.round((completed.length / todos.length) * 100) : 0

  const TodoItem = ({ todo }: { todo: Todo }) => (
    <div className={`flex items-center gap-3 py-2.5 border-b border-[#f5eff0] last:border-0 group ${todo.completed ? 'opacity-60' : ''}`}>
      <span className={`w-2 h-2 rounded-full shrink-0 ${PRIORITY_DOT[todo.priority]}`} />
      <button
        onClick={() => toggleTodo(todo.id, !todo.completed)}
        className={`w-4 h-4 rounded-full border-[1.5px] border-pink-300 flex items-center justify-center shrink-0 transition-all hover:scale-110 ${todo.completed ? 'bg-pink-300' : 'hover:bg-pink-100'}`}
      >
        {todo.completed && <span className="text-white text-[8px]">✓</span>}
      </button>
      <div className="flex-1 min-w-0">
        <div className={`text-[13px] text-[#4a2d35] truncate ${todo.completed ? 'line-through' : ''}`}>{todo.title}</div>
        {(todo.due_date || todo.category) && (
          <div className="text-[10px] text-[#9e7580] mt-0.5">
            {todo.category && <span className="mr-2">{todo.category}</span>}
            {todo.due_date && <span>{new Date(todo.due_date).toLocaleDateString('en-US', { month:'short', day:'numeric' })}</span>}
          </div>
        )}
      </div>
      <button onClick={() => deleteTodo(todo.id)} className="opacity-0 group-hover:opacity-100 text-red-300 hover:text-red-400 transition-all">
        <Trash2 size={13} />
      </button>
    </div>
  )

  return (
    <div className="flex-1 overflow-auto p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-[22px] text-[#4a2d35]">✅ To-Do List</h2>
        <button
          onClick={() => setAdding(p => !p)}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-pink-200 text-[#4a2d35] text-[12px] hover:bg-pink-300 transition-all hover:scale-105"
        >
          <Plus size={12} /> Add task
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <div className="bg-white border border-pink-200 rounded-2xl p-5 mb-6 animate-slide-up shadow-petal">
          <div className="text-[13px] font-medium text-[#4a2d35] mb-4">New task 🌸</div>
          <input
            type="text"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTodo()}
            placeholder="What needs to be done?"
            autoFocus
            className="w-full border border-pink-100 rounded-xl px-3 py-2.5 text-[13px] text-[#4a2d35] placeholder:text-[#c4a0ac] outline-none focus:border-pink-300 mb-3 bg-[#f5eff0]"
          />
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div>
              <label className="text-[10px] text-[#9e7580] mb-1 block">Priority</label>
              <select
                value={newPri}
                onChange={e => setNewPri(e.target.value as any)}
                className="w-full border border-pink-100 rounded-lg px-2 py-1.5 text-[12px] text-[#4a2d35] outline-none bg-[#f5eff0]"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-[#9e7580] mb-1 block">Due date</label>
              <input
                type="date"
                value={newDue}
                onChange={e => setNewDue(e.target.value)}
                className="w-full border border-pink-100 rounded-lg px-2 py-1.5 text-[12px] text-[#4a2d35] outline-none bg-[#f5eff0]"
              />
            </div>
            <div>
              <label className="text-[10px] text-[#9e7580] mb-1 block">Category</label>
              <input
                type="text"
                value={newCat}
                onChange={e => setNewCat(e.target.value)}
                placeholder="e.g. Study"
                className="w-full border border-pink-100 rounded-lg px-2 py-1.5 text-[12px] text-[#4a2d35] placeholder:text-[#c4a0ac] outline-none bg-[#f5eff0]"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setAdding(false)} className="px-4 py-1.5 rounded-full border border-pink-100 text-[#9e7580] text-[12px] hover:bg-pink-50">Cancel</button>
            <button onClick={addTodo} className="px-5 py-1.5 rounded-full bg-pink-200 text-[#4a2d35] text-[12px] hover:bg-pink-300 transition-all">Add task</button>
          </div>
        </div>
      )}

      {/* Progress */}
      {todos.length > 0 && (
        <div className="bg-white border border-pink-100 rounded-2xl p-4 mb-6 flex items-center gap-4">
          <div className="flex-1 bg-pink-50 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-pink-300 to-pink-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-[12px] text-[#9e7580] shrink-0">{completed.length} / {todos.length} done</span>
          <span className="text-[12px] font-medium text-pink-400">{pct}%</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-white rounded-xl animate-pulse border border-pink-100" />)}</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Pending */}
          <div className="bg-white border border-pink-100 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[13px] font-medium text-[#4a2d35]">🌸 Pending</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-100 text-[#9e7580]">{pending.length}</span>
            </div>
            {pending.length === 0
              ? <div className="text-center py-8 text-[#c4a0ac] text-[12px]">All done! Great work 🎉</div>
              : pending.map(t => <TodoItem key={t.id} todo={t} />)
            }
          </div>

          {/* Completed */}
          <div className="bg-white border border-pink-100 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[13px] font-medium text-[#4a2d35]">✨ Completed</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-700">{completed.length}</span>
            </div>
            {completed.length === 0
              ? <div className="text-center py-8 text-[#c4a0ac] text-[12px]">Complete a task to see it here</div>
              : completed.map(t => <TodoItem key={t.id} todo={t} />)
            }
          </div>
        </div>
      )}
    </div>
  )
}
