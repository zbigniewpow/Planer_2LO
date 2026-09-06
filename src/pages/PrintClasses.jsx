import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Printer } from 'lucide-react'
import { supabase } from '../supabaseClient'
import PrintScheduleTable from '../components/PrintScheduleTable'
import { abbreviateSubject, formatTeacherShort } from '../lib/printFormat'

const PER_PAGE = 4 // 2 kolumny x 2 wiersze — większe siatki, więcej stron, czytelniejszy druk

function chunk(arr, size) {
  const out = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

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

  const pages = chunk(classes, PER_PAGE)

  const renderLines = (lesson) =>
    [
      abbreviateSubject(lesson.subject) + (lesson.group_name ? ` (${lesson.group_name})` : ''),
      [formatTeacherShort(lesson.teachers?.name), lesson.classrooms?.name].filter(Boolean).join(' · '),
    ].filter(Boolean)

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
          <Printer size={16} /> Drukuj / zapisz jako PDF (A3)
        </button>
      </div>

      <h1 className="no-print mb-3 font-heading text-base font-bold text-slate-900">
        Plan lekcji — wszystkie klasy ({pages.length} {pages.length === 1 ? 'strona' : 'strony'} A3)
      </h1>

      {loading ? (
        <div className="text-center text-sm text-slate-400">Wczytywanie…</div>
      ) : (
        pages.map((group, i) => (
          <div key={i} className="print-page grid grid-cols-2 gap-3">
            {group.map((cls) => (
              <PrintScheduleTable
                key={cls.id}
                compact
                title={cls.name}
                lessons={lessons.filter((l) => l.class_id === cls.id)}
                renderLines={renderLines}
              />
            ))}
          </div>
        ))
      )}
    </div>
  )
}
