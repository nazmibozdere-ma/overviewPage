import { useState } from 'react'
import {
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  ArrowUpRight, ArrowDownLeft, Info,
} from 'lucide-react'

const PAGE_SIZE = 5


// ── Mock keyword data ─────────────────────────────────────────────────────────
// Fields: keyword, spend, spendChange (WoW %), sov, sovDelta (pp),
//         cpi, cr (%), ttr (%), installTrend ('up'|'flat'|'down')
//
// Badge rules (evaluated in priority order):
//   competition → sovDelta ≤ -3 AND spendChange ≥ -5
//   scale       → cpi < 0.85 * avgCpi AND cr > 6 AND installTrend ∈ {up, flat}
//   warning     → cpi > 1.2 * avgCpi OR (ttr > 9 AND cr < 4)

const KEYWORD_DATA = {
  'Square Point of Sale (POS)': {
    scale: [
      { keyword: 'free pos system',      spend: 620, spendChange:  8.2, sov: 38.4, sovDelta:  1.2, cpi: 2.10, cr: 8.4, ttr: 4.2, installTrend: 'up',   installChange: +12.4 },
      { keyword: 'small business app',   spend: 540, spendChange:  6.5, sov: 34.1, sovDelta:  2.1, cpi: 2.45, cr: 7.8, ttr: 5.1, installTrend: 'up',   installChange:  +9.8 },
      { keyword: 'cashier app',          spend: 480, spendChange:  4.1, sov: 29.8, sovDelta:  0.8, cpi: 2.68, cr: 7.2, ttr: 4.8, installTrend: 'flat', installChange:  +3.2 },
      { keyword: 'restaurant pos',       spend: 410, spendChange:  9.3, sov: 26.2, sovDelta:  3.4, cpi: 2.31, cr: 8.9, ttr: 3.9, installTrend: 'up',   installChange: +15.1 },
      { keyword: 'retail software',      spend: 350, spendChange:  3.8, sov: 22.9, sovDelta:  1.5, cpi: 2.55, cr: 6.7, ttr: 5.3, installTrend: 'flat', installChange:  +2.8 },
      { keyword: 'inventory management', spend: 310, spendChange:  5.2, sov: 19.4, sovDelta:  0.4, cpi: 2.42, cr: 7.1, ttr: 4.6, installTrend: 'up',   installChange:  +7.6 },
      { keyword: 'receipt printer app',  spend: 270, spendChange:  2.9, sov: 16.8, sovDelta:  1.1, cpi: 2.61, cr: 6.3, ttr: 4.0, installTrend: 'flat', installChange:  +1.4 },
      { keyword: 'business management',  spend: 240, spendChange:  7.1, sov: 14.3, sovDelta:  2.8, cpi: 2.38, cr: 7.5, ttr: 5.8, installTrend: 'up',   installChange: +11.3 },
      { keyword: 'payment terminal',     spend: 200, spendChange:  3.4, sov: 12.1, sovDelta:  0.6, cpi: 2.48, cr: 6.8, ttr: 4.4, installTrend: 'flat', installChange:  +2.1 },
      { keyword: 'store checkout',       spend: 170, spendChange:  5.9, sov: 10.7, sovDelta:  1.9, cpi: 2.65, cr: 6.5, ttr: 3.7, installTrend: 'up',   installChange:  +8.9 },
    ],
    competition: [
      { keyword: 'square payment',       spend: 820, spendChange:  2.1, sov: 42.1, sovDelta: -4.2, cpt: 1.24, cptChange: +3.2, cpi: 3.18, cr: 5.8, ttr: 6.2, installTrend: 'flat' },
      { keyword: 'pos system',           spend: 680, spendChange: -1.2, sov: 38.7, sovDelta: -3.8, cpt: 0.98, cptChange: -1.4, cpi: 3.25, cr: 5.2, ttr: 5.9, installTrend: 'flat' },
      { keyword: 'payment processing',   spend: 540, spendChange:  5.0, sov: 31.4, sovDelta: -5.1, cpt: 1.52, cptChange: +8.1, cpi: 3.31, cr: 4.8, ttr: 6.8, installTrend: 'down' },
      { keyword: 'credit card reader',   spend: 460, spendChange: -3.0, sov: 28.9, sovDelta: -3.4, cpt: 0.87, cptChange: -2.8, cpi: 3.42, cr: 5.5, ttr: 5.4, installTrend: 'flat' },
      { keyword: 'business payment',     spend: 380, spendChange:  1.0, sov: 25.3, sovDelta: -4.7, cpt: 1.18, cptChange: +4.6, cpi: 3.28, cr: 4.9, ttr: 7.1, installTrend: 'down' },
      { keyword: 'retail pos',           spend: 320, spendChange: -2.0, sov: 22.1, sovDelta: -3.2, cpt: 0.76, cptChange: -1.9, cpi: 3.35, cr: 5.1, ttr: 5.8, installTrend: 'flat' },
      { keyword: 'card payment app',     spend: 280, spendChange:  3.0, sov: 19.8, sovDelta: -4.5, cpt: 1.31, cptChange: +5.3, cpi: 3.20, cr: 5.6, ttr: 6.4, installTrend: 'flat' },
      { keyword: 'mobile payment',       spend: 240, spendChange: -4.0, sov: 17.4, sovDelta: -3.9, cpt: 1.45, cptChange: -3.7, cpi: 3.48, cr: 4.7, ttr: 7.3, installTrend: 'down' },
      { keyword: 'tap to pay',           spend: 210, spendChange:  0.0, sov: 15.2, sovDelta: -3.1, cpt: 0.92, cptChange: +1.2, cpi: 3.22, cr: 5.3, ttr: 6.1, installTrend: 'flat' },
      { keyword: 'invoice payment',      spend: 180, spendChange: -1.0, sov: 13.7, sovDelta: -4.3, cpt: 1.08, cptChange: -0.8, cpi: 3.38, cr: 4.6, ttr: 6.9, installTrend: 'down' },
    ],
    warning: [
      { keyword: 'online payment',       spend: 590, spendChange:  1.2, installs:  42, installChange: -19.2, sov: 28.4, sovDelta: -1.8, cpi: 4.20, cr: 5.1, ttr: 5.2 },
      { keyword: 'merchant account',     spend: 510, spendChange: -0.8, installs:  38, installChange: -17.4, sov: 24.1, sovDelta: -2.1, cpi: 3.95, cr: 4.8, ttr: 4.9 },
      { keyword: 'payment gateway',      spend: 440, spendChange:  2.1, installs:  31, installChange: -18.4, sov: 21.3, sovDelta: -1.4, cpi: 4.51, cr: 3.8, ttr: 6.1 },
      { keyword: 'e-commerce payment',   spend: 380, spendChange:  0.5, installs:  27, installChange: -20.6, sov: 18.9, sovDelta: -2.8, cpi: 4.88, cr: 3.2, ttr: 7.3 },
      { keyword: 'payment solution',     spend: 330, spendChange: -1.5, installs:  29, installChange:   0.0, sov: 16.4, sovDelta: -0.9, cpi: 4.15, cr: 4.1, ttr: 8.4 },
      { keyword: 'virtual terminal',     spend: 290, spendChange:  0.8, installs:  22, installChange: -26.7, sov: 13.8, sovDelta: -1.2, cpi: 5.20, cr: 2.8, ttr: 9.1 },
      { keyword: 'swipe payment',        spend: 250, spendChange: -2.1, installs:  24, installChange:  +4.3, sov: 11.9, sovDelta: -0.5, cpi: 3.92, cr: 4.6, ttr: 5.8 },
      { keyword: 'contactless payment',  spend: 220, spendChange:  1.4, installs:  19, installChange: -26.9, sov: 10.2, sovDelta: -1.7, cpi: 2.90, cr: 3.5, ttr: 9.8 },
      { keyword: 'credit processing',    spend: 190, spendChange: -0.3, installs:  17, installChange: -22.7, sov:  8.7, sovDelta: -1.8, cpi: 4.62, cr: 3.9, ttr: 7.2 },
      { keyword: 'business card reader', spend: 160, spendChange:  0.9, installs:  20, installChange:  +5.3, sov:  7.4, sovDelta: -2.1, cpi: 4.35, cr: 4.2, ttr: 8.9 },
    ],
  },
  'Cash App': {
    scale: [
      { keyword: 'free money app',        spend: 980, spendChange:  7.4, sov: 44.1, sovDelta:  2.8, cpi: 3.21, cr: 7.8, ttr: 4.8, installTrend: 'up',   installChange: +13.7 },
      { keyword: 'cash advance app',      spend: 820, spendChange:  5.9, sov: 38.7, sovDelta:  1.9, cpi: 3.54, cr: 8.2, ttr: 5.2, installTrend: 'up',   installChange: +10.2 },
      { keyword: 'debit card app',        spend: 710, spendChange:  4.3, sov: 33.2, sovDelta:  0.7, cpi: 3.68, cr: 7.4, ttr: 4.5, installTrend: 'flat', installChange:  +4.1 },
      { keyword: 'paycheck deposit app',  spend: 620, spendChange:  8.1, sov: 28.9, sovDelta:  3.2, cpi: 3.42, cr: 8.6, ttr: 3.9, installTrend: 'up',   installChange: +16.8 },
      { keyword: 'direct deposit app',    spend: 540, spendChange:  6.2, sov: 24.3, sovDelta:  2.4, cpi: 3.58, cr: 7.1, ttr: 5.6, installTrend: 'up',   installChange:  +9.4 },
      { keyword: 'savings account app',   spend: 460, spendChange:  3.8, sov: 20.6, sovDelta:  1.2, cpi: 3.75, cr: 6.8, ttr: 4.9, installTrend: 'flat', installChange:  +3.6 },
      { keyword: 'no fee banking app',    spend: 390, spendChange:  5.5, sov: 17.2, sovDelta:  0.9, cpi: 3.61, cr: 7.3, ttr: 4.2, installTrend: 'up',   installChange:  +8.7 },
      { keyword: 'cashback rewards app',  spend: 330, spendChange:  4.1, sov: 14.8, sovDelta:  2.1, cpi: 3.48, cr: 6.9, ttr: 5.1, installTrend: 'flat', installChange:  +2.9 },
      { keyword: 'spending tracker',      spend: 280, spendChange:  6.8, sov: 12.4, sovDelta:  1.8, cpi: 3.72, cr: 6.5, ttr: 4.6, installTrend: 'up',   installChange: +11.5 },
      { keyword: 'budget app',            spend: 240, spendChange:  3.2, sov: 10.1, sovDelta:  0.5, cpi: 3.65, cr: 6.8, ttr: 3.8, installTrend: 'flat', installChange:  +1.8 },
    ],
    competition: [
      { keyword: 'send money app',        spend: 1240, spendChange:  1.8, sov: 48.2, sovDelta: -5.1, cpt: 1.68, cptChange: +4.8, cpi: 4.42, cr: 6.2, ttr: 5.8, installTrend: 'flat' },
      { keyword: 'money transfer',        spend:  980, spendChange: -2.4, sov: 41.7, sovDelta: -4.3, cpt: 1.42, cptChange: -2.1, cpi: 4.58, cr: 5.8, ttr: 6.2, installTrend: 'flat' },
      { keyword: 'cash transfer app',     spend:  820, spendChange:  4.2, sov: 36.4, sovDelta: -3.8, cpt: 1.89, cptChange: +7.3, cpi: 4.65, cr: 5.4, ttr: 6.9, installTrend: 'down' },
      { keyword: 'peer payment',          spend:  690, spendChange: -0.8, sov: 31.2, sovDelta: -4.6, cpt: 1.35, cptChange: -1.6, cpi: 4.51, cr: 5.9, ttr: 5.4, installTrend: 'flat' },
      { keyword: 'instant transfer',      spend:  570, spendChange:  2.5, sov: 26.8, sovDelta: -3.2, cpt: 1.74, cptChange: +5.9, cpi: 4.48, cr: 6.0, ttr: 7.1, installTrend: 'down' },
      { keyword: 'bank transfer app',     spend:  480, spendChange: -3.1, sov: 22.4, sovDelta: -4.1, cpt: 1.51, cptChange: -3.2, cpi: 4.62, cr: 5.5, ttr: 6.4, installTrend: 'flat' },
      { keyword: 'mobile wallet app',     spend:  410, spendChange:  0.5, sov: 18.9, sovDelta: -3.7, cpt: 1.62, cptChange: +6.4, cpi: 4.55, cr: 5.3, ttr: 7.8, installTrend: 'down' },
      { keyword: 'venmo alternative',     spend:  350, spendChange: -4.2, sov: 15.6, sovDelta: -5.4, cpt: 1.48, cptChange: -2.8, cpi: 4.72, cr: 5.1, ttr: 6.1, installTrend: 'flat' },
      { keyword: 'zelle competitor',      spend:  290, spendChange:  1.2, sov: 13.2, sovDelta: -3.4, cpt: 1.38, cptChange: +2.1, cpi: 4.45, cr: 5.7, ttr: 5.9, installTrend: 'flat' },
      { keyword: 'p2p payments',          spend:  240, spendChange: -1.8, sov: 10.8, sovDelta: -3.9, cpt: 1.71, cptChange: -4.5, cpi: 4.68, cr: 5.2, ttr: 6.8, installTrend: 'down' },
    ],
    warning: [
      { keyword: 'crypto wallet app',     spend: 890, spendChange: -1.2, installs:  58, installChange: -19.4, sov: 38.4, sovDelta: -2.1, cpi: 5.82, cr: 4.8, ttr: 5.9 },
      { keyword: 'bitcoin purchase app',  spend: 740, spendChange:  0.4, installs:  48, installChange: -17.2, sov: 32.1, sovDelta: -1.8, cpi: 6.14, cr: 3.9, ttr: 6.8 },
      { keyword: 'stock trading app',     spend: 620, spendChange: -2.1, installs:  41, installChange: -18.0, sov: 27.8, sovDelta: -2.4, cpi: 5.48, cr: 4.2, ttr: 7.4 },
      { keyword: 'investment app',        spend: 540, spendChange:  1.8, installs:  36, installChange: -18.2, sov: 23.4, sovDelta: -1.3, cpi: 5.91, cr: 3.6, ttr: 9.2 },
      { keyword: 'loan app instant',      spend: 460, spendChange: -0.5, installs:  29, installChange: -19.4, sov: 19.8, sovDelta: -2.7, cpi: 6.28, cr: 2.9, ttr: 8.8 },
      { keyword: 'payday loan app',       spend: 390, spendChange:  0.9, installs:  32, installChange:  +3.2, sov: 16.4, sovDelta: -1.4, cpi: 5.65, cr: 3.4, ttr: 9.6 },
      { keyword: 'money lending app',     spend: 330, spendChange: -1.9, installs:  27, installChange:  +3.8, sov: 13.7, sovDelta: -0.8, cpi: 5.42, cr: 4.1, ttr: 7.9 },
      { keyword: 'credit score app',      spend: 280, spendChange:  2.1, installs:  22, installChange: -21.4, sov: 11.2, sovDelta: -1.6, cpi: 5.78, cr: 3.8, ttr: 8.4 },
      { keyword: 'financial planning',    spend: 240, spendChange: -0.8, installs:  24, installChange:  +4.3, sov:  9.4, sovDelta: -2.2, cpi: 5.34, cr: 4.4, ttr: 9.1 },
      { keyword: 'wealth management',     spend: 200, spendChange:  1.4, installs:  18, installChange: -25.0, sov:  7.8, sovDelta: -1.9, cpi: 6.02, cr: 3.5, ttr: 10.2 },
    ],
  },
}

// ── Cell renderers ────────────────────────────────────────────────────────────

function ChangeBadge({ value, suffix = '%' }) {
  const isPos = value >= 0
  return (
    <span
      className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded-full text-[10px] font-semibold"
      style={{
        backgroundColor: isPos ? '#dcfce7' : '#fee2e2',
        color:           isPos ? '#166534' : '#991b1b',
      }}
    >
      {isPos
        ? <ArrowUpRight  size={9} style={{ flexShrink: 0 }} />
        : <ArrowDownLeft size={9} style={{ flexShrink: 0 }} />
      }
      {Math.abs(value).toFixed(1)}{suffix}
    </span>
  )
}


function CptCell({ cpt, cptChange }) {
  return (
    <div className="flex flex-col items-end gap-0.5">
      <span className="text-xs font-medium" style={{ color: '#111827' }}>${cpt.toFixed(2)}</span>
      <ChangeBadge value={cptChange} />
    </div>
  )
}

function SovCell({ sov, delta }) {
  return (
    <div className="flex flex-col items-end gap-0.5">
      <span className="text-xs font-medium" style={{ color: '#111827' }}>{sov.toFixed(1)}%</span>
      <ChangeBadge value={delta} suffix="pp" />
    </div>
  )
}

// ── Info tooltip ─────────────────────────────────────────────────────────────
function InfoTooltip({ text }) {
  const [visible, setVisible] = useState(false)
  return (
    <div
      className="relative"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      style={{ display: 'inline-flex' }}
    >
      <Info size={14} style={{ color: '#9ca3af', cursor: 'default' }} />
      {visible && (
        <div
          className="absolute z-50 rounded-xl text-xs pointer-events-none"
          style={{
            backgroundColor: '#1f2937',
            color: '#f9fafb',
            padding: '8px 12px',
            top: 'calc(100% + 6px)',
            left: 0,
            minWidth: 220,
            maxWidth: 280,
            lineHeight: 1.5,
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
          }}
        >
          {/* Arrow */}
          <div
            className="absolute"
            style={{
              bottom: '100%',
              left: 10,
              borderWidth: 5,
              borderStyle: 'solid',
              borderColor: 'transparent transparent #1f2937 transparent',
            }}
          />
          {text}
        </div>
      )}
    </div>
  )
}

// ── Shared card shell ─────────────────────────────────────────────────────────

function KeywordCard({ title, badge, description, keywords, extraColumns, renderSpend, spendLabel = 'Spend' }) {
  const [page, setPage]       = useState(0)
  const [sortDir, setSortDir] = useState('desc')

  const sorted   = [...keywords].sort((a, b) =>
    sortDir === 'desc' ? b.spend - a.spend : a.spend - b.spend
  )
  const pageData   = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)

  const toggleSort = () => {
    setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))
    setPage(0)
  }

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col"
      style={{ boxShadow: '0 1px 4px 0 rgba(0,0,0,0.06)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        {/* Info icon with tooltip */}
        {description && (
          <div className="relative flex-shrink-0" style={{ lineHeight: 0 }}>
            <InfoTooltip text={description} />
          </div>
        )}
        <span className="text-sm font-semibold" style={{ color: '#111827' }}>{title}</span>
      </div>

      {/* Table header */}
      <div
        className="flex items-center gap-2 pb-1.5"
        style={{ borderBottom: '1px solid #f3f4f6' }}
      >
        <div className="flex-1 text-xs font-medium" style={{ color: '#6b7280' }}>Keyword</div>

        <button
          onClick={toggleSort}
          className="flex items-center justify-end gap-0.5 text-xs font-medium hover:text-gray-900 transition-colors select-none"
          style={{ color: '#6b7280', width: 68 }}
        >
          {spendLabel}
          {sortDir === 'desc'
            ? <ChevronDown size={10} style={{ flexShrink: 0 }} />
            : <ChevronUp   size={10} style={{ flexShrink: 0 }} />
          }
        </button>

        {extraColumns.map((col) => (
          <div
            key={col.key}
            className="text-xs font-medium text-right"
            style={{ color: '#6b7280', width: col.width }}
          >
            {col.label}
          </div>
        ))}
      </div>

      {/* Rows */}
      <div className="flex-1 mt-1">
        {pageData.map((kw, i) => (
          <div
            key={kw.keyword}
            className="flex items-center gap-2 py-2"
            style={{ borderBottom: '1px solid #f9fafb' }}
          >
            {/* Keyword */}
            <div className="flex-1 min-w-0">
              <span className="text-xs truncate" style={{ color: '#111827' }}>
                {kw.keyword}
              </span>
            </div>

            {/* Spend */}
            <div style={{ width: 68 }}>
              {renderSpend
                ? renderSpend(kw)
                : <div className="text-xs font-medium text-right" style={{ color: '#111827' }}>${kw.spend.toLocaleString()}</div>
              }
            </div>

            {/* Extra columns */}
            {extraColumns.map((col) => (
              <div key={col.key} style={{ width: col.width }}>
                {col.render(kw)}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div
        className="flex items-center justify-between pt-2 mt-1"
        style={{ borderTop: '1px solid #f3f4f6' }}
      >
        <span className="text-xs" style={{ color: '#9ca3af' }}>
          {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, sorted.length)} of {sorted.length}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 0}
            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors disabled:opacity-30"
            style={{ color: '#374151' }}
          >
            <ChevronLeft size={12} />
          </button>
          <span className="text-xs" style={{ color: '#374151', minWidth: 28, textAlign: 'center' }}>
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page === totalPages - 1}
            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors disabled:opacity-30"
            style={{ color: '#374151' }}
          >
            <ChevronRight size={12} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Column definitions ────────────────────────────────────────────────────────

// Scale: CPI < 0.85×avg  AND  CR > 6%  AND  trend flat/rising
const SCALE_COLUMNS = [
  {
    key:   'cpi',
    label: 'CPI',
    width: 50,
    render: (kw) => (
      <div className="text-xs font-medium text-right" style={{ color: '#111827' }}>
        ${kw.cpi.toFixed(2)}
      </div>
    ),
  },
  {
    key:   'cr',
    label: 'CR',
    width: 44,
    render: (kw) => (
      <div className="text-xs font-medium text-right" style={{ color: '#111827' }}>
        {kw.cr.toFixed(1)}%
      </div>
    ),
  },
  {
    key:   'installTrend',
    label: 'Installs',
    width: 68,
    render: (kw) => (
      <div className="flex justify-end">
        <ChangeBadge value={kw.installChange} />
      </div>
    ),
  },
]

// Competition: SOV drop ≥3pp  AND  spend WoW ≥ −5%
const COMPETITION_COLUMNS = [
  {
    key:   'cpt',
    label: 'CPT',
    width: 66,
    render: (kw) => <CptCell cpt={kw.cpt} cptChange={kw.cptChange} />,
  },
  {
    key:   'sov',
    label: 'SOV',
    width: 72,
    render: (kw) => <SovCell sov={kw.sov} delta={kw.sovDelta} />,
  },
]

function CompetitionSpendCell({ spend, spendChange }) {
  return (
    <div className="flex flex-col items-end gap-0.5">
      <span className="text-xs font-medium" style={{ color: '#111827' }}>${spend.toLocaleString()}</span>
      <ChangeBadge value={spendChange} />
    </div>
  )
}

// Warning: CPI > 1.2×avg  OR  (TTR > 9%  AND  CR < 4%)
const WARNING_COLUMNS = [
  {
    key:   'installs',
    label: 'Installs',
    width: 72,
    render: (kw) => (
      <div className="flex flex-col items-end gap-0.5">
        <span className="text-xs font-medium" style={{ color: '#111827' }}>{kw.installs.toLocaleString()}</span>
        <ChangeBadge value={kw.installChange} />
      </div>
    ),
  },
]

// ── Section — renders 3 sibling grid items to slot into the parent grid ───────

export default function TopKeywordReport({ app }) {
  const data = KEYWORD_DATA[app] || KEYWORD_DATA['Square Point of Sale (POS)']

  return (
    <>
      <KeywordCard
        title="Scale Opportunity"
        badge={{ bg: '#dcfce7', color: '#15803d', label: 'Scale' }}
        description="Keywords with CPI below and CR above their campaign average."
        keywords={data.scale}
        extraColumns={SCALE_COLUMNS}
      />
      <KeywordCard
        title="Increased Competition"
        badge={{ bg: '#fff7ed', color: '#c2410c', label: 'Competition' }}
        description="Keywords where SOV decreased while CPT increased compared to the previous period."
        keywords={data.competition}
        extraColumns={COMPETITION_COLUMNS}
        spendLabel="Spend"
        renderSpend={(kw) => <CompetitionSpendCell spend={kw.spend} spendChange={kw.spendChange} />}
      />
      <KeywordCard
        title="Warning Signals"
        badge={{ bg: '#fee2e2', color: '#dc2626', label: 'Watch' }}
        description="Keywords where installs are trending down while spend remained flat or increased."
        keywords={data.warning}
        extraColumns={WARNING_COLUMNS}
        spendLabel="Spend"
        renderSpend={(kw) => <CompetitionSpendCell spend={kw.spend} spendChange={kw.spendChange} />}
      />
    </>
  )
}
