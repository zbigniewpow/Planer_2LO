import { Plus } from 'lucide-react'
import { DAYS, HOURS } from '../constants/schedule'

export default function ScheduleGrid({ lessons, isAdmin = false, onCellClick }) {
  const findLesson = (day, hour) =>
    lessons.find((l) => l.day_of_week === day && l.lesson_hour === hour)

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[820px] border-collapse">
        <thead>
          <tr>
            <th className="w-28 border-b border-slate-200 bg-slate-50 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Godzina
            </th>
            {DAYS.map((day) => (
              <th
                key={day.value}
                className="border-b border-l border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-900"
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
                <div className="text-sm font-semibold text-slate-900">{h.hour}.</div>
                <div className="text-xs text-slate-500">
                  {h.start}–{h.end}
                </div>
              </td>
              {DAYS.map((day) => {
                const lesson = findLesson(day.value, h.hour)
                return (
                  <td key={day.value} className="border-b border-l border-slate-100 p-1.5 align-top">
                    {lesson ? (
                      <div className="h-full rounded-xl border border-blue-100 bg-blue-50 px-3 py-2">
                        <div className="text-sm font-semibold text-slate-900">{lesson.subject}</div>
                        <div className="mt-0.5 text-xs text-slate-600">{lesson.teachers?.name}</div>
                        <div className="text-xs text-slate-400">sala {lesson.classrooms?.name}</div>
                      </div>
                    ) : isAdmin ? (
                      <button
                        type="button"
                        onClick={() => onCellClick(day.value, h.hour)}
                        className="flex h-full min-h-[64px] w-full items-center justify-center rounded-xl border border-dashed border-slate-200 text-slate-300 transition hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-500"
                      >
                        <Plus size={18} />
                      </button>
                    ) : (
                      <div className="min-h-[64px]" />
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
