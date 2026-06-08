import { useState } from 'react'
import { ArrowUpRight, ArrowDownLeft, ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react'

// ── Mock data ─────────────────────────────────────────────────────────────────
const CAMPAIGN_DATA = {
  'Square Point of Sale (POS)': [
    { name: 'Brand – United States',  spend: 14820, installs: 5410, installsDelta: +12.4, budget: 18000, dailyBudget: 1800 },
    { name: 'App Install – Broad',    spend: 11240, installs: 4180, installsDelta:  -5.2, budget: 14000, dailyBudget: 1500 },
    { name: 'Competitor Keywords',    spend:  8930, installs: 3020, installsDelta:  +8.7, budget: 12000, dailyBudget: 1200 },
    { name: 'Seasonal – Q2 2026',     spend:  7650, installs: 2760, installsDelta: +22.1, budget: 10000, dailyBudget:  950 },
    { name: 'New Users – US',         spend:  6410, installs: 2340, installsDelta:  -3.8, budget:  8000, dailyBudget:  750 },
  ],
  'Cash App': [
    { name: 'P2P Payments – US',      spend: 18360, installs: 6190, installsDelta:  +8.9, budget: 22000, dailyBudget: 1750 },
    { name: 'Direct Deposit',         spend: 14280, installs: 4820, installsDelta:  -6.1, budget: 18000, dailyBudget: 1400 },
    { name: 'Card Activation',        spend: 11620, installs: 3940, installsDelta: +14.2, budget: 14000, dailyBudget: 1100 },
    { name: 'New User Acquisition',   spend:  9840, installs: 3320, installsDelta:  -2.8, budget: 12000, dailyBudget:  900 },
    { name: 'Brand US',               spend:  7930, installs: 2680, installsDelta:  +5.3, budget: 10000, dailyBudget:  800 },
  ],
}

// ── Cell components ───────────────────────────────────────────────────────────

function DeltaBadge({ value }) {
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
      {Math.abs(value).toFixed(1)}%
    </span>
  )
}

function BudgetUtilCell({ spend, budget, dailyBudget }) {
  const [hovered, setHovered] = useState(false)
  const pct = Math.min((spend / budget) * 100, 100)

  return (
    <div
      className="relative flex justify-end"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className="text-xs font-medium cursor-default" style={{ color: '#111827' }}>
        {pct.toFixed(0)}%
      </span>

      {hovered && (
        <div
          className="absolute z-50 rounded-xl pointer-events-none"
          style={{
            backgroundColor: '#1f2937',
            color: '#f9fafb',
            padding: '8px 12px',
            bottom: 'calc(100% + 6px)',
            right: 0,
            whiteSpace: 'nowrap',
            fontSize: 12,
            lineHeight: 1.5,
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
          }}
        >
          {/* Downward arrow */}
          <div
            className="absolute"
            style={{
              top: '100%', right: 10,
              borderWidth: 5, borderStyle: 'solid',
              borderColor: '#1f2937 transparent transparent transparent',
            }}
          />
          <span style={{ color: '#9ca3af' }}>Daily Budget: </span>
          <span style={{ fontWeight: 600 }}>${dailyBudget.toLocaleString()}</span>
        </div>
      )}
    </div>
  )
}

const COLUMNS = [
  { key: 'name',    compare: (a, b, dir) => dir === 'asc' ? a.name.localeCompare(b.name)    : b.name.localeCompare(a.name) },
  { key: 'spend',   compare: (a, b, dir) => dir === 'asc' ? a.spend    - b.spend    : b.spend    - a.spend },
  { key: 'installs',compare: (a, b, dir) => dir === 'asc' ? a.installs - b.installs : b.installs - a.installs },
  { key: 'budget',  compare: (a, b, dir) => {
    const pctA = a.spend / a.budget
    const pctB = b.spend / b.budget
    return dir === 'asc' ? pctA - pctB : pctB - pctA
  }},
]

// ── Component ─────────────────────────────────────────────────────────────────
export default function CampaignReport({ app }) {
  const [sortKey, setSortKey] = useState('spend')
  const [sortDir, setSortDir] = useState('desc')

  const handleSort = (key) => {
    if (key === sortKey) {
      setSortDir((d) => d === 'desc' ? 'asc' : 'desc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const col       = COLUMNS.find((c) => c.key === sortKey)
  const raw       = CAMPAIGN_DATA[app] || CAMPAIGN_DATA['Square Point of Sale (POS)']
  const campaigns = [...raw].sort((a, b) => col.compare(a, b, sortDir))

  function SortIcon({ colKey }) {
    if (sortKey !== colKey) return <ChevronsUpDown size={10} style={{ flexShrink: 0, opacity: 0.4 }} />
    return sortDir === 'desc'
      ? <ChevronDown size={10} style={{ flexShrink: 0 }} />
      : <ChevronUp   size={10} style={{ flexShrink: 0 }} />
  }

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col"
      style={{ boxShadow: '0 1px 4px 0 rgba(0,0,0,0.06)' }}
    >
      {/* Header */}
      <h3 className="text-sm font-semibold mb-4" style={{ color: '#111827' }}>
        Top Spender Campaigns
      </h3>

      {/* Table header */}
      <div
        className="flex items-center gap-3 pb-2 px-1"
        style={{ borderBottom: '1px solid #f3f4f6' }}
      >
        <button
          onClick={() => handleSort('name')}
          className="flex-1 flex items-center gap-0.5 text-xs font-medium hover:text-gray-900 transition-colors select-none"
          style={{ color: '#6b7280' }}
        >
          Campaign
          <SortIcon colKey="name" />
        </button>
        <button
          onClick={() => handleSort('spend')}
          className="flex items-center justify-end gap-0.5 text-xs font-medium hover:text-gray-900 transition-colors select-none"
          style={{ color: '#6b7280', width: 72 }}
        >
          Spend
          <SortIcon colKey="spend" />
        </button>
        <button
          onClick={() => handleSort('installs')}
          className="flex items-center justify-end gap-0.5 text-xs font-medium hover:text-gray-900 transition-colors select-none"
          style={{ color: '#6b7280', width: 88 }}
        >
          Installs
          <SortIcon colKey="installs" />
        </button>
        <button
          onClick={() => handleSort('budget')}
          className="flex items-center justify-end gap-0.5 text-xs font-medium hover:text-gray-900 transition-colors select-none"
          style={{ color: '#6b7280', width: 130 }}
        >
          Budget Utilization
          <SortIcon colKey="budget" />
        </button>
      </div>

      {/* Rows */}
      <div className="flex-1">
        {campaigns.map((c) => (
          <div
            key={c.name}
            className="flex items-center gap-3 py-2.5 rounded-lg px-1 -mx-1 transition-colors hover:bg-gray-50"
            style={{ borderBottom: '1px solid #f9fafb' }}
          >
            {/* Campaign name */}
            <div className="flex-1 min-w-0">
              <span className="text-xs font-medium truncate block" style={{ color: '#111827' }}>
                {c.name}
              </span>
            </div>

            {/* Spend */}
            <div className="text-xs font-medium text-right" style={{ width: 72, color: '#111827' }}>
              ${c.spend.toLocaleString()}
            </div>

            {/* Installs + delta */}
            <div className="flex flex-col items-end gap-0.5" style={{ width: 88 }}>
              <span className="text-xs font-medium" style={{ color: '#111827' }}>
                {c.installs.toLocaleString()}
              </span>
              <DeltaBadge value={c.installsDelta} />
            </div>

            {/* Budget utilization */}
            <div style={{ width: 130 }}>
              <BudgetUtilCell spend={c.spend} budget={c.budget} dailyBudget={c.dailyBudget} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
