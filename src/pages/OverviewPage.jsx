import { useState, useMemo, useEffect } from 'react'
import { ArrowRight, Star, AlertTriangle } from 'lucide-react'
import OverviewFilterBar, { APP_GOALS } from '../components/OverviewFilterBar'
import OverviewMetricCard from '../components/OverviewMetricCard'
import StorefrontReport from '../components/reports/StorefrontReport'
import CampaignReport from '../components/reports/CampaignReport'
import TopSpenderTable from '../components/reports/TopSpenderTable'
import OptimizationSection from '../components/sections/OptimizationSection'
import ToolingSection from '../components/sections/ToolingSection'
import { isSameDay, PRESETS } from '../components/DateRangePicker'

// ── App-specific metrics per preset ─────────────────────────────────────────
// Format: { Metric: [current, previous] }
// Taps always > Installs. Mix of increases (+) and decreases (-) for variety.

const APP_PRESET_DATA = {
  'Square Point of Sale (POS)': {
    'Last 7 Days':  { Spend: [4820,  5100],  Impressions: [26900,  28200],  Taps: [1843,  1950],  Installs: [1180,  1290]  }, // ↓ all
    'Last 14 Days': { Spend: [9640,  10200], Impressions: [53800,  56400],  Taps: [3686,  3870],  Installs: [2380,  2560]  }, // ↓ all
    'Last 28 Days': { Spend: [20100, 18400], Impressions: [112300, 104800], Taps: [7680,  7140],  Installs: [4920,  4580]  }, // ↑ all
  },
  'Cash App': {
    'Last 7 Days':  { Spend: [6240,  5890],  Impressions: [38200,  35700],  Taps: [2310,  2190],  Installs: [1380,  1310]  }, // ↑ all
    'Last 14 Days': { Spend: [12480, 13200], Impressions: [76400,  80600],  Taps: [4620,  4880],  Installs: [2760,  2920]  }, // ↓ all
    'Last 28 Days': { Spend: [24960, 22800], Impressions: [152800, 140200], Taps: [9240,  8490],  Installs: [5530,  5080]  }, // ↑ all
  },
  'Mock App': {
    'Last 7 Days':  { Spend: [3180,  2940],  Impressions: [19400,  17800],  Taps: [1120,  1040],  Installs: [680,   620]   }, // ↑ all
    'Last 14 Days': { Spend: [6360,  6820],  Impressions: [38800,  41600],  Taps: [2240,  2390],  Installs: [1360,  1450]  }, // ↓ all
    'Last 28 Days': { Spend: [12720, 11200], Impressions: [77600,  68400],  Taps: [4480,  3960],  Installs: [2720,  2400]  }, // ↑ all
  },
}

// ── Goal configs ─────────────────────────────────────────────────────────────
// rate: Goals = round(Installs * rate)
// roasTrend: [current_roas, previous_roas]
const GOAL_CONFIGS = {
  'Purchase':        { rate: 0.32, roasTrend: [4.2, 3.8] },  // ↑ ROAS
  'Sign Up':         { rate: 0.48, roasTrend: [3.1, 3.4] },  // ↓ ROAS
  'Subscription':    { rate: 0.16, roasTrend: [6.8, 6.2] },  // ↑ ROAS
  'Send Money':      { rate: 0.55, roasTrend: [2.9, 2.7] },  // ↑ ROAS
  'Card Activation': { rate: 0.72, roasTrend: [2.1, 2.4] },  // ↓ ROAS
  'Direct Deposit':  { rate: 0.28, roasTrend: [5.4, 4.9] },  // ↑ ROAS
}

// ── Computed fallback for custom date ranges ──────────────────────────────────
// Monthly seasonality index (Jan=0 .. Dec=11)
const MONTHLY_FACTOR = [0.75, 0.80, 0.88, 0.95, 1.05, 1.10, 1.08, 1.02, 0.98, 1.05, 0.90, 0.72]

// Daily base rates per app (derived from Last 3 Months / 90 days)
const DAILY_RATES = {
  'Square Point of Sale (POS)': { Spend: 537, Impressions: 2990, Taps: 205, Installs: 134 },
  'Cash App':                   { Spend: 694, Impressions: 4269, Taps: 258, Installs: 154 },
  'Mock App':                   { Spend: 354, Impressions: 2180, Taps: 158, Installs: 96  },
}

function avgMonthlyFactor(start, end) {
  const durationMs = end.getTime() - start.getTime()
  if (durationMs <= 0) return 1
  // Sample ~20 evenly spaced points instead of iterating every day
  const steps = 20
  let sum = 0
  for (let i = 0; i <= steps; i++) {
    const t = new Date(start.getTime() + (durationMs * i) / steps)
    sum += MONTHLY_FACTOR[t.getMonth()]
  }
  return sum / (steps + 1)
}

function computeFromDates(start, end, app) {
  const rates = DAILY_RATES[app] || DAILY_RATES['Square Point of Sale (POS)']
  const durationDays = Math.round((end.getTime() - start.getTime()) / 86400000) + 1
  const curFactor = avgMonthlyFactor(start, end)

  const prevEnd   = new Date(start.getTime() - 86400000)
  const prevStart = new Date(prevEnd.getTime() - (end.getTime() - start.getTime()))
  const prevFactor = avgMonthlyFactor(prevStart, prevEnd)

  const scale = (rate, factor) => Math.round(rate * durationDays * factor)

  return {
    Spend:       [scale(rates.Spend,       curFactor),  scale(rates.Spend,       prevFactor)],
    Impressions: [scale(rates.Impressions, curFactor),  scale(rates.Impressions, prevFactor)],
    Taps:        [scale(rates.Taps,        curFactor),  scale(rates.Taps,        prevFactor)],
    Installs:    [scale(rates.Installs,    curFactor),  scale(rates.Installs,    prevFactor)],
  }
}

// ── Data resolver ─────────────────────────────────────────────────────────────
function resolveData(dateRange, app, goal) {
  const preset = PRESETS.find(
    (p) => isSameDay(p.start, dateRange.start) && isSameDay(p.end, dateRange.end)
  )

  const raw =
    preset && APP_PRESET_DATA[app]?.[preset.label]
      ? APP_PRESET_DATA[app][preset.label]
      : computeFromDates(dateRange.start, dateRange.end, app)

  const [instCur, instPrev] = raw.Installs
  const cfg = GOAL_CONFIGS[goal] || GOAL_CONFIGS['Purchase']
  const [roasCur, roasPrev] = cfg.roasTrend

  return {
    Spend:       { cur: raw.Spend[0],       prev: raw.Spend[1] },
    Impressions: { cur: raw.Impressions[0], prev: raw.Impressions[1] },
    Taps:        { cur: raw.Taps[0],        prev: raw.Taps[1] },
    Installs:    { cur: instCur,             prev: instPrev },
    Goals:       { cur: Math.round(instCur  * cfg.rate), prev: Math.round(instPrev * cfg.rate) },
    'Goal ROAS': { cur: roasCur,             prev: roasPrev },
  }
}

// ── Section label ─────────────────────────────────────────────────────────────
function SectionLabel({ title }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#9ca3af' }}>
        {title}
      </span>
      <div className="flex-1 h-px" style={{ backgroundColor: '#e5e7eb' }} />
    </div>
  )
}

// ── Metric display config ─────────────────────────────────────────────────────
const METRICS = [
  { label: 'Spend',       format: (v) => `$${v.toLocaleString()}` },
  { label: 'Impressions', format: (v) => v.toLocaleString() },
  { label: 'Taps',        format: (v) => v.toLocaleString() },
  { label: 'Installs',    format: (v) => v.toLocaleString() },
  { label: 'Goals',       format: (v) => v.toLocaleString() },
]

// ── Attribution partner data ──────────────────────────────────────────────────
const MMP_PARTNERS = {
  'Square Point of Sale (POS)': { name: 'AppsFlyer', bg: '#FF6B00', color: '#ffffff', initials: 'AF' },
  'Cash App':                   { name: 'Adjust',    bg: '#EB1E28', color: '#ffffff', initials: 'Adj' },
  'Afterpay':                   { name: 'Branch',    bg: '#5C35D5', color: '#ffffff', initials: 'Br' },
  'Mock App':                   { name: 'Kochava',   bg: '#1a1a2e', color: '#ffffff', initials: 'Ko' },
}

const APP_ICON = {
  'Square Point of Sale (POS)': (
    <span className="inline-flex w-5 h-5 rounded-md items-center justify-center flex-shrink-0" style={{ backgroundColor: '#1a1a1a', verticalAlign: 'middle' }}>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <rect x="1" y="1" width="8" height="8" rx="1.5" stroke="white" strokeWidth="1" fill="none"/>
        <rect x="3" y="3" width="4" height="4" rx="0.5" stroke="white" strokeWidth="1" fill="none"/>
      </svg>
    </span>
  ),
  'Cash App': (
    <span className="inline-flex w-5 h-5 rounded-md items-center justify-center flex-shrink-0 text-white font-bold" style={{ backgroundColor: '#00D632', fontSize: 11, verticalAlign: 'middle' }}>$</span>
  ),
  'Afterpay': (
    <span className="inline-flex w-5 h-5 rounded-md items-center justify-center flex-shrink-0 font-bold text-black" style={{ backgroundColor: '#B2FCE4', fontSize: 10, verticalAlign: 'middle' }}>A</span>
  ),
  'Mock App': (
    <span className="inline-flex w-5 h-5 rounded-md items-center justify-center flex-shrink-0 text-white font-bold" style={{ backgroundColor: '#6366f1', fontSize: 10, verticalAlign: 'middle' }}>M</span>
  ),
}

function GoalCountTooltip({ goals }) {
  const [visible, setVisible] = useState(false)
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <span className="font-semibold underline decoration-dotted cursor-default" style={{ color: '#111827' }}>
        {goals.length} goal{goals.length !== 1 ? 's' : ''}
      </span>
      {visible && (
        <span
          className="absolute z-50 rounded-xl pointer-events-none"
          style={{
            backgroundColor: '#1f2937',
            color: '#f9fafb',
            padding: '8px 12px',
            top: 'calc(100% + 6px)',
            left: '50%',
            transform: 'translateX(-50%)',
            minWidth: 140,
            fontSize: 12,
            lineHeight: 1.6,
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            whiteSpace: 'nowrap',
          }}
        >
          <span
            className="absolute"
            style={{
              bottom: '100%', left: '50%', transform: 'translateX(-50%)',
              borderWidth: 5, borderStyle: 'solid',
              borderColor: 'transparent transparent #1f2937 transparent',
            }}
          />
          {goals.map((g) => <span key={g} style={{ display: 'block' }}>{g}</span>)}
        </span>
      )}
    </span>
  )
}

function AttributionPartnerCard({ selectedApp, appGoals, integrationState }) {
  const [warned, setWarned] = useState(false)
  const partner = MMP_PARTNERS[selectedApp] || MMP_PARTNERS['Square Point of Sale (POS)']
  const appleOnly = integrationState === 'apple-only'

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-3"
      style={{ boxShadow: '0 1px 4px 0 rgba(0,0,0,0.06)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: '#f3f4f6' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1.5" y="1.5" width="4" height="4" rx="1" stroke="#6b7280" strokeWidth="1.2"/>
              <rect x="8.5" y="1.5" width="4" height="4" rx="1" stroke="#6b7280" strokeWidth="1.2"/>
              <rect x="1.5" y="8.5" width="4" height="4" rx="1" stroke="#6b7280" strokeWidth="1.2"/>
              <path d="M10.5 8.5v5M8 11h5" stroke="#6b7280" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-sm font-semibold" style={{ color: '#111827' }}>MMP Integration</span>
        </div>
        <button
          onClick={() => setWarned((v) => !v)}
          className="flex items-center justify-center w-6 h-6 rounded-md transition-colors hover:bg-gray-100"
        >
          <Star
            size={14}
            style={{
              color: warned ? '#f59e0b' : '#d1d5db',
              fill:  warned ? '#f59e0b' : 'none',
              transition: 'all 0.15s',
            }}
          />
        </button>
      </div>

      {appleOnly ? (
        /* ── Apple-only: no partner integrated ── */
        <>
          <p className="text-sm leading-loose" style={{ color: '#374151' }}>
            For your{' '}
            <span className="inline-flex items-center gap-1 mx-1" style={{ verticalAlign: 'middle' }}>
              {APP_ICON[selectedApp]}
              <span className="font-semibold" style={{ color: '#111827' }}>{selectedApp}</span>
            </span>{' '}
            app, there is no MMP integrated.
          </p>
          <button
            className="self-start inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
            style={{ backgroundColor: '#f0f4ff', color: '#4B7BF5' }}
          >
            Integrate now
            <ArrowRight size={12} />
          </button>
        </>
      ) : (
        /* ── Both integrated: normal content ── */
        <>
          <p className="text-sm leading-loose" style={{ color: '#374151' }}>
            For your{' '}
            <span className="inline-flex items-center gap-1 mx-1" style={{ verticalAlign: 'middle' }}>
              {APP_ICON[selectedApp]}
              <span className="font-semibold" style={{ color: '#111827' }}>{selectedApp}</span>
            </span>{' '}
            app,{' '}
            <span className="inline-flex items-center gap-1 mx-1" style={{ verticalAlign: 'middle' }}>
              <span
                className="inline-flex items-center justify-center rounded-md font-bold flex-shrink-0"
                style={{ width: 20, height: 20, backgroundColor: partner.bg, color: partner.color, fontSize: 9 }}
              >
                {partner.initials}
              </span>
              <span className="font-semibold" style={{ color: '#111827' }}>{partner.name}</span>
            </span>{' '}
            is integrated and{' '}
            <GoalCountTooltip goals={appGoals} />{' '}
            is created.{' '}
            {warned ? (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                style={{ backgroundColor: '#fef9c3', color: '#a16207', border: '1.5px solid #fde047', verticalAlign: 'middle' }}
              >
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                  <circle cx="5.5" cy="5.5" r="5" fill="#eab308"/>
                  <path d="M5.5 3.5v2.5" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
                  <circle cx="5.5" cy="7.5" r="0.6" fill="white"/>
                </svg>
                Warning
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                style={{ backgroundColor: '#dcfce7', color: '#15803d', border: '1.5px solid #86efac', verticalAlign: 'middle' }}
              >
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                  <circle cx="5.5" cy="5.5" r="5" fill="#22c55e"/>
                  <path d="M3 5.5l1.8 1.8L8 3.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Valid
              </span>
            )}
          </p>

          {warned && (
            <div
              className="flex items-start gap-2 px-3 py-2.5 rounded-lg"
              style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}
            >
              <AlertTriangle size={13} style={{ color: '#d97706', flexShrink: 0, marginTop: 1 }} />
              <p className="text-xs leading-relaxed" style={{ color: '#92400e' }}>
                No events have been received in the last 48 hours. Please check your MMP integration status.
              </p>
            </div>
          )}

          <div className="pt-2 mt-auto" style={{ borderTop: '1px solid #f3f4f6' }}>
            <button className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: '#4B7BF5' }}>
              See on Attributions page
              <ArrowRight size={11} />
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ── No-integration empty state ────────────────────────────────────────────────
const FEATURE_BULLETS = [
  { text: <>Save time with one-click <strong>bulk actions</strong></> },
  { text: <>Test CPPs smarter &amp; faster with <strong>CPP A/B Testing</strong></> },
  { text: <>Let <strong>AI Smart Bidding</strong> optimize your bidding strategy</> },
  { text: <>Maximize efficiency with automated <strong>Budget Allocation</strong></> },
  { text: <>Find high-intent <strong>keywords</strong> tailored to your app</> },
]

function NoIntegrationState() {
  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50">
      <div style={{ maxWidth: 540, padding: '0 24px' }}>

        {/* Title + squiggle */}
        <div className="mb-3">
          <h2 className="text-3xl font-bold tracking-tight" style={{ color: '#0f172a' }}>
            Unlock full Apple Ads potential
          </h2>
          <svg viewBox="0 0 340 12" fill="none" style={{ width: 340, marginTop: 4 }}>
            <path
              d="M2 9 C 40 2, 80 11, 120 5 S 200 2, 240 8 S 300 3, 338 7"
              stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" fill="none"
            />
          </svg>
        </div>

        {/* Subtitle */}
        <p className="text-base mb-6" style={{ color: '#6b7280', lineHeight: 1.6 }}>
          Connect your Apple Ads account to manage, measure, and optimize the entire user journey in one place.
        </p>

        {/* Bullets */}
        <ul className="flex flex-col gap-3 mb-4">
          {FEATURE_BULLETS.map((b, i) => (
            <li key={i} className="flex items-center gap-3 text-base" style={{ color: '#374151' }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
                <path d="M3 9.5l4 4 8-8" stroke="#4B7BF5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {b.text}
            </li>
          ))}
        </ul>

        <p className="text-base mb-8" style={{ color: '#374151' }}>and much more ...</p>

        {/* CTA button */}
        <button
          className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl text-base font-semibold"
          style={{ backgroundColor: '#0f172a', color: '#ffffff' }}
        >
          {/* Apple logo */}
          <svg width="18" height="18" viewBox="0 0 18 18" fill="white">
            <path d="M13.2 9.44c-.02-1.96 1.6-2.9 1.67-2.95-0.91-1.33-2.33-1.51-2.84-1.53-1.21-.12-2.37.71-2.98.71-.62 0-1.57-.7-2.58-.68-1.33.02-2.56.78-3.24 1.97-1.38 2.39-.35 5.94 1 7.88.66.96 1.45 2.03 2.49 1.99 1-.04 1.38-.65 2.59-.65 1.2 0 1.54.65 2.59.63 1.07-.02 1.75-1 2.41-1.96.76-1.12 1.07-2.21 1.08-2.27-.02-.01-2.07-.8-2.09-3.14zm-1.96-5.77c.55-.66.92-1.58.82-2.5-.79.03-1.75.53-2.32 1.18-.51.59-.96 1.53-.84 2.43.88.07 1.78-.45 2.34-1.11z"/>
          </svg>
          Integrate your Apple Ads Account
        </button>
      </div>
    </div>
  )
}

// ── Page component ────────────────────────────────────────────────────────────
export default function OverviewPage({ selectedApp, onAppChange, apps, campaignGroup, integrationState }) {
  const [dateRange, setDateRange] = useState({
    start:  PRESETS[0].start,
    end:    PRESETS[0].end,
    preset: PRESETS[0].label,
  })
  const [selectedGoal, setSelectedGoal] = useState(null)

  useEffect(() => {
    setSelectedGoal(null)
  }, [selectedApp])

  const handleDateChange = (start, end, preset) => {
    setDateRange({ start, end, preset })
  }

  const metricData = useMemo(
    () => resolveData(dateRange, selectedApp, selectedGoal),
    [dateRange, selectedApp, selectedGoal]
  )

  if (integrationState === 'none') {
    return <NoIntegrationState />
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden min-w-0">
      <OverviewFilterBar
        dateRange={dateRange}
        onDateChange={handleDateChange}
        apps={apps}
        selectedApp={selectedApp}
        onAppChange={onAppChange}
        selectedGoal={selectedGoal}
        onGoalChange={setSelectedGoal}
        integrationState={integrationState}
      />

      <div className="flex-1 overflow-y-auto bg-gray-50 p-5">
        <div className="space-y-3">

          {/* Metric summary cards */}
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' }}
          >
            {METRICS.map(({ label, format }) => {
              const displayLabel = label === 'Goals' ? (selectedGoal ? `Goals (${selectedGoal})` : 'Goals') : label
              const goalNoSelection = label === 'Goals' && !selectedGoal && integrationState !== 'apple-only'
              const goalAppleOnly   = label === 'Goals' && integrationState === 'apple-only'
              return (
                <OverviewMetricCard
                  key={label}
                  label={displayLabel}
                  data={metricData[label]}
                  format={format}
                  dateRange={dateRange}
                  isEmpty={goalAppleOnly || goalNoSelection}
                  emptyPrompt={goalNoSelection ? 'Please select a goal to display this metric.' : undefined}
                />
              )
            })}
          </div>

          {/* ── Ad Management ── */}
          <SectionLabel title="Ad Management" />
          <StorefrontReport app={selectedApp} metricData={metricData} integrationState={integrationState} />
          <div className="grid gap-3" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <CampaignReport app={selectedApp} />
            <TopSpenderTable app={selectedApp} />
          </div>

          {/* ── Optimization ── */}
          <SectionLabel title="Optimization" />
          <OptimizationSection
            app={selectedApp}
            integrationState={integrationState}
            preset={dateRange.preset}
          />

          {/* ── Tooling ── */}
          <SectionLabel title="Tooling" />
          <ToolingSection app={selectedApp} />

          {/* ── Integrations ── */}
          <SectionLabel title="Integrations" />
          <div className="flex flex-col gap-3">
            {/* Apple Ads Integration */}
            <div
              className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-3"
              style={{ boxShadow: '0 1px 4px 0 rgba(0,0,0,0.06)' }}
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#f3f4f6' }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 1.5C4 1.5 1.5 4 1.5 7S4 12.5 7 12.5 12.5 10 12.5 7 10 1.5 7 1.5z" stroke="#6b7280" strokeWidth="1.2" fill="none"/>
                    <path d="M7 4v3.5l2 2" stroke="#6b7280" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                </div>
                <span className="text-sm font-semibold" style={{ color: '#111827' }}>Apple Ads Integration</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
                Your campaign group{' '}
                <span className="font-semibold" style={{ color: '#111827' }}>
                  {campaignGroup?.name}
                </span>{' '}
                is integrated on{' '}
                <span className="font-semibold" style={{ color: '#111827' }}>
                  {campaignGroup?.integrationDate}
                </span>.{' '}
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: '#dcfce7', color: '#15803d', border: '1.5px solid #86efac', verticalAlign: 'middle' }}
                >
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                    <circle cx="5.5" cy="5.5" r="5" fill="#22c55e"/>
                    <path d="M3 5.5l1.8 1.8L8 3.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Valid
                </span>
              </p>
              <div className="pt-2" style={{ borderTop: '1px solid #f3f4f6' }}>
                <button
                  className="inline-flex items-center gap-1 text-xs font-medium"
                  style={{ color: '#4B7BF5' }}
                >
                  See on Integrations page
                  <ArrowRight size={11} />
                </button>
              </div>
            </div>

            {/* Attribution Partner */}
            <AttributionPartnerCard
              selectedApp={selectedApp}
              appGoals={APP_GOALS[selectedApp] || []}
              integrationState={integrationState}
            />
          </div>

        </div>
      </div>
    </div>
  )
}
