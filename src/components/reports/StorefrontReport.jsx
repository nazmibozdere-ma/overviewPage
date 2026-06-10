import { useState, useRef, useEffect, useMemo } from 'react'
import Highcharts from 'highcharts'
import { HighchartsReact } from 'highcharts-react-official'
import { ChevronDown, Check, ArrowRight } from 'lucide-react'

// ── Storefronts ───────────────────────────────────────────────────────────────
const STOREFRONTS = [
  { code: 'US', name: 'United States',  color: '#4B7BF5' },
  { code: 'UK', name: 'United Kingdom', color: '#7B6CF6' },
  { code: 'CA', name: 'Canada',         color: '#F5A623' },
  { code: 'AU', name: 'Australia',      color: '#4CAF7D' },
  { code: 'DE', name: 'Germany',        color: '#F44C7B' },
  { code: 'FR', name: 'France',         color: '#00BCD4' },
  { code: 'JP', name: 'Japan',          color: '#FF7043' },
  { code: 'KR', name: 'South Korea',    color: '#9C27B0' },
]

const APP_DISTRIBUTION = {
  'Square Point of Sale (POS)': { US: 0.671, UK: 0.082, CA: 0.121, AU: 0.062, DE: 0.031, FR: 0.018, JP: 0.009, KR: 0.006 },
  'Cash App':                   { US: 0.724, UK: 0.138, CA: 0.063, AU: 0.041, DE: 0.019, FR: 0.009, JP: 0.004, KR: 0.002 },
  'Mock App':                   { US: 0.582, UK: 0.104, CA: 0.138, AU: 0.071, DE: 0.058, FR: 0.027, JP: 0.012, KR: 0.008 },
}

// Multiplicative modifiers per metric per country — applied to base distribution then
// renormalized, so each metric shows a distinct percentage breakdown.
// Rationale: Spend skews toward higher-CPI markets (EU/JP); Impressions toward
// high-volume markets; Installs/Goals toward high-CR markets (US/CA).
const METRIC_MOD = {
  Spend:       { US: 1.00, UK: 1.12, CA: 1.05, AU: 1.18, DE: 1.30, FR: 1.38, JP: 1.52, KR: 1.56 },
  Impressions: { US: 1.00, UK: 1.06, CA: 1.03, AU: 1.00, DE: 1.10, FR: 1.14, JP: 1.20, KR: 1.18 },
  Taps:        { US: 1.00, UK: 1.02, CA: 1.04, AU: 0.96, DE: 0.90, FR: 0.86, JP: 1.08, KR: 1.12 },
  Installs:    { US: 1.00, UK: 0.94, CA: 0.98, AU: 0.88, DE: 0.82, FR: 0.76, JP: 0.70, KR: 0.66 },
  Goals:       { US: 1.00, UK: 0.90, CA: 0.96, AU: 0.85, DE: 0.80, FR: 0.74, JP: 0.68, KR: 0.64 },
}

function adjustedDistribution(baseDist, metricKey) {
  const mod = METRIC_MOD[metricKey] || METRIC_MOD.Spend
  const raw = {}
  let total = 0
  for (const code of Object.keys(baseDist)) {
    raw[code] = baseDist[code] * (mod[code] ?? 1)
    total += raw[code]
  }
  const normalized = {}
  for (const code of Object.keys(raw)) {
    normalized[code] = raw[code] / total
  }
  return normalized
}

// ── Metrics (matching metric cards only) ─────────────────────────────────────
const METRICS = [
  { key: 'Spend',       label: 'Spend',       fmt: (v) => `$${Math.round(v).toLocaleString()}` },
  { key: 'Impressions', label: 'Impressions',  fmt: (v) => Math.round(v).toLocaleString() },
  { key: 'Taps',        label: 'Taps',         fmt: (v) => Math.round(v).toLocaleString() },
  { key: 'Installs',    label: 'Installs',     fmt: (v) => Math.round(v).toLocaleString() },
  { key: 'Goals',       label: 'Goals',        fmt: (v) => Math.round(v).toLocaleString() },
]

// ── Simple metric dropdown ────────────────────────────────────────────────────
function MetricDropdown({ selected, onSelect, metrics = METRICS }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const current = metrics.find((m) => m.key === selected) || metrics[0]

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors select-none"
        style={{
          borderColor:     open ? '#4B7BF5' : '#e5e7eb',
          color:           open ? '#4B7BF5' : '#374151',
          backgroundColor: open ? '#f0f4ff' : '#ffffff',
        }}
      >
        {current.label}
        <ChevronDown
          size={12}
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}
        />
      </button>

      {open && (
        <div
          className="absolute top-full right-0 mt-1.5 bg-white rounded-xl border border-gray-100 py-1.5 z-50"
          style={{ minWidth: 140, boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}
        >
          {metrics.map((m) => (
            <button
              key={m.key}
              onClick={() => { onSelect(m.key); setOpen(false) }}
              className="w-full flex items-center justify-between px-4 py-2 text-xs transition-colors hover:bg-gray-50"
              style={{
                color:      selected === m.key ? '#4B7BF5' : '#374151',
                fontWeight: selected === m.key ? '500' : '400',
              }}
            >
              {m.label}
              {selected === m.key && <Check size={11} style={{ color: '#4B7BF5' }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Data computation ──────────────────────────────────────────────────────────
function buildChartData(metricKey, app, metricData) {
  const baseDist = APP_DISTRIBUTION[app] || APP_DISTRIBUTION['Square Point of Sale (POS)']
  const dist     = adjustedDistribution(baseDist, metricKey)
  const { Spend, Impressions, Taps, Installs, Goals } = metricData

  const all = STOREFRONTS.map(({ code, name, color }) => {
    const share = dist[code] ?? 0
    let value
    switch (metricKey) {
      case 'Spend':       value = Spend.cur       * share; break
      case 'Impressions': value = Impressions.cur * share; break
      case 'Taps':        value = Taps.cur        * share; break
      case 'Installs':    value = Installs.cur    * share; break
      case 'Goals':       value = Goals.cur       * share; break
      default:            value = 0
    }
    return { name, code, color, value }
  })

  // Top 5 by value, rest aggregated
  const sorted   = [...all].sort((a, b) => b.value - a.value)
  const top5     = sorted.slice(0, 5)
  const rest     = sorted.slice(5)
  const otherVal = rest.reduce((s, d) => s + d.value, 0)

  const points = [
    ...top5,
    {
      name:      'Other Countries',
      code:      'OTH',
      color:     '#cbd5e1',
      value:     otherVal,
      isOther:   true,
      breakdown: rest.map((d) => ({ name: d.name, value: d.value })),
    },
  ]

  const total = points.reduce((s, d) => s + d.value, 0)
  return points.map((d) => ({
    ...d,
    pct: total > 0 ? ((d.value / total) * 100).toFixed(1) : '0.0',
  }))
}

// ── Chart options ─────────────────────────────────────────────────────────────
const ABBR = {
  'United States': 'US', 'United Kingdom': 'UK', 'Canada': 'CA',
  'Australia': 'AU', 'Germany': 'DE', 'France': 'FR', 'Japan': 'JP', 'South Korea': 'KR',
  'Other Countries': 'Others',
}

function buildChartOptions(data, metricDef) {
  const seriesData = data.map((d) => ({
    name:      d.name,
    y:         d.value,
    color:     d.color,
    isOther:   d.isOther || false,
    breakdown: d.breakdown || [],
    pct:       d.pct || '0.0',
  }))

  return {
    chart: {
      type: 'column',
      backgroundColor: 'transparent',
      height: 220,
      spacing: [12, 8, 8, 8],
      style: { fontFamily: 'inherit' },
    },
    title:   { text: null },
    credits: { enabled: false },
    legend:  { enabled: false },
    xAxis: {
      categories: data.map((d) => ABBR[d.name] || d.name),
      tickLength: 0,
      lineColor: '#e5e7eb',
      labels: { style: { fontSize: '11px', color: '#374151', fontWeight: '500' } },
    },
    yAxis: {
      title: {
        text: metricDef.label,
        style: { fontSize: '11px', color: '#6b7280', fontWeight: '500' },
        margin: 10,
      },
      gridLineColor: '#f3f4f6',
      labels: {
        style: { fontSize: '11px', color: '#6b7280' },
        formatter() { return metricDef.fmt(this.value) },
      },
    },
    tooltip: {
      backgroundColor: '#1f2937',
      borderWidth: 0,
      borderRadius: 10,
      shadow: true,
      style: { color: '#f9fafb', fontSize: '12px' },
      useHTML: true,
      formatter() {
        if (this.point.isOther && this.point.breakdown?.length) {
          const rows = this.point.breakdown
            .map((b) => `<span style="color:#9ca3af">${b.name}:</span> ${metricDef.fmt(b.value)}`)
            .join('<br/>')
          return (
            `<b>Other Countries</b><br/>` +
            `${metricDef.fmt(this.y)}<br/>` +
            `<span style="color:#6b7280;font-size:11px;display:block;margin-top:6px;border-top:1px solid #374151;padding-top:6px">${rows}</span>`
          )
        }
        return `<b>${this.key}</b><br/>${metricDef.fmt(this.y)} <span style="color:#9ca3af">(${this.point.pct}%)</span>`
      },
    },
    plotOptions: {
      column: {
        borderRadius: 5,
        borderWidth: 0,
        colorByPoint: true,
        states: { hover: { brightness: -0.1 } },
        dataLabels: {
          enabled: true,
          formatter() { return `${this.point.pct}%` },
          style: {
            fontSize: '11px',
            fontWeight: '600',
            color: '#374151',
            textOutline: 'none',
          },
        },
      },
    },
    series: [{ name: metricDef.label, data: seriesData }],
  }
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function StorefrontReport({ app, metricData, integrationState }) {
  const [selectedMetric, setSelectedMetric] = useState('Spend')

  const availableMetrics = integrationState === 'apple-only'
    ? METRICS.filter((m) => m.key !== 'Goals')
    : METRICS

  const metricDef = availableMetrics.find((m) => m.key === selectedMetric) || availableMetrics[0]

  const chartData = useMemo(
    () => buildChartData(selectedMetric, app, metricData),
    [selectedMetric, app, metricData]
  )

  const chartOptions = useMemo(
    () => buildChartOptions(chartData, metricDef),
    [chartData, metricDef]
  )

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 p-5"
      style={{ boxShadow: '0 1px 4px 0 rgba(0,0,0,0.06)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold" style={{ color: '#111827' }}>
          Top Spender Countries
        </h3>
        <MetricDropdown selected={selectedMetric} onSelect={setSelectedMetric} metrics={availableMetrics} />
      </div>

      <HighchartsReact highcharts={Highcharts} options={chartOptions} />

      <div className="flex justify-end mt-3 pt-3" style={{ borderTop: '1px solid #f3f4f6' }}>
        <button
          className="inline-flex items-center gap-1 text-xs font-medium"
          style={{ color: '#4B7BF5' }}
        >
          See Top Spender Countries on Ads Manager
          <ArrowRight size={11} />
        </button>
      </div>
    </div>
  )
}
