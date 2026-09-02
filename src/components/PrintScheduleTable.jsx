import { DAYS, HOURS } from '../constants/schedule'

export default function PrintScheduleTable({ title, subtitle, lessons, secondaryLine, compact = false }) {
  const findLessons = (day, hour) =>
    lessons.filter((l) => l.day_of_week === day && l.lesson_hour === hour)

  if (compact) {
    return (
      <section className="overflow-hidden rounded border border-slate-300 p-1.5">
        <h3 className="mb-1 truncate text-[9px] font-bold text-slate-900">{title}</h3>
        <table className="w-full table-fixed border-collapse text-[8px] leading-[10px]">
          <thead>
            <tr>
              <th className="w-[7%] border border-slate-200 bg-slate-50"></th>
              {DAYS.map((day) => (
                <th key={day.value} className="border border-slate-200 bg-slate-50 font-semibold">
                  {day.label.slice(0, 2)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HOURS.map((h) => (
              <tr key={h.hour}>
                <td className="border border-slate-200 text-center text-slate-500">{h.hour + 1}</td>
                {DAYS.map((day) => {
                  const cellLessons = findLessons(day.value, h.hour)
                  return (
                    <td key={day.value} className="overflow-hidden border border-slate-200 px-1">
                      {cellLessons.map((lesson) => (
                        <div key={lesson.id} className="truncate">
                          <span className="font-semibold text-slate-900">{lesson.subject}</span>
                          {secondaryLine && <span className="text-slate-500"> {secondaryLine(lesson)}</span>}
                        </div>
                      ))}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    )
  }

  return (
    <section className="print-page mb-8">
      <h2 className="font-heading text-base font-bold text-slate-900">{title}</h2>
      {subtitle && <p className="mb-2 text-[10px] text-slate-500">{subtitle}</p>}
      <table className="w-full border-collapse text-[10px]">
        <thead>
          <tr>
            <th className="w-14 border border-slate-300 bg-slate-100 px-1.5 py-1 text-left font-semibold">
              Godz.
            </th>
            {DAYS.map((day) => (
              <th key={day.value} className="border border-slate-300 bg-slate-100 px-1.5 py-1 font-semibold">
                {day.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {HOURS.map((h) => (
            <tr key={h.hour}>
              <td className="border border-slate-300 px-1.5 py-1 align-top">
                <div className="font-semibold text-slate-900">{h.hour + 1}.</div>
                <div className="text-slate-500">
                  {h.start}–{h.end}
                </div>
              </td>
              {DAYS.map((day) => {
                const cellLessons = findLessons(day.value, h.hour)
                return (
                  <td key={day.value} className="border border-slate-300 px-1.5 py-1 align-top">
                    {cellLessons.map((lesson) => (
                      <div key={lesson.id} className="mb-1 last:mb-0">
                        {lesson.group_name && (
                          <div className="font-bold uppercase text-slate-500">{lesson.group_name}</div>
                        )}
                        <div className="font-semibold text-slate-900">{lesson.subject}</div>
                        <div className="text-slate-500">{secondaryLine(lesson)}</div>
                      </div>
                    ))}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
