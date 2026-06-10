import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check, Info, ChevronUp } from 'lucide-react'
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
  {
    id: 'mockapp',
    label: 'Mock App',
    icon: (
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: '#6366f1' }}
      >
        <span className="text-white font-bold text-xs leading-none">M</span>
      </div>
    ),
  },
]

export const APP_GOALS = {
  'Square Point of Sale (POS)': ['Purchase', 'Sign Up', 'Subscription'],
  'Cash App':                   ['Send Money', 'Card Activation', 'Direct Deposit'],
  'Afterpay':                   ['Purchase', 'Sign Up', 'Subscription'],
  'Mock App':                   ['Purchase', 'Sign Up', 'Subscription'],
}

const ATTRIBUTION_OPTIONS = [
  'With Re-Attribution',
  'Only Re-Attribution',
  'Without Re-Attribution',
]

// ── App chip / dropdown ───────────────────────────────────────────────────────
function AppIcon({ app }) {
  const appDef = APPS.find((a) => a.label === app)
  if (appDef?.icon) return appDef.icon
  return (
    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-gray-200">
      <span className="text-xs font-bold text-gray-600">{app[0]}</span>
    </div>
  )
}

function AppDisplay({ app }) {
  return (
    <div
      className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium select-none"
      style={{ color: '#111827', minWidth: 220, backgroundColor: '#ffffff' }}
    >
      <AppIcon app={app} />
      <span className="flex-1 text-left truncate">{app}</span>
    </div>
  )
}

function AppDropdown({ apps, selected, onSelect }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-lg border text-sm font-medium transition-colors select-none"
        style={{
          borderColor:     open ? '#4B7BF5' : '#e5e7eb',
          backgroundColor: '#ffffff',
          color:           '#111827',
          minWidth:        220,
        }}
      >
        <AppIcon app={selected} />
        <span className="flex-1 text-left truncate">{selected}</span>
        {open
          ? <ChevronUp   size={14} style={{ color: '#6b7280', flexShrink: 0 }} />
          : <ChevronDown size={14} style={{ color: '#6b7280', flexShrink: 0 }} />
        }
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-1.5 bg-white rounded-xl py-1.5 z-50"
          style={{ minWidth: 240, border: '1px solid #e5e7eb', boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}
        >
          {apps.map((app) => (
            <button
              key={app}
              onClick={() => { onSelect(app); setOpen(false) }}
              className="w-full flex items-center gap-2.5 px-3 py-2 transition-colors hover:bg-gray-50"
            >
              <AppIcon app={app} />
              <span
                className="flex-1 text-left text-sm"
                style={{ color: selected === app ? '#4B7BF5' : '#111827', fontWeight: selected === app ? '500' : '400' }}
              >
                {app}
              </span>
              {selected === app && <Check size={13} style={{ color: '#4B7BF5', flexShrink: 0 }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Mini dropdown (used inside the grouped filter bar) ────────────────────────
function MiniDropdown({ label, placeholder, options, selected, onSelect }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const isEmpty = selected === null || selected === undefined

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors select-none"
        style={{
          border:          `1px solid ${open ? '#4B7BF5' : '#e5e7eb'}`,
          backgroundColor: open ? '#f0f4ff' : '#ffffff',
          color:           open ? '#4B7BF5' : '#374151',
        }}
      >
        <span className="text-xs font-medium" style={{ color: '#9ca3af' }}>{label}:</span>
        <span style={{ color: isEmpty ? '#9ca3af' : 'inherit' }}>
          {isEmpty ? placeholder : selected}
        </span>
        <ChevronDown
          size={11}
          style={{
            color:      open ? '#4B7BF5' : '#9ca3af',
            transform:  open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s',
            flexShrink: 0,
          }}
        />
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-1.5 bg-white rounded-xl py-1.5 z-50"
          style={{ minWidth: 200, border: '1px solid #e5e7eb', boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}
        >
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => { onSelect(opt); setOpen(false) }}
              className="w-full flex items-center justify-between px-4 py-2 text-xs text-left transition-colors hover:bg-gray-50"
              style={{ color: selected === opt ? '#4B7BF5' : '#374151', fontWeight: selected === opt ? '500' : '400' }}
            >
              {opt}
              {selected === opt && <Check size={11} style={{ color: '#4B7BF5' }} />}
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
  apps = [],
  selectedApp,
  onAppChange,
  selectedGoal, onGoalChange,
  integrationState,
}) {
  const [selectedAttribution, setSelectedAttribution] = useState(null)
  const appleOnly = integrationState === 'apple-only'

  return (
    <div className="flex items-center gap-3 px-6 py-2.5 bg-white border-b border-gray-100">
      {apps.length > 1
        ? <AppDropdown apps={apps} selected={selectedApp} onSelect={onAppChange} />
        : <AppDisplay app={selectedApp} />
      }

      {!appleOnly && (
        <div
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl"
          style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}
        >
          <span className="text-xs font-medium whitespace-nowrap" style={{ color: '#6b7280' }}>
            Goal View:
          </span>
          <MiniDropdown
            label="Goal"
            placeholder="Select a Goal"
            options={APP_GOALS[selectedApp] || APP_GOALS['Square Point of Sale (POS)']}
            selected={selectedGoal}
            onSelect={onGoalChange}
          />
          <MiniDropdown
            label="Attribution"
            placeholder="Select an Attribution"
            options={ATTRIBUTION_OPTIONS}
            selected={selectedAttribution}
            onSelect={setSelectedAttribution}
          />
        </div>
      )}

      {!appleOnly && (
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg" style={{ backgroundColor: '#f0f4ff' }}>
          <Info size={12} style={{ color: '#4B7BF5', flexShrink: 0 }} />
          <span className="text-xs" style={{ color: '#4B7BF5', whiteSpace: 'nowrap' }}>
            Reporting is based on install time
          </span>
        </div>
      )}

      <DateRangePicker
        start={dateRange.start}
        end={dateRange.end}
        onApply={(start, end, preset) => onDateChange(start, end, preset)}
      />
    </div>
  )
}
