import { useState } from 'react'
import { ArrowUpRight, ArrowDownLeft, ArrowRight, ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react'

// ── Mock data ─────────────────────────────────────────────────────────────────
const CAMPAIGN_DATA = {
  'Square Point of Sale (POS)': [
    { name: 'Brand – United States',  spend: 14820, installs: 5410, installsDelta: +12.4, taps: 38200, ttr: 6.8, avgCpt: 0.39 },
    { name: 'App Install – Broad',    spend: 11240, installs: 4180, installsDelta:  -5.2, taps: 29600, ttr: 5.4, avgCpt: 0.38 },
    { name: 'Competitor Keywords',    spend:  8930, installs: 3020, installsDelta:  +8.7, taps: 21400, ttr: 7.2, avgCpt: 0.42 },
    { name: 'Seasonal – Q2 2026',     spend:  7650, installs: 2760, installsDelta: +22.1, taps: 18900, ttr: 8.1, avgCpt: 0.40 },
    { name: 'New Users – US',         spend:  6410, installs: 2340, installsDelta:  -3.8, taps: 15700, ttr: 5.9, avgCpt: 0.41 },
  ],
  'Cash App': [
    { name: 'P2P Payments – US',      spend: 18360, installs: 6190, installsDelta:  +8.9, taps: 46800, ttr: 7.4, avgCpt: 0.39 },
    { name: 'Direct Deposit',         spend: 14280, installs: 4820, installsDelta:  -6.1, taps: 35100, ttr: 6.2, avgCpt: 0.41 },
    { name: 'Card Activation',        spend: 11620, installs: 3940, installsDelta: +14.2, taps: 27300, ttr: 8.3, avgCpt: 0.43 },
    { name: 'New User Acquisition',   spend:  9840, installs: 3320, installsDelta:  -2.8, taps: 22600, ttr: 5.8, avgCpt: 0.44 },
    { name: 'Brand US',               spend:  7930, installs: 2680, installsDelta:  +5.3, taps: 18400, ttr: 6.9, avgCpt: 0.43 },
  ],
  'Mock App': [
    { name: 'Brand – Global',         spend:  9210, installs: 3180, installsDelta:  +7.2, taps: 23400, ttr: 6.1, avgCpt: 0.39 },
    { name: 'App Install – Broad',    spend:  7640, installs: 2540, installsDelta:  -4.3, taps: 18200, ttr: 5.6, avgCpt: 0.42 },
    { name: 'Retargeting – US',       spend:  5980, installs: 1920, installsDelta: +11.8, taps: 13600, ttr: 7.0, avgCpt: 0.44 },
    { name: 'Category Discovery',     spend:  4820, installs: 1580, installsDelta:  -1.6, taps: 10800, ttr: 5.2, avgCpt: 0.45 },
    { name: 'New Users – CA/AU',      spend:  3540, installs: 1140, installsDelta:  +9.4, taps:  8100, ttr: 6.4, avgCpt: 0.44 },
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

const COLUMNS = [
  { key: 'name',     compare: (a, b, dir) => dir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name) },
  { key: 'spend',    compare: (a, b, dir) => dir === 'asc' ? a.spend    - b.spend    : b.spend    - a.spend },
  { key: 'installs', compare: (a, b, dir) => dir === 'asc' ? a.installs - b.installs : b.installs - a.installs },
  { key: 'taps',     compare: (a, b, dir) => dir === 'asc' ? a.taps     - b.taps     : b.taps     - a.taps },
  { key: 'ttr',      compare: (a, b, dir) => dir === 'asc' ? a.ttr      - b.ttr      : b.ttr      - a.ttr },
  { key: 'avgCpt',   compare: (a, b, dir) => dir === 'asc' ? a.avgCpt   - b.avgCpt   : b.avgCpt   - a.avgCpt },
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
      <h3 className="text-sm font-semibold mb-4" style={{ color: '#111827' }}>
        Top Spender Campaigns
      </h3>

      {/* Table header */}
      <div className="flex items-center gap-2 pb-2 px-1" style={{ borderBottom: '1px solid #f3f4f6' }}>
        <button
          onClick={() => handleSort('name')}
          className="flex-1 flex items-center gap-0.5 text-xs font-medium hover:text-gray-900 transition-colors select-none"
          style={{ color: '#6b7280' }}
        >
          Campaign
          <SortIcon colKey="name" />
        </button>
        <button onClick={() => handleSort('spend')}    className="flex items-center justify-end gap-0.5 text-xs font-medium hover:text-gray-900 transition-colors select-none" style={{ color: '#6b7280', width: 64 }}>Spend    <SortIcon colKey="spend"    /></button>
        <button onClick={() => handleSort('installs')} className="flex items-center justify-end gap-0.5 text-xs font-medium hover:text-gray-900 transition-colors select-none" style={{ color: '#6b7280', width: 72 }}>Installs <SortIcon colKey="installs" /></button>
        <button onClick={() => handleSort('taps')}     className="flex items-center justify-end gap-0.5 text-xs font-medium hover:text-gray-900 transition-colors select-none" style={{ color: '#6b7280', width: 56 }}>Taps     <SortIcon colKey="taps"     /></button>
        <button onClick={() => handleSort('ttr')}      className="flex items-center justify-end gap-0.5 text-xs font-medium hover:text-gray-900 transition-colors select-none" style={{ color: '#6b7280', width: 44 }}>TTR      <SortIcon colKey="ttr"      /></button>
        <button onClick={() => handleSort('avgCpt')}   className="flex items-center justify-end gap-0.5 text-xs font-medium hover:text-gray-900 transition-colors select-none" style={{ color: '#6b7280', width: 68 }}>Avg CPT  <SortIcon colKey="avgCpt"   /></button>
      </div>

      {/* Rows */}
      <div className="flex-1">
        {campaigns.map((c) => (
          <div
            key={c.name}
            className="flex items-center gap-2 py-2.5 rounded-lg px-1 -mx-1 transition-colors hover:bg-gray-50"
            style={{ borderBottom: '1px solid #f9fafb' }}
          >
            <div className="flex-1 min-w-0">
              <span className="text-xs font-medium truncate block" style={{ color: '#111827' }}>{c.name}</span>
            </div>
            <div className="text-xs font-medium text-right" style={{ width: 64, color: '#111827' }}>
              ${c.spend.toLocaleString()}
            </div>
            <div className="flex flex-col items-end gap-0.5" style={{ width: 72 }}>
              <span className="text-xs font-medium" style={{ color: '#111827' }}>{c.installs.toLocaleString()}</span>
              <DeltaBadge value={c.installsDelta} />
            </div>
            <div className="text-xs font-medium text-right" style={{ width: 56, color: '#111827' }}>
              {c.taps.toLocaleString()}
            </div>
            <div className="text-xs font-medium text-right" style={{ width: 44, color: '#111827' }}>
              {c.ttr.toFixed(1)}%
            </div>
            <div className="text-xs font-medium text-right" style={{ width: 68, color: '#111827' }}>
              ${c.avgCpt.toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      {/* Nav link */}
      <div className="flex justify-end mt-3 pt-3" style={{ borderTop: '1px solid #f3f4f6' }}>
        <button className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: '#4B7BF5' }}>
          See top spender campaigns on Ads Manager
          <ArrowRight size={11} />
        </button>
      </div>
    </div>
  )
}
