import { useState, useRef } from 'react'
import { ChevronDown } from 'lucide-react'
import MetricDropdown from './MetricDropdown'

export default function MetricCard({ label, value, color, checked, disabled, onToggle, onMetricSelect, assignedMetrics }) {
  const [showTooltip, setShowTooltip] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const cardRef = useRef(null)

  return (
    <div
      ref={cardRef}
      className="relative flex flex-col bg-white rounded-xl border border-gray-200 flex-shrink-0 px-4 pt-3 pb-3"
      style={{ boxShadow: '0 1px 4px 0 rgba(0,0,0,0.06)' }}
    >
      {/* Checkbox + label + chevron row */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-1.5">

          {/* Checkbox wrapper — handles tooltip on disabled */}
          <div
            className="relative flex-shrink-0"
            onMouseEnter={() => disabled && setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <button
              onClick={disabled ? undefined : onToggle}
              className="w-4 h-4 rounded flex items-center justify-center border-2 transition-all duration-150 focus:outline-none"
              style={{
                backgroundColor: checked ? color : 'transparent',
                borderColor: checked ? (disabled ? '#a0aec0' : color) : '#d1d5db',
                opacity: disabled ? 0.45 : 1,
                cursor: disabled ? 'not-allowed' : 'pointer',
              }}
            >
              {checked && (
                <svg width="9" height="7" viewBox="0 0 10 8" fill="none">
                  <path
                    d="M1 4L3.5 6.5L9 1"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>

            {/* Disabled tooltip */}
            {showTooltip && (
              <div
                className="absolute z-50 px-2.5 py-1.5 rounded-lg text-white text-xs font-medium whitespace-nowrap pointer-events-none"
                style={{
                  backgroundColor: '#1f2937',
                  bottom: 'calc(100% + 6px)',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                }}
              >
                At least 1 metric must be selected
                <div
                  className="absolute"
                  style={{
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    borderWidth: '4px',
                    borderStyle: 'solid',
                    borderColor: '#1f2937 transparent transparent transparent',
                  }}
                />
              </div>
            )}
          </div>

          <span className="text-xs font-semibold leading-tight" style={{ color: '#374151' }}>
            {label}
          </span>
        </div>

        {/* Chevron — opens dropdown */}
        <button
          onClick={() => setDropdownOpen((v) => !v)}
          className="flex items-center justify-center focus:outline-none transition-transform duration-150"
          style={{
            color: dropdownOpen ? '#4B7BF5' : '#9ca3af',
            transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          <ChevronDown size={12} />
        </button>
      </div>

      {/* Value */}
      <div className="text-lg font-bold tracking-tight" style={{ color: '#111827' }}>
        {value}
      </div>

      {/* Dropdown */}
      {dropdownOpen && (
        <MetricDropdown
          anchorRef={cardRef}
          onClose={() => setDropdownOpen(false)}
          onSelect={(newLabel) => { onMetricSelect?.(newLabel); setDropdownOpen(false) }}
          assignedMetrics={assignedMetrics}
        />
      )}
    </div>
  )
}
