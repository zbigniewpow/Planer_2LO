import { useState } from 'react'
import { X, AlertTriangle, Trash2 } from 'lucide-react'
import { supabase } from '../supabaseClient'
import { DAYS, HOURS } from '../constants/schedule'

export default function LessonModal({ day, hour, classId, teachers, classrooms, subjects, lesson, onClose, onSaved }) {
  const isEditMode = !!lesson

  const [subject, setSubject] = useState(lesson?.subject ?? '')
  const [groupName, setGroupName] = useState(lesson?.group_name ?? '')
  const [teacherId, setTeacherId] = useState(lesson?.teacher_id ?? '')
  const [classroomId, setClassroomId] = useState(lesson?.classroom_id ?? '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

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
      // a nauczyciel LUB sala już zajęte w innej klasie. Przy edycji
      // wykluczamy własny rekord, żeby nie wykryć kolizji sam ze sobą.
      let conflictQuery = supabase
        .from('lessons')
        .select('id, teacher_id, classroom_id, classes(name)')
        .eq('day_of_week', day)
        .eq('lesson_hour', hour)
        .or(`teacher_id.eq.${teacherId},classroom_id.eq.${classroomId}`)

      if (isEditMode) {
        conflictQuery = conflictQuery.neq('id', lesson.id)
      }

      const { data: conflicts, error: fetchError } = await conflictQuery

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

      // KROK 2: brak kolizji — zapis lekcji (dodanie albo aktualizacja).
      if (isEditMode) {
        const { error: updateError } = await supabase
          .from('lessons')
          .update({
            teacher_id: teacherId,
            classroom_id: classroomId,
            subject: subject.trim(),
            group_name: groupName.trim() || null,
          })
          .eq('id', lesson.id)

        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase.from('lessons').insert({
          day_of_week: day,
          lesson_hour: hour,
          class_id: classId,
          teacher_id: teacherId,
          classroom_id: classroomId,
          subject: subject.trim(),
          group_name: groupName.trim() || null,
        })

        if (insertError) throw insertError
      }

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

  const handleDelete = async () => {
    setDeleting(true)
    setError('')
    try {
      const { error: deleteError } = await supabase.from('lessons').delete().eq('id', lesson.id)
      if (deleteError) throw deleteError
      onSaved()
      onClose()
    } catch (err) {
      setError(err.message ?? 'Nie udało się usunąć lekcji.')
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="font-heading text-lg font-bold text-slate-900">
              {isEditMode ? 'Edytuj lekcję' : 'Dodaj lekcję'}
            </h2>
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
            <label className="mb-1 block text-sm font-medium text-slate-700">Grupa (opcjonalnie)</label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="np. Grupa 1, Angielski gr. I…"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
            <p className="mt-1 text-xs text-slate-400">
              Zostaw puste, jeśli lekcja dotyczy całej klasy. Wypełnij, gdy klasa dzieli się na
              równoległe grupy w tym samym terminie.
            </p>
          </div>

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

          <div className={`flex items-center pt-1 ${isEditMode ? 'justify-between' : 'justify-end'}`}>
            {isEditMode &&
              (confirmingDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Na pewno?</span>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="text-xs font-semibold text-red-600 transition hover:text-red-700 disabled:opacity-50"
                  >
                    {deleting ? 'Usuwanie…' : 'Tak, usuń'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingDelete(false)}
                    className="text-xs text-slate-500 transition hover:text-slate-700"
                  >
                    Anuluj
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(true)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-red-600 transition hover:text-red-700"
                >
                  <Trash2 size={14} /> Usuń lekcję
                </button>
              ))}

            <div className="flex gap-2">
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
                {saving ? 'Zapisywanie…' : isEditMode ? 'Zapisz zmiany' : 'Dodaj lekcję'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
