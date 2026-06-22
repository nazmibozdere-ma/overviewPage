import { useState } from 'react'
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownLeft, ArrowRight, ChevronsUpDown } from 'lucide-react'

const PAGE_SIZE = 5

const TOP_SPENDER_DATA = {
  'Square Point of Sale (POS)': [
    { keyword: 'square payment',       spend: 820, impressions: 13200, taps: 4820, installs: 258, ttr: 6.2, cpt: 1.24, cptChange:  +3.2 },
    { keyword: 'pos system',           spend: 680, impressions: 10800, taps: 3910, installs: 209, ttr: 5.8, cpt: 0.98, cptChange:  -1.4 },
    { keyword: 'free pos system',      spend: 620, impressions:  9600, taps: 4240, installs: 295, ttr: 7.1, cpt: 1.10, cptChange:  +5.1 },
    { keyword: 'online payment',       spend: 590, impressions:  7200, taps: 2180, installs:  42, ttr: 4.9, cpt: 1.38, cptChange:  +8.7 },
    { keyword: 'payment processing',   spend: 540, impressions:  8400, taps: 3360, installs: 163, ttr: 5.4, cpt: 1.52, cptChange:  +8.1 },
    { keyword: 'small business app',   spend: 540, impressions:  9100, taps: 3780, installs: 220, ttr: 6.8, cpt: 1.05, cptChange:  +2.4 },
    { keyword: 'merchant account',     spend: 510, impressions:  6200, taps: 1940, installs:  38, ttr: 4.2, cpt: 1.41, cptChange:  +6.3 },
    { keyword: 'cashier app',          spend: 480, impressions:  7400, taps: 2960, installs: 179, ttr: 6.5, cpt: 0.92, cptChange:  -0.8 },
    { keyword: 'credit card reader',   spend: 460, impressions:  6800, taps: 2540, installs: 134, ttr: 5.1, cpt: 0.87, cptChange:  -2.8 },
    { keyword: 'payment gateway',      spend: 440, impressions:  5800, taps: 1720, installs:  31, ttr: 4.6, cpt: 1.58, cptChange:  +9.4 },
  ],
  'Cash App': [
    { keyword: 'send money app',       spend: 1240, impressions: 19800, taps: 6820, installs: 280, ttr: 7.4, cpt: 1.68, cptChange:  +4.8 },
    { keyword: 'money transfer',       spend:  980, impressions: 15200, taps: 5340, installs: 214, ttr: 6.1, cpt: 1.42, cptChange:  -2.1 },
    { keyword: 'free money app',       spend:  980, impressions: 14600, taps: 5910, installs: 305, ttr: 7.8, cpt: 1.31, cptChange:  +3.9 },
    { keyword: 'crypto wallet app',    spend:  890, impressions: 10200, taps: 3120, installs:  58, ttr: 4.8, cpt: 1.72, cptChange: +11.2 },
    { keyword: 'cash transfer app',    spend:  820, impressions: 12400, taps: 4480, installs: 176, ttr: 5.9, cpt: 1.89, cptChange:  +7.3 },
    { keyword: 'cash advance app',     spend:  820, impressions: 13000, taps: 4760, installs: 232, ttr: 6.6, cpt: 1.44, cptChange:  +2.6 },
    { keyword: 'bitcoin purchase app', spend:  740, impressions:  8800, taps: 2640, installs:  48, ttr: 4.3, cpt: 1.95, cptChange: +13.4 },
    { keyword: 'peer payment',         spend:  690, impressions: 10600, taps: 3890, installs: 152, ttr: 6.2, cpt: 1.35, cptChange:  -1.6 },
    { keyword: 'debit card app',       spend:  710, impressions: 11400, taps: 4120, installs: 193, ttr: 7.0, cpt: 1.22, cptChange:  -0.5 },
    { keyword: 'stock trading app',    spend:  620, impressions:  7600, taps: 2280, installs:  41, ttr: 5.2, cpt: 1.61, cptChange:  +9.8 },
  ],
  'Mock App': [
    { keyword: 'productivity app',     spend:  720, impressions: 11400, taps: 4240, installs: 198, ttr: 6.4, cpt: 1.18, cptChange:  +3.6 },
    { keyword: 'task manager',         spend:  610, impressions:  9800, taps: 3620, installs: 172, ttr: 5.9, cpt: 1.04, cptChange:  -2.2 },
    { keyword: 'business app',         spend:  580, impressions:  9200, taps: 3980, installs: 241, ttr: 7.2, cpt: 0.98, cptChange:  +4.7 },
    { keyword: 'workflow automation',  spend:  540, impressions:  6400, taps: 1880, installs:  36, ttr: 4.5, cpt: 1.32, cptChange:  +9.1 },
    { keyword: 'team collaboration',   spend:  490, impressions:  8200, taps: 2960, installs: 148, ttr: 5.6, cpt: 1.45, cptChange:  +6.8 },
    { keyword: 'project management',   spend:  470, impressions:  8600, taps: 3240, installs: 184, ttr: 6.1, cpt: 1.11, cptChange:  +1.9 },
    { keyword: 'note taking app',      spend:  440, impressions:  9400, taps: 3560, installs: 221, ttr: 7.0, cpt: 0.88, cptChange:  -1.3 },
    { keyword: 'schedule planner',     spend:  420, impressions:  5600, taps: 1620, installs:  29, ttr: 4.0, cpt: 1.39, cptChange:  +7.5 },
    { keyword: 'time tracker app',     spend:  400, impressions:  7200, taps: 2380, installs: 126, ttr: 5.3, cpt: 0.96, cptChange:  -0.6 },
    { keyword: 'goal tracker',         spend:  370, impressions:  5200, taps: 1480, installs:  24, ttr: 4.2, cpt: 1.52, cptChange: +10.3 },
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
  { key: 'keyword',     compare: (a, b, dir) => dir === 'asc' ? a.keyword.localeCompare(b.keyword) : b.keyword.localeCompare(a.keyword) },
  { key: 'spend',       compare: (a, b, dir) => dir === 'asc' ? a.spend       - b.spend       : b.spend       - a.spend },
  { key: 'impressions', compare: (a, b, dir) => dir === 'asc' ? a.impressions - b.impressions : b.impressions - a.impressions },
  { key: 'taps',        compare: (a, b, dir) => dir === 'asc' ? a.taps        - b.taps        : b.taps        - a.taps },
  { key: 'installs',    compare: (a, b, dir) => dir === 'asc' ? a.installs    - b.installs    : b.installs    - a.installs },
  { key: 'ttr',         compare: (a, b, dir) => dir === 'asc' ? a.ttr         - b.ttr         : b.ttr         - a.ttr },
  { key: 'cpt',         compare: (a, b, dir) => dir === 'asc' ? a.cpt         - b.cpt         : b.cpt         - a.cpt },
]

export default function TopSpenderTable({ app }) {
  const [page, setPage]       = useState(0)
  const [sortKey, setSortKey] = useState('spend')
  const [sortDir, setSortDir] = useState('desc')

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
        <button onClick={() => handleSort('spend')}       className="flex items-center justify-end gap-0.5 text-xs font-medium hover:text-gray-900 transition-colors select-none" style={{ color: '#6b7280', width: 56  }}>Spend       <SortIcon colKey="spend"       /></button>
        <button onClick={() => handleSort('impressions')} className="flex items-center justify-end gap-0.5 text-xs font-medium hover:text-gray-900 transition-colors select-none" style={{ color: '#6b7280', width: 76  }}>Impressions <SortIcon colKey="impressions" /></button>
        <button onClick={() => handleSort('taps')}        className="flex items-center justify-end gap-0.5 text-xs font-medium hover:text-gray-900 transition-colors select-none" style={{ color: '#6b7280', width: 48  }}>Taps        <SortIcon colKey="taps"        /></button>
        <button onClick={() => handleSort('installs')}    className="flex items-center justify-end gap-0.5 text-xs font-medium hover:text-gray-900 transition-colors select-none" style={{ color: '#6b7280', width: 52  }}>Installs    <SortIcon colKey="installs"    /></button>
        <button onClick={() => handleSort('ttr')}         className="flex items-center justify-end gap-0.5 text-xs font-medium hover:text-gray-900 transition-colors select-none" style={{ color: '#6b7280', width: 36  }}>TTR         <SortIcon colKey="ttr"         /></button>
        <button onClick={() => handleSort('cpt')}         className="flex items-center justify-end gap-0.5 text-xs font-medium hover:text-gray-900 transition-colors select-none" style={{ color: '#6b7280', width: 76  }}>Average CPT <SortIcon colKey="cpt"         /></button>
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
            <div className="text-xs font-medium text-right" style={{ color: '#111827', width: 56 }}>
              ${kw.spend.toLocaleString()}
            </div>
            <div className="text-xs font-medium text-right" style={{ color: '#111827', width: 76 }}>
              {kw.impressions.toLocaleString()}
            </div>
            <div className="text-xs font-medium text-right" style={{ color: '#111827', width: 48 }}>
              {kw.taps.toLocaleString()}
            </div>
            <div className="text-xs font-medium text-right" style={{ color: '#111827', width: 52 }}>
              {kw.installs.toLocaleString()}
            </div>
            <div className="text-xs font-medium text-right" style={{ color: '#111827', width: 36 }}>
              {kw.ttr.toFixed(1)}%
            </div>
            <div className="flex flex-col items-end gap-0.5" style={{ width: 76 }}>
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

      {/* Nav link */}
      <div className="flex justify-end mt-3 pt-3" style={{ borderTop: '1px solid #f3f4f6' }}>
        <button className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: '#4B7BF5' }}>
          See top spender keywords on Ads Manager
          <ArrowRight size={11} />
        </button>
      </div>
    </div>
  )
}
