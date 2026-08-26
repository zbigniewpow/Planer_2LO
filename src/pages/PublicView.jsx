import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, School } from 'lucide-react'
import { supabase } from '../supabaseClient'
import ScheduleGrid from '../components/ScheduleGrid'

export default function PublicView() {
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase
      .from('classes')
      .select('*')
      .order('name')
      .then(({ data }) => setClasses(data ?? []))
  }, [])

  useEffect(() => {
    if (!selectedClass) {
      setLessons([])
      return
    }
    setLoading(true)
    supabase
      .from('lessons')
      .select('*, teachers(name), classrooms(name)')
      .eq('class_id', selectedClass)
      .then(({ data }) => {
        setLessons(data ?? [])
        setLoading(false)
      })
  }, [selectedClass])

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-700"
        >
          <ArrowLeft size={16} /> Strona główna
        </Link>

        <div className="space-y-1 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <School size={22} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Plan lekcji</h1>
          <p className="text-sm text-slate-500">Wybierz klasę, aby zobaczyć jej plan zajęć</p>
        </div>

        <div className="mx-auto max-w-xs">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Wybierz klasę…</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {selectedClass &&
          (loading ? (
            <div className="text-center text-sm text-slate-400">Wczytywanie planu…</div>
          ) : (
            <ScheduleGrid lessons={lessons} isAdmin={false} />
          ))}
      </div>
    </div>
  )
}
