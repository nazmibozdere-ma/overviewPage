import { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown, ArrowRight } from 'lucide-react'

// ── Entity config ─────────────────────────────────────────────────────────────
const ENTITIES = [
  { key: 'campaign',  label: 'Campaign',  plural: 'Campaigns'  },
  { key: 'adgroup',   label: 'Ad Group',  plural: 'Ad Groups'  },
  { key: 'keyword',   label: 'Keyword',   plural: 'Keywords'   },
  { key: 'ad',        label: 'Ad',        plural: 'Ads'        },
]

// ── Mock data ─────────────────────────────────────────────────────────────────
const MOCK = {
  'Square Point of Sale (POS)': {
    campaign: [
      { name: 'Brand – United States',     spend: 14820, impressions: 82400,  installs: 5410 },
      { name: 'App Install – Broad',       spend: 11240, impressions: 68900,  installs: 4180 },
      { name: 'Competitor Keywords',       spend:  8930, impressions: 51200,  installs: 3020 },
      { name: 'Seasonal – Q2 2026',        spend:  7650, impressions: 44800,  installs: 2760 },
      { name: 'New Users – US',            spend:  6410, impressions: 39100,  installs: 2340 },
      { name: 'Category – POS Systems',   spend:  5180, impressions: 31600,  installs: 1890 },
      { name: 'Brand – Canada',            spend:  3920, impressions: 24200,  installs: 1520 },
      { name: 'App Install – Canada',      spend:  3140, impressions: 19800,  installs: 1210 },
      { name: 'Retargeting – Lapsed',      spend:  2480, impressions: 15400,  installs:  890 },
      { name: 'Holiday Promo',             spend:  1720, impressions: 10900,  installs:  620 },
    ],
    adgroup: [
      { name: 'Exact – "point of sale"',   spend:  9840, impressions: 57200,  installs: 3780 },
      { name: 'Broad – register app',      spend:  8210, impressions: 49100,  installs: 3090 },
      { name: 'Competitor – Toast POS',    spend:  6780, impressions: 40300,  installs: 2420 },
      { name: 'Brand – Square core',       spend:  5620, impressions: 33400,  installs: 2140 },
      { name: 'Category – retail',         spend:  4890, impressions: 29800,  installs: 1860 },
      { name: 'Exact – "square app"',      spend:  4120, impressions: 25100,  installs: 1530 },
      { name: 'Broad – inventory mgmt',    spend:  3240, impressions: 19600,  installs: 1190 },
      { name: 'Discovery – restaurant',    spend:  2580, impressions: 15700,  installs:  940 },
      { name: 'Broad – payment terminal',  spend:  1940, impressions: 11800,  installs:  710 },
      { name: 'Exact – "pos system"',      spend:  1120, impressions:  6900,  installs:  410 },
    ],
    keyword: [
      { name: 'point of sale app',         spend:  6420, sov: 18.4, sovChange:  3.2, installs: 2540 },
      { name: 'square register',           spend:  5810, sov: 15.2, sovChange: -1.8, installs: 2290 },
      { name: 'cash register app',         spend:  4930, sov: 12.8, sovChange:  2.1, installs: 1940 },
      { name: 'pos system iphone',         spend:  4120, sov: 10.4, sovChange: -0.6, installs: 1630 },
      { name: 'retail management app',     spend:  3480, sov:  8.9, sovChange:  1.4, installs: 1380 },
      { name: 'payment terminal app',      spend:  2760, sov:  7.2, sovChange: -2.3, installs: 1090 },
      { name: 'inventory tracker',         spend:  2140, sov:  5.8, sovChange:  0.9, installs:  840 },
      { name: 'small business pos',        spend:  1680, sov:  4.6, sovChange: -1.2, installs:  660 },
      { name: 'toast pos alternative',     spend:  1240, sov:  3.4, sovChange:  0.4, installs:  490 },
      { name: 'card reader app',           spend:   820, sov:  2.1, sovChange: -0.7, installs:  320 },
    ],
    ad: [
      { name: 'Spring Sale – Video 30s',   spend:  7840, impressions: 46200,  installs: 3090 },
      { name: 'Product Demo – Static',     spend:  6920, impressions: 41400,  installs: 2740 },
      { name: 'App Preview – V2',          spend:  5810, impressions: 34900,  installs: 2310 },
      { name: 'Brand Story – 15s',         spend:  4760, impressions: 28800,  installs: 1890 },
      { name: 'Feature Highlight – Static',spend:  3940, impressions: 23900,  installs: 1560 },
      { name: 'Testimonial – Video',       spend:  3120, impressions: 18900,  installs: 1230 },
      { name: 'Holiday – Animated',        spend:  2480, impressions: 15100,  installs:  980 },
      { name: 'Onboarding – Static',       spend:  1840, impressions: 11200,  installs:  730 },
      { name: 'Promo – 10s Video',         spend:  1280, impressions:  7900,  installs:  510 },
      { name: 'Simple – Text Only',        spend:   740, impressions:  4600,  installs:  290 },
    ],
  },
  'Cash App': {
    campaign: [
      { name: 'P2P Payments – US',         spend: 18640, impressions: 112400, installs: 6820 },
      { name: 'Direct Deposit',            spend: 15280, impressions:  92600, installs: 5410 },
      { name: 'Cash Card Launch',          spend: 11920, impressions:  72100, installs: 4230 },
      { name: 'Brand – Core US',           spend:  9340, impressions:  56800, installs: 3380 },
      { name: 'New User Acquisition',      spend:  7680, impressions:  46700, installs: 2760 },
      { name: 'Tax Refund Season',         spend:  6120, impressions:  37400, installs: 2190 },
      { name: 'Investing Feature',         spend:  4840, impressions:  29600, installs: 1720 },
      { name: 'Brand – United Kingdom',    spend:  3920, impressions:  24100, installs: 1380 },
      { name: 'Crypto – Bitcoin',          spend:  2760, impressions:  17000, installs:  960 },
      { name: 'Savings Feature',           spend:  1820, impressions:  11300, installs:  640 },
    ],
    adgroup: [
      { name: 'Exact – "cash app"',        spend: 12480, impressions:  75400, installs: 4560 },
      { name: 'Broad – send money app',    spend:  9820, impressions:  59600, installs: 3610 },
      { name: 'Competitor – Venmo',        spend:  8140, impressions:  49400, installs: 2980 },
      { name: 'Competitor – PayPal',       spend:  6780, impressions:  41200, installs: 2490 },
      { name: 'Category – finance',        spend:  5620, impressions:  34100, installs: 2060 },
      { name: 'Broad – digital wallet',    spend:  4380, impressions:  26700, installs: 1610 },
      { name: 'Exact – "free money app"',  spend:  3240, impressions:  19800, installs: 1190 },
      { name: 'Discovery – teens',         spend:  2480, impressions:  15200, installs:  910 },
      { name: 'Broad – crypto app',        spend:  1820, impressions:  11200, installs:  670 },
      { name: 'Exact – "cash card"',       spend:  1020, impressions:   6300, installs:  380 },
    ],
    keyword: [
      { name: 'cash app',                  spend:  9840, sov: 24.6, sovChange: -4.2, installs: 3620 },
      { name: 'send money instantly',      spend:  7920, sov: 19.8, sovChange:  2.8, installs: 2910 },
      { name: 'venmo alternative',         spend:  6380, sov: 16.2, sovChange: -1.9, installs: 2340 },
      { name: 'free debit card app',       spend:  5120, sov: 13.4, sovChange:  3.1, installs: 1880 },
      { name: 'direct deposit app',        spend:  4280, sov: 11.8, sovChange: -0.8, installs: 1570 },
      { name: 'p2p payment app',           spend:  3460, sov:  9.6, sovChange:  1.6, installs: 1270 },
      { name: 'invest spare change',       spend:  2640, sov:  7.4, sovChange: -2.4, installs:  970 },
      { name: 'bitcoin purchase app',      spend:  1980, sov:  5.8, sovChange:  0.7, installs:  730 },
      { name: 'digital wallet iphone',     spend:  1340, sov:  4.2, sovChange: -1.1, installs:  490 },
      { name: 'mobile banking app',        spend:   820, sov:  2.6, sovChange:  0.3, installs:  300 },
    ],
    ad: [
      { name: 'Send Money – Video 30s',    spend: 10240, impressions:  62100, installs: 3790 },
      { name: 'Cash Card – Static',        spend:  8620, impressions:  52400, installs: 3180 },
      { name: 'Brand Story – 15s',         spend:  6840, impressions:  41700, installs: 2530 },
      { name: 'Direct Deposit – Static',   spend:  5480, impressions:  33500, installs: 2020 },
      { name: 'Boosts Feature – Video',    spend:  4320, impressions:  26500, installs: 1590 },
      { name: 'App Preview – V3',          spend:  3280, impressions:  20200, installs: 1200 },
      { name: 'Crypto – Animated',         spend:  2480, impressions:  15300, installs:  910 },
      { name: 'Referral – Static',         spend:  1760, impressions:  10900, installs:  650 },
      { name: 'Savings – 10s Video',       spend:  1120, impressions:   6900, installs:  410 },
      { name: 'Simple – Text Only',        spend:   640, impressions:   4000, installs:  240 },
    ],
  },
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtSpend       = (v) => `$${v.toLocaleString()}`
const fmtImpressions = (v) => v.toLocaleString()
const fmtInstalls    = (v) => v.toLocaleString()
const fmtSov         = (v) => `${v.toFixed(1)}%`

// Default columns (campaign / adgroup / ad)
const DEFAULT_COLUMNS = [
  { key: 'spend',       sortKey: 'spend',       label: 'Spend',       fmt: fmtSpend,       align: 'right' },
  { key: 'impressions', sortKey: 'impressions',  label: 'Impressions',  fmt: fmtImpressions, align: 'right' },
  { key: 'installs',    sortKey: 'installs',     label: 'Installs',     fmt: fmtInstalls,    align: 'right' },
]

// Keyword columns — SOV replaces Impressions, sorted by sovChange
const KEYWORD_COLUMNS = [
  { key: 'spend',    sortKey: 'spend',     label: 'Spend',    fmt: fmtSpend,    align: 'right' },
  { key: 'sov',      sortKey: 'sovChange', label: 'SOV',      fmt: fmtSov,      align: 'right', isSov: true },
  { key: 'installs', sortKey: 'installs',  label: 'Installs', fmt: fmtInstalls, align: 'right' },
]

function SortIcon({ colSortKey, sortKey, sortDir }) {
  if (sortKey !== colSortKey) return <ChevronsUpDown size={12} style={{ color: '#d1d5db' }} />
  return sortDir === 'desc'
    ? <ChevronDown size={12} style={{ color: '#4B7BF5' }} />
    : <ChevronUp   size={12} style={{ color: '#4B7BF5' }} />
}

function SovBadge({ change }) {
  const pos = change >= 0
  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 rounded-full font-semibold ml-1.5"
      style={{
        backgroundColor: pos ? '#dcfce7' : '#fee2e2',
        color:           pos ? '#15803d' : '#dc2626',
        fontSize: '10px',
      }}
    >
      {pos ? '+' : ''}{change.toFixed(1)}%
    </span>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function TopEntityReport({ app }) {
  const [activeEntity, setActiveEntity] = useState('campaign')
  const [sortKey,  setSortKey]  = useState('spend')
  const [sortDir,  setSortDir]  = useState('desc')

  const entity  = ENTITIES.find((e) => e.key === activeEntity)
  const columns = activeEntity === 'keyword' ? KEYWORD_COLUMNS : DEFAULT_COLUMNS

  // Reset sort to spend when switching entity tabs
  const handleEntityChange = (key) => {
    setActiveEntity(key)
    setSortKey('spend')
    setSortDir('desc')
  }

  const rows = useMemo(() => {
    const appData = MOCK[app] || MOCK['Square Point of Sale (POS)']
    const raw     = appData[activeEntity] || []
    return [...raw].sort((a, b) =>
      sortDir === 'desc' ? b[sortKey] - a[sortKey] : a[sortKey] - b[sortKey]
    )
  }, [app, activeEntity, sortKey, sortDir])

  const handleSort = (col) => {
    const sk = col.sortKey
    if (sortKey === sk) setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))
    else { setSortKey(sk); setSortDir('desc') }
  }

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col"
      style={{ boxShadow: '0 1px 4px 0 rgba(0,0,0,0.06)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 gap-3">
        <h3 className="text-sm font-semibold whitespace-nowrap" style={{ color: '#111827' }}>
          Top {entity.plural} Report
        </h3>

        {/* Entity tabs */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {ENTITIES.map((e) => (
            <button
              key={e.key}
              onClick={() => handleEntityChange(e.key)}
              className="px-2.5 py-1 rounded-md text-xs font-medium transition-colors select-none"
              style={{
                backgroundColor: activeEntity === e.key ? '#0f172a' : '#f3f4f6',
                color:           activeEntity === e.key ? '#ffffff'  : '#6b7280',
              }}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto min-h-0">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
              <th
                className="text-left py-2 pr-3 text-xs font-semibold"
                style={{ color: '#6b7280', width: '38%' }}
              >
                Name
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="py-2 px-2 text-xs font-semibold cursor-pointer select-none"
                  style={{ color: sortKey === col.sortKey ? '#111827' : '#6b7280', textAlign: col.align }}
                  onClick={() => handleSort(col)}
                >
                  <span className="inline-flex items-center gap-1 justify-end">
                    {col.label}
                    <SortIcon colSortKey={col.sortKey} sortKey={sortKey} sortDir={sortDir} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                style={{ borderBottom: i < rows.length - 1 ? '1px solid #f9fafb' : 'none' }}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="py-2 pr-3 text-xs font-medium" style={{ color: '#111827', maxWidth: 0, width: '38%' }}>
                  <span className="block truncate">{row.name}</span>
                </td>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="py-2 px-2 text-xs tabular-nums"
                    style={{
                      textAlign:  col.align,
                      color:      sortKey === col.sortKey ? '#111827' : '#374151',
                      fontWeight: sortKey === col.sortKey ? '600' : '400',
                    }}
                  >
                    {col.isSov ? (
                      <span className="inline-flex items-center justify-end">
                        {fmtSov(row.sov)}
                        <SovBadge change={row.sovChange} />
                      </span>
                    ) : (
                      col.fmt(row[col.key])
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer link */}
      <div className="pt-3 mt-1" style={{ borderTop: '1px solid #f3f4f6' }}>
        <button
          className="inline-flex items-center gap-1 text-xs font-medium transition-colors hover:underline"
          style={{ color: '#4B7BF5' }}
        >
          Check {entity.plural} on Ads Manager
          <ArrowRight size={11} />
        </button>
      </div>
    </div>
  )
}
