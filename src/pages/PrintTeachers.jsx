import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Printer } from 'lucide-react'
import { supabase } from '../supabaseClient'
import PrintMasterGrid from '../components/PrintMasterGrid'
import { formatTeacherShort } from '../lib/printFormat'

export default function PrintTeachers() {
  const [teachers, setTeachers] = useState([])
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('teachers').select('*').order('name'),
      supabase.from('lessons').select('*, classrooms(name)'),
    ]).then(([teachersRes, lessonsRes]) => {
      setTeachers(teachersRes.data ?? [])
      setLessons(lessonsRes.data ?? [])
      setLoading(false)
    })
  }, [])

  // Tylko nauczyciele z choć jedną lekcją, potem zawsze dokładnie
  // 2 strony — dzielimy listę na pół, niezależnie ile ich zostanie.
  const teachersWithLessons = teachers.filter((t) => lessons.some((l) => l.teacher_id === t.id))
  const half = Math.ceil(teachersWithLessons.length / 2)
  const groups = [teachersWithLessons.slice(0, half), teachersWithLessons.slice(half)]

  const getCellLessons = (teacherId, day, hour) =>
    lessons.filter((l) => l.teacher_id === teacherId && l.day_of_week === day && l.lesson_hour === hour)

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
        Plan lekcji — wszyscy nauczyciele (2 strony A3, poziomo)
      </h1>

      {loading ? (
        <div className="text-center text-sm text-slate-400">Wczytywanie…</div>
      ) : (
        groups.map((group, i) => (
          <div key={i} className="print-page mb-6">
            <PrintMasterGrid
              columns={group.map((t) => ({ id: t.id, label: formatTeacherShort(t.name) }))}
              getCellLessons={getCellLessons}
              verticalHeaders
            />
          </div>
        ))
      )}
    </div>
  )
}
