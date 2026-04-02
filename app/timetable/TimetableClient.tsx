'use client'
import { useEffect, useState } from 'react'
import type { TimetableEntry } from '@/types'
import { TT_COLORS } from '@/lib/utils'
import { Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const TIMES = ['07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00']
const COLORS = ['pink','lavender','mint','peach','sky','rose']

export default function TimetableClient({ userId }: { userId: string }) {
  const [entries,   setEntries]   = useState<TimetableEntry[]>([])
  const [loading,   setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ course_name:'', room:'', day_of_week:1, start_time:'08:00', end_time:'09:00', color:'pink' })

  useEffect(() => {
    fetch('/api/timetable')
      .then(res => res.json())
      .then(data => { setEntries(data); setLoading(false) })
      .catch(err => { toast.error('Failed to load timetable'); setLoading(false) })
  }, [userId])

  async function addEntry() {
    if (!form.course_name.trim()) return
    try {
      const res = await fetch('/api/timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to add class')
      setEntries(prev => [...prev, data])
      setShowModal(false)
      setForm({ course_name:'', room:'', day_of_week:1, start_time:'08:00', end_time:'09:00', color:'pink' })
      toast.success('Class added 📅')
    } catch (err: any) {
      toast.error(err.message || 'Failed to add class')
    }
  }

  async function deleteEntry(id: string) {
    try {
      const res = await fetch(`/api/timetable/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete class')
      }
      setEntries(prev => prev.filter(e => e.id !== id))
      toast.success('Removed')
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete class')
    }
  }

  function getEntry(day: number, time: string) {
    // Match both "HH:MM" and "HH:MM:SS" formats
    return entries.find(e => e.day_of_week === day && e.start_time.startsWith(time))
  }

  return (
    <div className="flex-1 overflow-auto p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-[22px] text-[#4a2d35]">📅 Timetable</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-pink-200 text-[#4a2d35] text-[12px] hover:bg-pink-300 transition-all hover:scale-105"
        >
          <Plus size={12} /> Add class
        </button>
      </div>

      {/* Grid */}
      <div className="bg-white border border-pink-100 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-pink-100">
                <th className="w-16 py-3 px-3 text-[11px] font-medium text-[#9e7580] text-left">Time</th>
                {DAYS.map(d => (
                  <th key={d} className="py-3 px-2 text-[11px] font-medium text-[#9e7580] text-center">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                TIMES.map(t => (
                  <tr key={t} className="border-b border-[#f5eff0]">
                    <td className="px-3 py-2 text-[11px] text-[#c4a0ac]">{t}</td>
                    {[1,2,3,4,5].map(d => <td key={d} className="px-2 py-2 h-12" />)}
                  </tr>
                ))
              ) : (
                TIMES.map(t => (
                  <tr key={t} className="border-b border-[#f5eff0] last:border-0">
                    <td className="px-3 py-2 text-[11px] text-[#c4a0ac] whitespace-nowrap">{t}</td>
                    {[1,2,3,4,5].map(day => {
                      const e = getEntry(day, t)
                      return (
                        <td key={day} className="px-2 py-1.5 h-12 align-top">
                          {e ? (
                            <div className={`group relative rounded-lg px-2 py-1.5 text-[10px] h-full flex flex-col justify-center cursor-default ${TT_COLORS[e.color] ?? TT_COLORS.pink}`}>
                              <div className="font-medium truncate">{e.course_name}</div>
                              {e.room && <div className="opacity-70 truncate">{e.room}</div>}
                              <button
                                onClick={() => deleteEntry(e.id)}
                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-current hover:scale-110 transition-all"
                              >
                                <Trash2 size={10} />
                              </button>
                            </div>
                          ) : null}
                        </td>
                      )
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[#4a2d35]/20 z-50 flex items-center justify-center animate-fade-in" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-white rounded-3xl border border-pink-100 shadow-petal p-7 w-96 animate-slide-up">
            <h3 className="font-serif text-[18px] text-[#4a2d35] mb-1">Add class 📅</h3>
            <p className="text-[12px] text-[#9e7580] mb-5">Fill in your class details below.</p>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-[#9e7580] block mb-1">Course name *</label>
                <input value={form.course_name} onChange={e => setForm(f => ({...f, course_name: e.target.value}))}
                  placeholder="e.g. Algorithms" className="w-full border border-pink-100 rounded-xl px-3 py-2 text-[13px] text-[#4a2d35] outline-none focus:border-pink-300 bg-[#f5eff0]" />
              </div>
              <div>
                <label className="text-[10px] text-[#9e7580] block mb-1">Room</label>
                <input value={form.room} onChange={e => setForm(f => ({...f, room: e.target.value}))}
                  placeholder="e.g. Lab 3" className="w-full border border-pink-100 rounded-xl px-3 py-2 text-[13px] text-[#4a2d35] outline-none focus:border-pink-300 bg-[#f5eff0]" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-[#9e7580] block mb-1">Day</label>
                  <select value={form.day_of_week} onChange={e => setForm(f => ({...f, day_of_week: +e.target.value}))}
                    className="w-full border border-pink-100 rounded-xl px-3 py-2 text-[13px] text-[#4a2d35] outline-none bg-[#f5eff0]">
                    {DAYS.map((d,i) => <option key={d} value={i+1}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-[#9e7580] block mb-1">Color</label>
                  <div className="flex gap-1.5 pt-2">
                    {COLORS.map(c => (
                      <button key={c} onClick={() => setForm(f => ({...f, color: c}))}
                        className={`w-5 h-5 rounded-full transition-all ${TT_COLORS[c]?.split(' ')[0]} ${form.color === c ? 'ring-2 ring-pink-400 ring-offset-1 scale-110' : ''}`} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-[#9e7580] block mb-1">Start time</label>
                  <select value={form.start_time} onChange={e => setForm(f => ({...f, start_time: e.target.value}))}
                    className="w-full border border-pink-100 rounded-xl px-3 py-2 text-[13px] text-[#4a2d35] outline-none bg-[#f5eff0]">
                    {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-[#9e7580] block mb-1">End time</label>
                  <select value={form.end_time} onChange={e => setForm(f => ({...f, end_time: e.target.value}))}
                    className="w-full border border-pink-100 rounded-xl px-3 py-2 text-[13px] text-[#4a2d35] outline-none bg-[#f5eff0]">
                    {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-full border border-pink-100 text-[#9e7580] text-[12px] hover:bg-pink-50">Cancel</button>
              <button onClick={addEntry} className="px-6 py-2 rounded-full bg-pink-200 text-[#4a2d35] text-[12px] hover:bg-pink-300 transition-all">Add class</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
