import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Printer } from 'lucide-react'
import { supabase } from '../supabaseClient'
import PrintScheduleTable from '../components/PrintScheduleTable'

export default function PrintClasses() {
  const [classes, setClasses] = useState([])
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('classes').select('*').order('name'),
      supabase.from('lessons').select('*, teachers(name), classrooms(name)'),
    ]).then(([classesRes, lessonsRes]) => {
      setClasses(classesRes.data ?? [])
      setLessons(lessonsRes.data ?? [])
      setLoading(false)
    })
  }, [])

  const half = Math.ceil(classes.length / 2)
  const groups = [classes.slice(0, half), classes.slice(half)]

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
        Plan lekcji — wszystkie klasy (2 strony A3)
      </h1>

      {loading ? (
        <div className="text-center text-sm text-slate-400">Wczytywanie…</div>
      ) : (
        groups.map((group, i) => (
          <div key={i} className="print-page grid grid-cols-3 gap-2">
            {group.map((cls) => (
              <PrintScheduleTable
                key={cls.id}
                compact
                title={cls.name}
                lessons={lessons.filter((l) => l.class_id === cls.id)}
                secondaryLine={(lesson) => lesson.classrooms?.name}
              />
            ))}
          </div>
        ))
      )}
    </div>
  )
}
