import { useState, useRef, useEffect } from 'react'
import { ChevronDown, SlidersHorizontal, TrendingUp, Check } from 'lucide-react'
import DateRangePicker from './DateRangePicker'

const APPS = [
  {
    id: 'square',
    label: 'Square Point of Sale (POS)',
    icon: (
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: '#1a1a1a' }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="2" width="12" height="12" rx="2" stroke="white" strokeWidth="1.5" fill="none" />
          <rect x="5" y="5" width="6" height="6" rx="1" stroke="white" strokeWidth="1.5" fill="none" />
        </svg>
      </div>
    ),
  },
  {
    id: 'cashapp',
    label: 'Cash App',
    icon: (
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: '#00D632' }}
      >
        <span className="text-white font-bold text-base leading-none">$</span>
      </div>
    ),
  },
  {
    id: 'afterpay',
    label: 'Afterpay',
    icon: (
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: '#B2FCE4' }}
      >
        <span className="font-bold text-sm leading-none" style={{ color: '#000000' }}>A</span>
      </div>
    ),
  },
]

export const APP_GOALS = {
  'Square Point of Sale (POS)': ['Purchase', 'Sign Up', 'Subscription'],
  'Cash App':                   ['Send Money', 'Card Activation', 'Direct Deposit'],
  'Afterpay':                   ['Purchase', 'Sign Up', 'Subscription'],
}

const ATTRIBUTION_OPTIONS = [
  'With Re-Attribution',
  'Only Re-Attribution',
  'Without Re-Attribution',
]

// ── Display-only app chip ─────────────────────────────────────────────────────
function AppDisplay({ app }) {
  const appDef = APPS.find((a) => a.label === app)
  return (
    <div
      className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium select-none"
      style={{ color: '#111827', minWidth: 220, backgroundColor: '#ffffff' }}
    >
      {appDef?.icon ?? (
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-gray-200">
          <span className="text-xs font-bold text-gray-600">{app[0]}</span>
        </div>
      )}
      <span className="flex-1 text-left truncate">{app}</span>
    </div>
  )
}

// ── Goal dropdown ─────────────────────────────────────────────────────────────
function Dropdown({ label, options, selected, onSelect, minWidth = 160 }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium select-none transition-colors"
        style={{
          borderColor: open ? '#4B7BF5' : '#e5e7eb',
          backgroundColor: '#ffffff',
          color: '#111827',
          minWidth,
        }}
      >
        <span className="flex-1 text-left">{selected || label}</span>
        <ChevronDown
          size={14}
          className="flex-shrink-0 transition-transform"
          style={{ color: '#6b7280', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-1.5 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50"
          style={{ minWidth: minWidth + 24 }}
        >
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => { onSelect(opt); setOpen(false) }}
              className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors hover:bg-gray-50"
              style={{ color: '#111827' }}
            >
              <span>{opt}</span>
              {selected === opt && <Check size={14} style={{ color: '#4B7BF5' }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Attribution dropdown ──────────────────────────────────────────────────────
function AttributionDropdown({ selected, onSelect }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative flex items-center gap-1.5">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-10 h-10 flex items-center justify-center rounded-lg border transition-colors"
        style={{
          borderColor: open ? '#4B7BF5' : '#e5e7eb',
          backgroundColor: open ? '#f0f4ff' : '#ffffff',
          color: open ? '#4B7BF5' : '#6b7280',
        }}
      >
        <SlidersHorizontal size={17} />
      </button>

      <button
        className="w-10 h-10 flex items-center justify-center rounded-lg border transition-colors"
        style={{
          borderColor: '#e5e7eb',
          backgroundColor: '#ffffff',
          color: '#6b7280',
        }}
      >
        <TrendingUp size={17} />
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-1.5 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50"
          style={{ minWidth: 220 }}
        >
          {ATTRIBUTION_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => { onSelect(opt); setOpen(false) }}
              className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors hover:bg-gray-50"
              style={{ color: '#111827' }}
            >
              <span>{opt}</span>
              {selected === opt && <Check size={14} style={{ color: '#4B7BF5' }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Filter bar ────────────────────────────────────────────────────────────────
export default function OverviewFilterBar({
  dateRange, onDateChange,
  selectedApp,
  selectedGoal, onGoalChange,
  integrationState,
}) {
  const [selectedAttribution, setSelectedAttribution] = useState('With Re-Attribution')
  const appleOnly = integrationState === 'apple-only'

  return (
    <div className="flex items-center gap-3 px-8 py-3 bg-white border-b border-gray-100">
      <AppDisplay app={selectedApp} />

      {!appleOnly && (
        <Dropdown
          label="Select Goal"
          options={APP_GOALS[selectedApp] || APP_GOALS['Square Point of Sale (POS)']}
          selected={selectedGoal}
          onSelect={onGoalChange}
          minWidth={180}
        />
      )}

      {!appleOnly && (
        <AttributionDropdown
          selected={selectedAttribution}
          onSelect={setSelectedAttribution}
        />
      )}

      <DateRangePicker
        start={dateRange.start}
        end={dateRange.end}
        onApply={(start, end, preset) => onDateChange(start, end, preset)}
        hideTimeType={appleOnly}
      />
    </div>
  )
}
