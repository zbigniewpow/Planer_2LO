import { HOURS } from '../constants/schedule'

export default function PrintHoursLegend() {
  return (
    <div className="mb-2 flex flex-wrap gap-x-3 gap-y-0.5 border-b border-slate-300 pb-1.5 text-[9px] text-slate-500">
      {HOURS.map((h) => (
        <span key={h.hour}>
          <span className="font-semibold text-slate-700">{h.hour + 1}.</span> {h.start}–{h.end}
        </span>
      ))}
    </div>
  )
}
