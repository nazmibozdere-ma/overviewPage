import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { fmtDate } from './DateRangePicker'

function getPreviousPeriod(start, end) {
  const durMs = end.getTime() - start.getTime()
  const prevEnd = new Date(start.getTime() - 86400000)
  const prevStart = new Date(prevEnd.getTime() - durMs)
  return { prevStart, prevEnd }
}

export default function OverviewMetricCard({ label, data, format, dateRange, isEmpty, emptyPrompt }) {
  const [tooltipVisible, setTooltipVisible] = useState(false)

  const { cur, prev } = data || { cur: 0, prev: 0 }
  const delta = ((cur - prev) / prev) * 100
  const isPositive = delta >= 0
  const absDelta = Math.abs(delta).toFixed(1)

  const { prevStart, prevEnd } = getPreviousPeriod(dateRange.start, dateRange.end)

  return (
    <div
      className="relative flex flex-col bg-white rounded-xl border border-gray-200 px-4 pt-3 pb-3 flex-shrink-0"
      style={{ boxShadow: '0 1px 4px 0 rgba(0,0,0,0.06)', minWidth: 0 }}
    >
      {/* Label row */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-semibold truncate" style={{ color: '#374151' }}>
          {label}
        </span>

        {/* Delta badge — hidden when empty */}
        {!isEmpty && (
          <div
            className="relative flex-shrink-0"
            onMouseEnter={() => setTooltipVisible(true)}
            onMouseLeave={() => setTooltipVisible(false)}
          >
            <div
              className="flex items-center px-1 py-0.5 rounded-full text-[10px] font-semibold cursor-default select-none"
              style={{
                backgroundColor: isPositive ? '#dcfce7' : '#fee2e2',
                color: isPositive ? '#15803d' : '#dc2626',
              }}
            >
              {isPositive ? '+' : '-'}{absDelta}%
            </div>

            {/* Tooltip */}
            {tooltipVisible && (
              <div
                className="absolute z-50 rounded-xl text-xs pointer-events-none"
                style={{
                  backgroundColor: '#1f2937',
                  color: '#f9fafb',
                  padding: '10px 12px',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  minWidth: 200,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                }}
              >
                <div
                  className="absolute"
                  style={{
                    bottom: '100%', right: 12,
                    borderWidth: 5, borderStyle: 'solid',
                    borderColor: 'transparent transparent #1f2937 transparent',
                  }}
                />
                <div className="mb-2">
                  <div className="font-semibold text-white text-sm">{format(cur)}</div>
                  <div style={{ color: '#9ca3af' }}>{fmtDate(dateRange.start)} – {fmtDate(dateRange.end)}</div>
                </div>
                <div className="mb-2" style={{ borderTop: '1px solid #374151' }} />
                <div>
                  <div style={{ color: '#9ca3af', marginBottom: 2 }}>vs Previous Period</div>
                  <div className="font-semibold text-white text-sm">{format(prev)}</div>
                  <div style={{ color: '#9ca3af' }}>{fmtDate(prevStart)} – {fmtDate(prevEnd)}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Value or empty CTA */}
      {isEmpty ? (
        <button
          className="flex items-start gap-1 text-xs font-medium mt-1 text-left"
          style={{ color: '#4B7BF5', lineHeight: 1.45 }}
        >
          <span>{emptyPrompt || 'Integrate your MMP'}</span>
          <ArrowRight size={11} style={{ flexShrink: 0, marginTop: 1 }} />
        </button>
      ) : (
        <div className="text-lg font-bold tracking-tight" style={{ color: '#111827' }}>
          {format(cur)}
        </div>
      )}
    </div>
  )
}
