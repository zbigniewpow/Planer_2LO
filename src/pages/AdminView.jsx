import { useCallback, useEffect, useState } from 'react'
import { LogOut, LayoutGrid } from 'lucide-react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import ScheduleGrid from '../components/ScheduleGrid'
import LessonModal from '../components/LessonModal'

export default function AdminView() {
  const { signOut } = useAuth()
  const [classes, setClasses] = useState([])
  const [teachers, setTeachers] = useState([])
  const [classrooms, setClassrooms] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalCell, setModalCell] = useState(null) // { day, hour }

  useEffect(() => {
    Promise.all([
      supabase.from('classes').select('*').order('name'),
      supabase.from('teachers').select('*').order('name'),
      supabase.from('classrooms').select('*').order('name'),
    ]).then(([classesRes, teachersRes, classroomsRes]) => {
      setClasses(classesRes.data ?? [])
      setTeachers(teachersRes.data ?? [])
      setClassrooms(classroomsRes.data ?? [])
      if (classesRes.data?.length) setSelectedClass(classesRes.data[0].id)
    })
  }, [])

  const loadLessons = useCallback(() => {
    if (!selectedClass) return
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

  useEffect(() => {
    loadLessons()
  }, [loadLessons])

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
              <LayoutGrid size={18} />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">Panel administratora</div>
              <div className="text-xs text-slate-500">II LO Sandomierz — plan lekcji</div>
            </div>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <LogOut size={16} /> Wyloguj
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Plan zajęć</h1>
            <p className="text-sm text-slate-500">Kliknij puste pole, aby dodać lekcję</p>
          </div>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-64"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-center text-sm text-slate-400">Wczytywanie planu…</div>
        ) : (
          <ScheduleGrid
            lessons={lessons}
            isAdmin
            onCellClick={(day, hour) => setModalCell({ day, hour })}
          />
        )}
      </main>

      {modalCell && (
        <LessonModal
          day={modalCell.day}
          hour={modalCell.hour}
          classId={selectedClass}
          teachers={teachers}
          classrooms={classrooms}
          onClose={() => setModalCell(null)}
          onSaved={loadLessons}
        />
      )}
    </div>
  )
}
