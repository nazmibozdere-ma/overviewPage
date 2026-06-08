import { useState } from 'react'
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownLeft, ChevronsUpDown } from 'lucide-react'

const PAGE_SIZE = 5

// Top 10 keywords by spend, with all required fields
const TOP_SPENDER_DATA = {
  'Square Point of Sale (POS)': [
    { keyword: 'square payment',       spend: 820, installs: 258, cpt: 1.24, cptChange:  +3.2 },
    { keyword: 'pos system',           spend: 680, installs: 209, cpt: 0.98, cptChange:  -1.4 },
    { keyword: 'free pos system',      spend: 620, installs: 295, cpt: 1.10, cptChange:  +5.1 },
    { keyword: 'online payment',       spend: 590, installs:  42, cpt: 1.38, cptChange:  +8.7 },
    { keyword: 'payment processing',   spend: 540, installs: 163, cpt: 1.52, cptChange:  +8.1 },
    { keyword: 'small business app',   spend: 540, installs: 220, cpt: 1.05, cptChange:  +2.4 },
    { keyword: 'merchant account',     spend: 510, installs:  38, cpt: 1.41, cptChange:  +6.3 },
    { keyword: 'cashier app',          spend: 480, installs: 179, cpt: 0.92, cptChange:  -0.8 },
    { keyword: 'credit card reader',   spend: 460, installs: 134, cpt: 0.87, cptChange:  -2.8 },
    { keyword: 'payment gateway',      spend: 440, installs:  31, cpt: 1.58, cptChange:  +9.4 },
  ],
  'Cash App': [
    { keyword: 'send money app',       spend: 1240, installs: 280, cpt: 1.68, cptChange:  +4.8 },
    { keyword: 'money transfer',       spend:  980, installs: 214, cpt: 1.42, cptChange:  -2.1 },
    { keyword: 'free money app',       spend:  980, installs: 305, cpt: 1.31, cptChange:  +3.9 },
    { keyword: 'crypto wallet app',    spend:  890, installs:  58, cpt: 1.72, cptChange: +11.2 },
    { keyword: 'cash transfer app',    spend:  820, installs: 176, cpt: 1.89, cptChange:  +7.3 },
    { keyword: 'cash advance app',     spend:  820, installs: 232, cpt: 1.44, cptChange:  +2.6 },
    { keyword: 'bitcoin purchase app', spend:  740, installs:  48, cpt: 1.95, cptChange: +13.4 },
    { keyword: 'peer payment',         spend:  690, installs: 152, cpt: 1.35, cptChange:  -1.6 },
    { keyword: 'debit card app',       spend:  710, installs: 193, cpt: 1.22, cptChange:  -0.5 },
    { keyword: 'stock trading app',    spend:  620, installs:  41, cpt: 1.61, cptChange:  +9.8 },
  ],
}

function ChangeBadge({ value }) {
  const isPos = value >= 0
  return (
    <span
      className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded-full text-[10px] font-semibold"
      style={{
        backgroundColor: isPos ? '#fee2e2' : '#dcfce7',
        color:           isPos ? '#991b1b' : '#166534',
      }}
    >
      {isPos
        ? <ArrowUpRight  size={9} style={{ flexShrink: 0 }} />
        : <ArrowDownLeft size={9} style={{ flexShrink: 0 }} />
      }
      {Math.abs(value).toFixed(1)}%
    </span>
  )
}

const COLUMNS = [
  { key: 'keyword',   compare: (a, b, dir) => dir === 'asc' ? a.keyword.localeCompare(b.keyword)  : b.keyword.localeCompare(a.keyword) },
  { key: 'spend',     compare: (a, b, dir) => dir === 'asc' ? a.spend    - b.spend    : b.spend    - a.spend },
  { key: 'installs',  compare: (a, b, dir) => dir === 'asc' ? a.installs - b.installs : b.installs - a.installs },
  { key: 'cpt',       compare: (a, b, dir) => dir === 'asc' ? a.cpt      - b.cpt      : b.cpt      - a.cpt },
]

export default function TopSpenderTable({ app }) {
  const [page, setPage]         = useState(0)
  const [sortKey, setSortKey]   = useState('spend')
  const [sortDir, setSortDir]   = useState('desc')

  const handleSort = (key) => {
    if (key === sortKey) {
      setSortDir((d) => d === 'desc' ? 'asc' : 'desc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
    setPage(0)
  }

  const col        = COLUMNS.find((c) => c.key === sortKey)
  const raw        = TOP_SPENDER_DATA[app] || TOP_SPENDER_DATA['Square Point of Sale (POS)']
  const sorted     = [...raw].sort((a, b) => col.compare(a, b, sortDir))
  const pageData   = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)

  function SortIcon({ colKey }) {
    if (sortKey !== colKey) return <ChevronsUpDown size={10} style={{ flexShrink: 0, opacity: 0.4 }} />
    return sortDir === 'desc'
      ? <ChevronDown size={10} style={{ flexShrink: 0 }} />
      : <ChevronUp   size={10} style={{ flexShrink: 0 }} />
  }

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col"
      style={{ boxShadow: '0 1px 4px 0 rgba(0,0,0,0.06)' }}
    >
      <h3 className="text-sm font-semibold mb-3" style={{ color: '#111827' }}>
        Top Spender Keywords
      </h3>

      {/* Table header */}
      <div className="flex items-center gap-2 pb-1.5" style={{ borderBottom: '1px solid #f3f4f6' }}>
        <button
          onClick={() => handleSort('keyword')}
          className="flex-1 flex items-center gap-0.5 text-xs font-medium hover:text-gray-900 transition-colors select-none"
          style={{ color: '#6b7280' }}
        >
          Keyword
          <SortIcon colKey="keyword" />
        </button>
        <button
          onClick={() => handleSort('spend')}
          className="flex items-center justify-end gap-0.5 text-xs font-medium hover:text-gray-900 transition-colors select-none"
          style={{ color: '#6b7280', width: 62 }}
        >
          Spend
          <SortIcon colKey="spend" />
        </button>
        <button
          onClick={() => handleSort('installs')}
          className="flex items-center justify-end gap-0.5 text-xs font-medium hover:text-gray-900 transition-colors select-none"
          style={{ color: '#6b7280', width: 52 }}
        >
          Install
          <SortIcon colKey="installs" />
        </button>
        <button
          onClick={() => handleSort('cpt')}
          className="flex items-center justify-end gap-0.5 text-xs font-medium hover:text-gray-900 transition-colors select-none"
          style={{ color: '#6b7280', width: 72 }}
        >
          CPT
          <SortIcon colKey="cpt" />
        </button>
      </div>

      {/* Rows */}
      <div className="flex-1 mt-1">
        {pageData.map((kw) => (
          <div
            key={kw.keyword}
            className="flex items-center gap-2 py-2"
            style={{ borderBottom: '1px solid #f9fafb' }}
          >
            <div className="flex-1 min-w-0">
              <span className="text-xs truncate block" style={{ color: '#111827' }}>{kw.keyword}</span>
            </div>
            <div className="text-xs font-medium text-right" style={{ color: '#111827', width: 62 }}>
              ${kw.spend.toLocaleString()}
            </div>
            <div className="text-xs font-medium text-right" style={{ color: '#111827', width: 52 }}>
              {kw.installs.toLocaleString()}
            </div>
            <div className="flex flex-col items-end gap-0.5" style={{ width: 72 }}>
              <span className="text-xs font-medium" style={{ color: '#111827' }}>${kw.cpt.toFixed(2)}</span>
              <ChangeBadge value={kw.cptChange} />
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-2 mt-1" style={{ borderTop: '1px solid #f3f4f6' }}>
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
