import { useState, useRef, useEffect } from 'react'
import { CalendarDays, ChevronDown, Check } from 'lucide-react'

const TODAY = new Date(2026, 4, 21)

const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function subDays(d, n) { const r = new Date(d); r.setDate(r.getDate() - n); return r }

export function isSameDay(a, b) {
  return a && b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

export function fmtDate(d) {
  return `${SHORT_MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

export const PRESETS = [
  { label: 'Last 7 Days',  start: subDays(TODAY, 6),  end: TODAY },
  { label: 'Last 14 Days', start: subDays(TODAY, 13), end: TODAY },
  { label: 'Last 28 Days', start: subDays(TODAY, 27), end: TODAY },
]

function findPresetLabel(start, end) {
  return PRESETS.find(
    (p) => isSameDay(p.start, start) && isSameDay(p.end, end)
  )?.label || null
}

export default function DateRangePicker({ start, end, onApply, hideTimeType = false }) {
  const [open, setOpen]           = useState(false)
  const [pendingPreset, setPendingPreset] = useState(() => findPresetLabel(start, end) || PRESETS[0].label)
  const [timeType, setTimeType]   = useState('Event Time')
  const ref = useRef(null)

  const activeLabel = findPresetLabel(start, end) || PRESETS[0].label

  useEffect(() => {
    function outside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', outside)
    return () => document.removeEventListener('mousedown', outside)
  }, [])

  const handleOpen = () => {
    setPendingPreset(activeLabel)
    setOpen(true)
  }

  const handleApply = () => {
    const preset = PRESETS.find((p) => p.label === pendingPreset) || PRESETS[0]
    onApply?.(preset.start, preset.end, preset.label)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative ml-auto">
      {/* Trigger */}
      <button
        onClick={() => (open ? setOpen(false) : handleOpen())}
        className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold select-none transition-colors"
        style={{
          borderColor:     open ? '#4B7BF5' : '#e5e7eb',
          backgroundColor: '#ffffff',
          color:           '#111827',
          minWidth:        160,
        }}
      >
        <CalendarDays size={15} style={{ color: '#6b7280' }} />
        <span className="flex-1 text-left">{activeLabel}</span>
        <ChevronDown
          size={14}
          style={{
            color:     '#6b7280',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s',
          }}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute top-full right-0 mt-2 bg-white rounded-2xl shadow-xl z-50 overflow-hidden"
          style={{ minWidth: 320, border: '1px solid #e5e7eb' }}
        >
          {/* Preset list */}
          <div className="py-2">
            {PRESETS.map((p) => {
              const isSelected = pendingPreset === p.label
              return (
                <button
                  key={p.label}
                  onClick={() => setPendingPreset(p.label)}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-gray-50"
                  style={{
                    color:      isSelected ? '#4B7BF5' : '#374151',
                    fontWeight: isSelected ? '500' : '400',
                  }}
                >
                  {p.label}
                  {isSelected && <Check size={14} style={{ color: '#4B7BF5' }} />}
                </button>
              )
            })}
          </div>

          {/* Attribution Window */}
          {!hideTimeType && (
            <div
              className="px-4 py-3 flex items-center gap-2"
              style={{ borderTop: '1px solid #f3f4f6', borderBottom: '1px solid #f3f4f6' }}
            >
              <span className="text-xs font-medium flex-shrink-0" style={{ color: '#6b7280' }}>
                Attribution:
              </span>
              {['Event Time', 'Install Time'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setTimeType(opt)}
                  className="flex-1 py-1 rounded-lg text-xs font-medium transition-colors"
                  style={{
                    backgroundColor: timeType === opt ? '#0f172a' : '#f3f4f6',
                    color:           timeType === opt ? '#ffffff' : '#6b7280',
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {/* Apply */}
          <div className="flex justify-end px-4 py-3">
            <button
              onClick={handleApply}
              className="px-5 py-1.5 rounded-xl text-sm font-semibold transition-colors"
              style={{ backgroundColor: '#0f172a', color: '#ffffff' }}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
