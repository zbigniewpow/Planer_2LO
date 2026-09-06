import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Printer } from 'lucide-react'
import { supabase } from '../supabaseClient'
import PrintScheduleTable from '../components/PrintScheduleTable'
import { abbreviateSubject } from '../lib/printFormat'

const PER_PAGE = 8 // 2 kolumny x 4 wiersze — nauczyciel nie może mieć 2 lekcji naraz, więc tabele są płytsze niż u klas

function chunk(arr, size) {
  const out = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

export default function PrintTeachers() {
  const [teachers, setTeachers] = useState([])
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('teachers').select('*').order('name'),
      supabase.from('lessons').select('*, classes(name), classrooms(name)'),
    ]).then(([teachersRes, lessonsRes]) => {
      setTeachers(teachersRes.data ?? [])
      setLessons(lessonsRes.data ?? [])
      setLoading(false)
    })
  }, [])

  const teachersWithLessons = teachers.filter((t) => lessons.some((l) => l.teacher_id === t.id))
  const pages = chunk(teachersWithLessons, PER_PAGE)

  const renderLines = (lesson) =>
    [
      abbreviateSubject(lesson.subject) + (lesson.group_name ? ` (${lesson.group_name})` : ''),
      [lesson.classes?.name ? `kl. ${lesson.classes.name}` : null, lesson.classrooms?.name]
        .filter(Boolean)
        .join(' · '),
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
        Plan lekcji — wszyscy nauczyciele ({pages.length} {pages.length === 1 ? 'strona' : 'strony'} A3)
      </h1>

      {loading ? (
        <div className="text-center text-sm text-slate-400">Wczytywanie…</div>
      ) : (
        pages.map((group, i) => (
          <div key={i} className="print-page grid grid-cols-2 gap-3">
            {group.map((teacher) => (
              <PrintScheduleTable
                key={teacher.id}
                compact
                title={teacher.name}
                lessons={lessons.filter((l) => l.teacher_id === teacher.id)}
                renderLines={renderLines}
              />
            ))}
          </div>
        ))
      )}
    </div>
  )
}
