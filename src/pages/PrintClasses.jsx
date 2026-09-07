import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Printer } from 'lucide-react'
import { supabase } from '../supabaseClient'
import PrintMasterGrid from '../components/PrintMasterGrid'

export default function PrintClasses() {
  const [classes, setClasses] = useState([])
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('classes').select('*').order('name'),
      supabase.from('lessons').select('*, classrooms(name)'),
    ]).then(([classesRes, lessonsRes]) => {
      setClasses(classesRes.data ?? [])
      setLessons(lessonsRes.data ?? [])
      setLoading(false)
    })
  }, [])

  // Zawsze dokładnie 2 strony — dzielimy listę klas na pół,
  // niezależnie od tego ile ich jest.
  const half = Math.ceil(classes.length / 2)
  const groups = [classes.slice(0, half), classes.slice(half)]

  const getCellLessons = (classId, day, hour) =>
    lessons.filter((l) => l.class_id === classId && l.day_of_week === day && l.lesson_hour === hour)

  return (
    <div className="min-h-screen bg-white px-4 py-4">
      <div className="no-print mb-4 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-700"
        >
          <ArrowLeft size={16} /> Strona główna
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600"
        >
          <Printer size={16} /> Drukuj / zapisz jako PDF (2× A3)
        </button>
      </div>

      <h1 className="no-print mb-3 font-heading text-base font-bold text-slate-900">
        Plan lekcji — wszystkie klasy (2 strony A3, poziomo)
      </h1>

      {loading ? (
        <div className="text-center text-sm text-slate-400">Wczytywanie…</div>
      ) : (
        groups.map((group, i) => (
          <div key={i} className="print-page mb-6">
            <PrintMasterGrid
              columns={group.map((c) => ({ id: c.id, label: c.name }))}
              getCellLessons={getCellLessons}
            />
          </div>
        ))
      )}
    </div>
  )
}
