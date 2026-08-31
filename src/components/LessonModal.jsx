import { useState } from 'react'
import { X, AlertTriangle } from 'lucide-react'
import { supabase } from '../supabaseClient'
import { DAYS, HOURS } from '../constants/schedule'

export default function LessonModal({ day, hour, classId, teachers, classrooms, subjects, onClose, onSaved }) {
  const [subject, setSubject] = useState('')
  const [teacherId, setTeacherId] = useState('')
  const [classroomId, setClassroomId] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const dayLabel = DAYS.find((d) => d.value === day)?.label
  const hourInfo = HOURS.find((h) => h.hour === hour)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!subject.trim() || !teacherId || !classroomId) {
      setError('Uzupełnij wszystkie pola.')
      return
    }

    setSaving(true)
    try {
      // KROK 1: sprawdzenie kolizji — ten sam dzień i godzina,
      // a nauczyciel LUB sala już zajęte w innej klasie.
      const { data: conflicts, error: fetchError } = await supabase
        .from('lessons')
        .select('id, teacher_id, classroom_id, classes(name)')
        .eq('day_of_week', day)
        .eq('lesson_hour', hour)
        .or(`teacher_id.eq.${teacherId},classroom_id.eq.${classroomId}`)

      if (fetchError) throw fetchError

      const teacherConflict = conflicts?.find((c) => c.teacher_id === teacherId)
      const roomConflict = conflicts?.find((c) => c.classroom_id === classroomId)

      if (teacherConflict) {
        const teacherName = teachers.find((t) => t.id === teacherId)?.name ?? 'Nauczyciel'
        setError(
          `Błąd: ${teacherName} prowadzi już w tym czasie lekcję w klasie ${teacherConflict.classes?.name ?? '—'}.`,
        )
        setSaving(false)
        return
      }

      if (roomConflict) {
        const roomName = classrooms.find((c) => c.id === classroomId)?.name ?? 'Sala'
        setError(
          `Błąd: sala ${roomName} jest już zajęta w tym czasie (klasa ${roomConflict.classes?.name ?? '—'}).`,
        )
        setSaving(false)
        return
      }

      // KROK 2: brak kolizji — zapis lekcji.
      const { error: insertError } = await supabase.from('lessons').insert({
        day_of_week: day,
        lesson_hour: hour,
        class_id: classId,
        teacher_id: teacherId,
        classroom_id: classroomId,
        subject: subject.trim(),
      })

      if (insertError) throw insertError

      onSaved()
      onClose()
    } catch (err) {
      if (err.code === '23505') {
        // Naruszenie unikalnego indeksu w bazie — ktoś zajął ten termin
        // ułamek sekundy wcześniej, zanim zdążyliśmy zapisać (wyścig
        // między dwoma administratorami pracującymi równocześnie).
        setError(
          'Błąd: ten termin (nauczyciel lub sala) został właśnie zajęty przez innego administratora. Odśwież plan i spróbuj ponownie.',
        )
      } else {
        setError(err.message ?? 'Wystąpił nieoczekiwany błąd podczas zapisu.')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="font-heading text-lg font-bold text-slate-900">Dodaj lekcję</h2>
            <p className="text-sm text-slate-500">
              {dayLabel}, {hourInfo?.start}–{hourInfo?.end}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Przedmiot</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            >
              <option value="">Wybierz przedmiot…</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Nauczyciel</label>
            <select
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            >
              <option value="">Wybierz nauczyciela…</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Sala</label>
            <select
              value={classroomId}
              onChange={(e) => setClassroomId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            >
              <option value="">Wybierz salę…</option>
              {classrooms.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 disabled:opacity-50"
            >
              {saving ? 'Zapisywanie…' : 'Dodaj lekcję'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
