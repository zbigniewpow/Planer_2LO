import { DAYS, HOURS } from '../constants/schedule'
import { abbreviateSubject, abbreviateRoom } from '../lib/printFormat'

// columns: [{ id, label }]
// getCellLessons: (columnId, day, hour) => lekcje pasujące do tego slotu dla tej kolumny
export default function PrintMasterGrid({ columns, getCellLessons, verticalHeaders = false }) {
  return (
    <table className="w-full table-fixed border-collapse text-[12px] leading-[15px]">
      <colgroup>
        <col className="w-[12px]" />
        <col className="w-[14px]" />
        {columns.map((c) => (
          <col key={c.id} />
        ))}
      </colgroup>
      <thead>
        <tr>
          <th className="border border-slate-300 bg-slate-100"></th>
          <th className="border border-slate-300 bg-slate-100"></th>
          {columns.map((c) => (
            <th
              key={c.id}
              className={`border border-slate-300 bg-slate-100 px-0.5 py-1 font-semibold text-slate-700 ${
                verticalHeaders ? 'h-[110px] whitespace-nowrap text-[12px] [writing-mode:vertical-rl]' : ''
              }`}
            >
              {c.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {DAYS.map((day) =>
          HOURS.map((h, hIdx) => (
            <tr key={`${day.value}-${h.hour}`}>
              {hIdx === 0 && (
                <td
                  rowSpan={HOURS.length}
                  className="border border-slate-300 bg-slate-50 text-center font-semibold text-slate-700 [writing-mode:vertical-rl]"
                >
                  {day.label.slice(0, 2)}
                </td>
              )}
              <td className="border border-slate-300 text-center font-semibold text-slate-700">
                {h.hour + 1}
              </td>
              {columns.map((col) => {
                const cellLessons = getCellLessons(col.id, day.value, h.hour)
                const text = cellLessons
                  .map((l) => {
                    const subj = abbreviateSubject(l.subject)
                    const room = abbreviateRoom(l.classrooms?.name)
                    return room ? `${subj} ${room}` : subj
                  })
                  .join(' / ')
                return (
                  <td key={col.id} className="overflow-hidden truncate border border-slate-200 px-1">
                    {text}
                  </td>
                )
              })}
            </tr>
          )),
        )}
      </tbody>
    </table>
  )
}
