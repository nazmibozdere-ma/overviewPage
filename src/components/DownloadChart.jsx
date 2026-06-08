import { useState } from 'react'
import Highcharts from 'highcharts'
import { HighchartsReact } from 'highcharts-react-official'

// ─── Categories ───────────────────────────────────────────────────────────────
const dailyCats   = ['Mar 2','Mar 3','Mar 4','Mar 5','Mar 6','Mar 7','Mar 8','Mar 9','Mar 10','Mar 11','Mar 12','Mar 13','Mar 14','Mar 15','Mar 16','Mar 17','Mar 18','Mar 19','Mar 20','Mar 21','Mar 22','Mar 23','Mar 24']
const weeklyCats  = ['Week 1','Week 2','Week 3','Week 4','Week 5','Week 6','Week 7']
const monthlyCats = ['January','February','March']

// ─── Metric config (type + data per period) ───────────────────────────────────
// types: 'integer' | 'percentage' | 'currency'
const METRIC_CONFIG = {
  'Impressions':      { type: 'integer',    daily: [1820,1950,2180,2060,1890,1680,1600,1640,1870,1960,1900,1955,1930,1810,1580,1600,1680,1820,1760,1800,1770,1620,1560], weekly: [1850,2050,1780,1900,1650,1620,1560], monthly: [52000,68000,61000] },
  'Taps':             { type: 'integer',    daily: [380,420,680,560,440,200,170,200,490,530,470,515,495,410,165,158,240,395,355,385,345,115,28],                         weekly: [390,570,430,490,280,260,180],         monthly: [9800,15200,13100] },
  'Downloads':        { type: 'integer',    daily: [175,215,375,275,195,82,65,80,205,240,205,230,220,175,72,68,108,178,158,172,155,75,22],                               weekly: [185,320,215,248,130,120,80],           monthly: [4800,7600,6500] },
  'Conversion Rate':  { type: 'percentage', daily: [44,52,68,61,55,34,31,34,52,58,52,57,54,48,29,28,36,47,43,46,43,26,11],                                              weekly: [46,62,50,55,38,36,28],                monthly: [38,61,54] },
  'Spend':            { type: 'currency',   daily: [6800,7200,8600,7950,7150,6050,5750,5950,7050,7450,7100,7350,7200,6800,5750,5700,6100,6950,6650,6850,6620,5550,5080], weekly: [6900,8100,7000,7400,6200,6050,5500],   monthly: [158000,198000,178000] },
  'Cost per Install': { type: 'currency',   daily: [3.20,2.80,1.80,2.20,2.90,3.85,4.10,3.90,2.65,2.35,2.75,2.45,2.60,3.00,4.25,4.40,3.70,2.90,3.10,2.90,3.15,4.55,5.80], weekly: [3.1,2.2,2.9,2.6,3.8,3.9,4.5],     monthly: [2.8,2.4,2.6] },
  'TTR':              { type: 'percentage', daily: [58,62,71,67,63,54,52,54,62,65,62,64,63,59,50,50,54,60,57,59,57,47,43],                                              weekly: [59,68,61,63,53,52,47],                monthly: [55,66,61] },
  'Attr Installs':    { type: 'integer',    daily: [95,115,200,155,108,48,40,46,118,132,118,130,124,98,38,36,56,98,86,94,86,42,12],                                      weekly: [98,168,115,130,72,66,44],             monthly: [2400,3800,3250] },
  'CPI':              { type: 'currency',   daily: [2.10,1.85,1.20,1.55,1.95,3.20,3.80,3.50,2.05,1.75,2.10,1.90,2.00,2.45,3.85,4.10,3.40,2.35,2.55,2.30,2.60,4.80,6.90], weekly: [2.20,1.60,2.40,2.10,3.50,3.80,5.20],   monthly: [2.40,1.95,2.20] },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function normalize(values) {
  const min = Math.min(...values)
  const max = Math.max(...values)
  if (max === min) return values.map(() => 50)
  return values.map((v) => ((v - min) / (max - min)) * 90 + 5)
}

const RANGE_RATIO_THRESHOLD = 50

function rangesIncompatible(selected, period) {
  const maxValues = selected.map(({ label }) =>
    Math.max(...(METRIC_CONFIG[label]?.[period] ?? [0]))
  )
  const highest = Math.max(...maxValues)
  const lowest  = Math.min(...maxValues)
  return lowest > 0 && highest / lowest > RANGE_RATIO_THRESHOLD
}

// Tooltip display value
function formatValue(value, type) {
  if (type === 'percentage') return value.toFixed(1) + '%'
  if (type === 'currency') {
    if (value >= 1000) return '$' + value.toLocaleString('en-US', { maximumFractionDigits: 0 })
    return '$' + value.toFixed(2)
  }
  return Math.round(value).toLocaleString()
}

// Y-axis tick label value
function formatAxisTick(value, type) {
  if (type === 'percentage') return value.toFixed(0) + '%'
  if (type === 'currency') {
    if (value >= 1000000) return '$' + (value / 1000000).toFixed(1) + 'M'
    if (value >= 1000)    return '$' + (value / 1000).toFixed(0) + 'k'
    if (value >= 10)      return '$' + value.toFixed(0)
    return '$' + value.toFixed(2)
  }
  if (value >= 1000) return (value / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  return value.toFixed(0)
}

// ─── Chart config builder ─────────────────────────────────────────────────────
function buildConfig(selected, period) {
  const uniqueTypes = [...new Set(selected.map((s) => METRIC_CONFIG[s.label]?.type).filter(Boolean))]
  const typeCount   = uniqueTypes.length

  // ── >2 data types → normalize, hide Y axis ──────────────────────────────
  if (typeCount > 2) {
    return {
      mode: 'normalized',
      series: selected.map(({ label, color }) => ({
        name: label, color,
        data: normalize(METRIC_CONFIG[label]?.[period] ?? []),
      })),
      yAxis: [{
        title: { text: null },
        min: 0, max: 100,
        tickAmount: 5,
        labels: { enabled: false },
        gridLineColor: '#f3f4f6',
      }],
    }
  }

  // ── Exactly 2 data types → dual axis, no normalization ──────────────────
  if (typeCount === 2) {
    // Axis placement rules:
    //   integer    → always left  (priority 0)
    //   currency   → fills remaining slot (priority 1)
    //   percentage → always right (priority 2)
    const AXIS_PRIORITY = { integer: 0, currency: 1, percentage: 2 }
    const orderedTypes = [...uniqueTypes].sort((a, b) => AXIS_PRIORITY[a] - AXIS_PRIORITY[b])

    // If metrics sharing the same axis are range-incompatible, normalize everything
    const anyAxisIncompatible = orderedTypes.some((type) => {
      const metricsOfType = selected.filter((s) => METRIC_CONFIG[s.label]?.type === type)
      return rangesIncompatible(metricsOfType, period)
    })
    if (anyAxisIncompatible) {
      return {
        mode: 'normalized',
        series: selected.map(({ label, color }) => ({
          name: label, color,
          data: normalize(METRIC_CONFIG[label]?.[period] ?? []),
        })),
        yAxis: [{ title: { text: null }, min: 0, max: 100, tickAmount: 5, labels: { enabled: false }, gridLineColor: '#f3f4f6' }],
      }
    }

    return {
      mode: 'dual',
      series: selected.map(({ label, color }) => ({
        name: label, color,
        data: METRIC_CONFIG[label]?.[period] ?? [],
        yAxis: orderedTypes.indexOf(METRIC_CONFIG[label]?.type),
      })),
      yAxis: orderedTypes.map((type, i) => ({
        title: { text: null },
        opposite: i === 1,
        min: 0,
        tickAmount: 5,
        labels: {
          style: { color: '#9ca3af', fontSize: '12px' },
          formatter() { return formatAxisTick(this.value, type) },
        },
        gridLineColor: i === 0 ? '#f3f4f6' : 'transparent',
      })),
    }
  }

  // ── 1 data type (or no selection) → single axis, no normalization ────────
  // Exception: same-type series with incompatible magnitudes fall back to normalization.
  if (typeCount === 1 && rangesIncompatible(selected, period)) {
    return {
      mode: 'normalized',
      series: selected.map(({ label, color }) => ({
        name: label, color,
        data: normalize(METRIC_CONFIG[label]?.[period] ?? []),
      })),
      yAxis: [{
        title: { text: null },
        min: 0, max: 100,
        tickAmount: 5,
        labels: { enabled: false },
        gridLineColor: '#f3f4f6',
      }],
    }
  }

  const type = uniqueTypes[0] ?? 'integer'
  return {
    mode: 'single',
    series: selected.map(({ label, color }) => ({
      name: label, color,
      data: METRIC_CONFIG[label]?.[period] ?? [],
    })),
    yAxis: [{
      title: { text: null },
      min: 0,
      tickAmount: 5,
      labels: {
        style: { color: '#9ca3af', fontSize: '12px' },
        formatter() { return formatAxisTick(this.value, type) },
      },
      gridLineColor: '#f3f4f6',
    }],
  }
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function DownloadChart({ selected }) {
  const [period, setPeriod] = useState('daily')

  const cats = period === 'weekly' ? weeklyCats : period === 'monthly' ? monthlyCats : dailyCats
  const { mode, series, yAxis } = buildConfig(selected, period)

  // Key forces a clean Highcharts remount whenever mode, selection, or period changes
  const chartKey = mode + '-' + period + '-' + selected.map((s) => s.label).join(',')

  const options = {
    chart: {
      type: 'spline',
      backgroundColor: '#ffffff',
      style: { fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif" },
      height: 320,
      marginTop: 30,
      marginBottom: 50,
      animation: { duration: 300 },
    },
    title:   { text: null },
    credits: { enabled: false },
    legend:  { enabled: false },
    xAxis: {
      categories: cats,
      labels: {
        style: { color: '#9ca3af', fontSize: '12px' },
        step: period === 'daily' ? 2 : 1,
      },
      lineColor: '#e5e7eb',
      tickColor: 'transparent',
      gridLineColor: 'transparent',
    },
    yAxis,
    tooltip: {
      shared: true,
      backgroundColor: '#1f2937',
      borderColor: 'transparent',
      borderRadius: 8,
      style: { color: '#f9fafb', fontSize: '12px' },
      formatter() {
        const rows = this.points.map((p) => {
          const cfg    = METRIC_CONFIG[p.series.name]
          const rawVal = mode === 'normalized'
            ? (cfg?.[period]?.[p.point.index] ?? p.y)
            : p.y
          return `<span style="color:${p.color}">●</span> <b>${p.series.name}:</b> ${formatValue(rawVal, cfg?.type)}`
        }).join('<br/>')
        return `<b>${this.x}</b><br/>${rows}`
      },
    },
    plotOptions: {
      spline: {
        lineWidth: 2,
        marker: { enabled: false, symbol: 'circle', radius: 4, states: { hover: { enabled: true } } },
        states: { hover: { lineWidth: 2.5 } },
      },
    },
    series,
  }

  return (
    <div className="bg-white border border-gray-100 rounded-sm p-4 pt-5">
      <div className="flex justify-end mb-2">
        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
          {['daily', 'weekly', 'monthly'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 text-sm transition-colors ${
                period === p
                  ? 'font-semibold text-gray-900 bg-white'
                  : 'text-gray-400 font-normal hover:text-gray-600'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <HighchartsReact key={chartKey} highcharts={Highcharts} options={options} />
    </div>
  )
}
