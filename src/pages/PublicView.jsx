import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, School } from 'lucide-react'
import { supabase } from '../supabaseClient'
import ScheduleGrid from '../components/ScheduleGrid'
import Combobox from '../components/Combobox'

const MODES = [
  { id: 'class', label: 'Klasa' },
  { id: 'teacher', label: 'Nauczyciel' },
  { id: 'classroom', label: 'Sala' },
]

const FILTER_COLUMN = { class: 'class_id', teacher: 'teacher_id', classroom: 'classroom_id' }

export default function PublicView() {
  const [mode, setMode] = useState('class')

  const [classes, setClasses] = useState([])
  const [teachers, setTeachers] = useState([])
  const [classrooms, setClassrooms] = useState([])

  const [classId, setClassId] = useState('')
  const [teacherId, setTeacherId] = useState('')
  const [classroomId, setClassroomId] = useState('')

  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    Promise.all([
      supabase.from('classes').select('*').order('name'),
      supabase.from('teachers').select('*').order('name'),
      supabase.from('classrooms').select('*').order('name'),
    ]).then(([classesRes, teachersRes, classroomsRes]) => {
      setClasses(classesRes.data ?? [])
      setTeachers(teachersRes.data ?? [])
      setClassrooms(classroomsRes.data ?? [])
    })
  }, [])

  const selectedId = mode === 'class' ? classId : mode === 'teacher' ? teacherId : classroomId

  const loadLessons = useCallback(() => {
    if (!selectedId) {
      setLessons([])
      return
    }
    setLoading(true)
    supabase
      .from('lessons')
      .select('*, classes(name), teachers(name), classrooms(name)')
      .eq(FILTER_COLUMN[mode], selectedId)
      .then(({ data }) => {
        setLessons(data ?? [])
        setLoading(false)
      })
  }, [mode, selectedId])

  useEffect(() => {
    loadLessons()
  }, [loadLessons])

  // Nasłuch na zmiany w bazie — plan aktualizuje się automatycznie,
  // gdy administrator doda/zmieni/usunie lekcję dla wybranej klasy,
  // nauczyciela lub sali, bez potrzeby odświeżania strony.
  useEffect(() => {
    if (!selectedId) return

    const channel = supabase
      .channel(`lessons-public-${mode}-${selectedId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'lessons', filter: `${FILTER_COLUMN[mode]}=eq.${selectedId}` },
        () => loadLessons(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [mode, selectedId, loadLessons])

  const renderCell = (lesson) => {
    if (mode === 'teacher') {
      return (
        <>
          <div className="text-sm font-semibold text-slate-900">{lesson.subject}</div>
          <div className="mt-0.5 text-xs text-slate-600">klasa {lesson.classes?.name}</div>
          <div className="text-xs text-slate-400">sala {lesson.classrooms?.name}</div>
        </>
      )
    }
    if (mode === 'classroom') {
      return (
        <>
          <div className="text-sm font-semibold text-slate-900">{lesson.subject}</div>
          <div className="mt-0.5 text-xs text-slate-600">klasa {lesson.classes?.name}</div>
          <div className="text-xs text-slate-400">{lesson.teachers?.name}</div>
        </>
      )
    }
    return (
      <>
        <div className="text-sm font-semibold text-slate-900">{lesson.subject}</div>
        <div className="mt-0.5 text-xs text-slate-600">{lesson.teachers?.name}</div>
        <div className="text-xs text-slate-400">sala {lesson.classrooms?.name}</div>
      </>
    )
  }

  const handleModeChange = (newMode) => {
    setMode(newMode)
    setLessons([])
  }

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
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-500">
            <School size={22} />
          </div>
          <h1 className="font-heading text-2xl font-extrabold text-slate-900">Plan lekcji</h1>
          <p className="text-sm text-slate-500">
            Wyszukaj plan klasy, nauczyciela albo sprawdź zajętość sali
          </p>
        </div>

        <div className="mx-auto flex max-w-xs justify-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => handleModeChange(m.id)}
              className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                mode === m.id ? 'bg-brand-500 text-white' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="mx-auto max-w-xs">
          {mode === 'class' && (
            <Combobox items={classes} value={classId} onChange={setClassId} placeholder="Wybierz klasę…" />
          )}
          {mode === 'teacher' && (
            <Combobox
              items={teachers}
              value={teacherId}
              onChange={setTeacherId}
              placeholder="Wybierz nauczyciela…"
            />
          )}
          {mode === 'classroom' && (
            <Combobox
              items={classrooms}
              value={classroomId}
              onChange={setClassroomId}
              placeholder="Wybierz salę…"
            />
          )}
        </div>

        {selectedId &&
          (loading ? (
            <div className="text-center text-sm text-slate-400">Wczytywanie planu…</div>
          ) : (
            <ScheduleGrid lessons={lessons} isAdmin={false} renderCell={renderCell} />
          ))}
      </div>
    </div>
  )
}
