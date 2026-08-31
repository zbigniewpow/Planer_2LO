import { useState } from 'react'
import { Plus } from 'lucide-react'
import { DAYS, HOURS } from '../constants/schedule'

const defaultRenderCell = (lesson) => (
  <>
    {lesson.group_name && (
      <div className="text-[10px] font-bold uppercase tracking-wide text-brand-600">{lesson.group_name}</div>
    )}
    <div className="text-sm font-semibold text-slate-900">{lesson.subject}</div>
    <div className="mt-0.5 text-xs text-slate-600">{lesson.teachers?.name}</div>
    <div className="text-xs text-slate-400">sala {lesson.classrooms?.name}</div>
  </>
)

export default function ScheduleGrid({ lessons, isAdmin = false, onCellClick, onLessonClick, renderCell = defaultRenderCell }) {
  const [mobileDay, setMobileDay] = useState(DAYS[0].value)

  // Zwraca tablicę lekcji dla danego slotu — może być ich kilka, jeśli
  // klasa dzieli się na równoległe grupy w tym samym terminie.
  const findLessons = (day, hour) =>
    lessons.filter((l) => l.day_of_week === day && l.lesson_hour === hour)

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Widok mobilny: zakładki dni + pionowa lista godzin */}
      <div className="sm:hidden">
        <div className="flex gap-1 overflow-x-auto border-b border-slate-100 p-2">
          {DAYS.map((day) => (
            <button
              key={day.value}
              type="button"
              onClick={() => setMobileDay(day.value)}
              className={`shrink-0 rounded-lg px-3 py-1.5 font-heading text-sm font-bold uppercase tracking-wide transition ${
                mobileDay === day.value
                  ? 'bg-brand-500 text-white'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {day.label}
            </button>
          ))}
        </div>
        <div className="divide-y divide-slate-100">
          {HOURS.map((h) => {
            const cellLessons = findLessons(mobileDay, h.hour)
            return (
              <div key={h.hour} className="flex items-stretch gap-3 px-3 py-2.5">
                <div className="w-14 shrink-0 pt-0.5">
                  <div className="text-sm font-semibold text-slate-900">{h.hour + 1}.</div>
                  <div className="text-[11px] text-slate-500">
                    {h.start}–{h.end}
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-1.5">
                  {cellLessons.map((lesson) =>
                    isAdmin ? (
                      <button
                        key={lesson.id}
                        type="button"
                        onClick={() => onLessonClick(lesson)}
                        className="w-full rounded-xl border border-brand-100 bg-brand-50 px-3 py-2 text-left transition active:border-brand-300 active:bg-brand-100/60"
                      >
                        {renderCell(lesson)}
                      </button>
                    ) : (
                      <div key={lesson.id} className="rounded-xl border border-brand-100 bg-brand-50 px-3 py-2">
                        {renderCell(lesson)}
                      </div>
                    ),
                  )}
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => onCellClick(mobileDay, h.hour)}
                      className={`flex w-full items-center justify-center rounded-xl border border-dashed border-slate-200 text-slate-300 transition active:bg-brand-50 active:text-brand-500 ${
                        cellLessons.length === 0 ? 'min-h-[52px]' : 'py-1.5'
                      }`}
                    >
                      <Plus size={16} />
                    </button>
                  )}
                  {!isAdmin && cellLessons.length === 0 && <div className="min-h-[52px]" />}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Widok tablet/desktop: pełna siatka */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full min-w-[820px] border-collapse">
          <thead>
            <tr>
              <th className="w-28 border-b border-slate-200 bg-slate-50 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Godzina
              </th>
              {DAYS.map((day) => (
                <th
                  key={day.value}
                  className="border-b border-l border-slate-200 bg-slate-50 px-3 py-3 font-heading text-sm font-bold uppercase tracking-wide text-slate-900"
                >
                  {day.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HOURS.map((h) => (
              <tr key={h.hour}>
                <td className="border-b border-slate-100 px-3 py-3 align-top">
                  <div className="text-sm font-semibold text-slate-900">{h.hour + 1}.</div>
                  <div className="text-xs text-slate-500">
                    {h.start}–{h.end}
                  </div>
                </td>
                {DAYS.map((day) => {
                  const cellLessons = findLessons(day.value, h.hour)
                  return (
                    <td key={day.value} className="border-b border-l border-slate-100 p-1.5 align-top">
                      <div className="flex h-full flex-col gap-1.5">
                        {cellLessons.map((lesson) =>
                          isAdmin ? (
                            <button
                              key={lesson.id}
                              type="button"
                              onClick={() => onLessonClick(lesson)}
                              className="w-full rounded-xl border border-brand-100 bg-brand-50 px-3 py-2 text-left transition hover:border-brand-300 hover:bg-brand-100/60"
                            >
                              {renderCell(lesson)}
                            </button>
                          ) : (
                            <div key={lesson.id} className="rounded-xl border border-brand-100 bg-brand-50 px-3 py-2">
                              {renderCell(lesson)}
                            </div>
                          ),
                        )}
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => onCellClick(day.value, h.hour)}
                            className={`flex w-full flex-1 items-center justify-center rounded-xl border border-dashed border-slate-200 text-slate-300 transition hover:border-brand-300 hover:bg-brand-50/50 hover:text-brand-500 ${
                              cellLessons.length === 0 ? 'min-h-[64px]' : 'py-1'
                            }`}
                          >
                            <Plus size={16} />
                          </button>
                        )}
                        {!isAdmin && cellLessons.length === 0 && <div className="min-h-[64px]" />}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
