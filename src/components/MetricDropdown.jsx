import { useState, useEffect, useRef } from 'react'
import { Search, ChevronRight } from 'lucide-react'

// Sections with mock metrics. Only items with metricKey are selectable.
const SECTIONS = [
  {
    title: 'Insights',
    metrics: [
      { label: 'Mock Metric 1' },
      { label: 'Mock Metric 2' },
    ],
  },
  {
    title: 'Ad Performance',
    metrics: [
      { label: 'Mock Metric 1' },
      { label: 'Mock Metric 2' },
      { label: 'CPI', metricKey: 'CPI' },
    ],
  },
  {
    title: 'In-App Conversions',
    metrics: [
      { label: 'Mock Metric 1' },
      { label: 'Mock Metric 2' },
    ],
  },
  {
    title: 'Cohort Analysis',
    metrics: [
      { label: 'Mock Metric 1' },
      { label: 'Mock Metric 2' },
    ],
  },
  {
    title: 'Custom Columns',
    metrics: [
      { label: 'Mock Metric 1' },
      { label: 'Mock Metric 2' },
    ],
  },
]

function SelectableMetricItem({ item, isAssigned, onSelect }) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div
      className="relative flex items-center px-10 py-2 group"
      onMouseEnter={() => isAssigned && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={() => !isAssigned && onSelect(item.metricKey)}
      style={{ cursor: isAssigned ? 'not-allowed' : 'pointer' }}
    >
      <span
        className="text-sm font-medium transition-colors"
        style={{ color: isAssigned ? '#d1d5db' : '#111827' }}
      >
        {item.label}
      </span>

      {/* "Already selected" tooltip */}
      {showTooltip && (
        <div
          className="absolute z-[99999] px-2.5 py-1.5 rounded-lg text-white text-xs font-medium whitespace-nowrap pointer-events-none"
          style={{
            backgroundColor: '#1f2937',
            bottom: 'calc(100% + 6px)',
            left: '50%',
            transform: 'translateX(-50%)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          }}
        >
          This metric is already selected
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
  )
}

export default function MetricDropdown({ anchorRef, onClose, onSelect, assignedMetrics = new Set() }) {
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState({})
  const dropdownRef = useRef(null)
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 })

  useEffect(() => {
    if (!anchorRef?.current) return
    const rect = anchorRef.current.getBoundingClientRect()
    setPos({ top: rect.bottom + 6, left: rect.left, width: Math.max(rect.width, 240) })
  }, [anchorRef])

  useEffect(() => {
    function handleClick(e) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        anchorRef.current && !anchorRef.current.contains(e.target)
      ) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose, anchorRef])

  const query = search.toLowerCase()

  const filteredSections = SECTIONS
    .map((s) => ({
      ...s,
      metrics: s.metrics.filter((m) => m.label.toLowerCase().includes(query)),
      titleMatch: s.title.toLowerCase().includes(query),
    }))
    .filter((s) => s.titleMatch || s.metrics.length > 0)

  const isExpanded = (section) =>
    query ? section.metrics.length > 0 : !!expanded[section.title]

  return (
    <div
      ref={dropdownRef}
      className="fixed z-[9999] bg-white rounded-xl overflow-hidden"
      style={{
        top: pos.top,
        left: pos.left,
        width: pos.width,
        border: '1.5px solid #4B7BF5',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
      }}
    >
      {/* Search */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100">
        <Search size={14} style={{ color: '#9ca3af', flexShrink: 0 }} />
        <input
          autoFocus
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search"
          className="flex-1 text-sm outline-none bg-transparent placeholder-gray-400"
          style={{ color: '#374151' }}
        />
      </div>

      {/* Sections */}
      <div className="py-1 max-h-64 overflow-y-auto">
        {filteredSections.length === 0 ? (
          <div className="px-4 py-3 text-sm text-gray-400">No results</div>
        ) : (
          filteredSections.map((section) => {
            const open = isExpanded(section)
            return (
              <div key={section.title}>
                <button
                  onClick={() => setExpanded((p) => ({ ...p, [section.title]: !p[section.title] }))}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight
                    size={14}
                    className="transition-transform duration-150 flex-shrink-0"
                    style={{ color: '#6b7280', transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}
                  />
                  <span className="text-sm font-medium text-left" style={{ color: '#111827' }}>
                    {section.title}
                  </span>
                </button>

                {open && (
                  <div className="pb-1">
                    {section.metrics.map((item) =>
                      item.metricKey ? (
                        <SelectableMetricItem
                          key={item.label}
                          item={item}
                          isAssigned={assignedMetrics.has(item.metricKey)}
                          onSelect={onSelect}
                        />
                      ) : (
                        <div
                          key={item.label}
                          className="flex items-center px-10 py-2"
                          style={{ cursor: 'default' }}
                        >
                          <span className="text-sm" style={{ color: '#6b7280' }}>
                            {item.label}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
