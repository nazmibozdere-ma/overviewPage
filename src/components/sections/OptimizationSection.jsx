import { ArrowRight, Zap, GitFork, FlaskConical, Wallet } from 'lucide-react'

// ── Mock data per app ─────────────────────────────────────────────────────────
const OPTIMIZATION_DATA = {
  'Square Point of Sale (POS)': {
    smartBidding: {
      total:         7,
      active:        3,
      paused:        2,
      spendImpacted: 31600,
    },
    automations: {
      total:        8,
      active:       5,
      paused:       1,
      actionsTaken: 128,
    },
    cppTesting: {
      total:         6,
      active:        2,
      completed:     3,
      spendImpacted: 48200,
    },
    budgetAllocation: {
      total:              5,
      active:             3,
      campaignsAffected:  8,
      utilizationRatio:   73,
    },
  },
  'Cash App': {
    smartBidding: {
      total:         2,
      active:        0,
      paused:        0,
      spendImpacted: 0,
    },
    automations: {
      total:        3,
      active:       2,
      paused:       0,
      actionsTaken: 47,
    },
    cppTesting: {
      total:         2,
      active:        0,
      completed:     1,
      spendImpacted: 18600,
    },
    budgetAllocation: {
      total:             2,
      active:            1,
      campaignsAffected: 2,
      utilizationRatio:  58,
    },
  },
}

// ── Shared primitives ─────────────────────────────────────────────────────────

function CardShell({ icon: Icon, iconColor, iconBg, title, children }) {
  return (
    <div
      className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-3"
      style={{ boxShadow: '0 1px 4px 0 rgba(0,0,0,0.06)' }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: iconBg }}
          >
            <Icon size={14} style={{ color: iconColor }} />
          </div>
          <span className="text-sm font-semibold" style={{ color: '#111827' }}>{title}</span>
        </div>
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{ backgroundColor: '#f3f4f6', color: '#6b7280' }}
        >
          Last 30 Days
        </span>
      </div>
      {children}
    </div>
  )
}

// Uniform status row used by all four cards
function StatusRow({ total, primary, secondary }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {total != null && (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
          style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#3b82f6' }} />
          {total} Total
        </span>
      )}
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
        style={{ backgroundColor: '#dcfce7', color: '#15803d' }}
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#16a34a' }} />
        {primary.value} {primary.label}
      </span>
      {secondary && (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
          style={{ backgroundColor: '#f3f4f6', color: '#6b7280' }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#9ca3af' }} />
          {secondary.value} {secondary.label}
        </span>
      )}
    </div>
  )
}

// Prominent KPI stat — separated from status row
function KpiStat({ label, value, sub }) {
  return (
    <div className="pt-3 mt-1" style={{ borderTop: '1px solid #f3f4f6' }}>
      <div className="text-xs font-medium mb-1" style={{ color: '#6b7280' }}>{label}</div>
      <div className="text-2xl font-bold tracking-tight" style={{ color: '#111827' }}>{value}</div>
      {sub && <div className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>{sub}</div>}
    </div>
  )
}


function NavButton({ label }) {
  return (
    <button
      className="self-start inline-flex items-center gap-1 text-xs font-medium mt-auto"
      style={{ color: '#4B7BF5' }}
    >
      {label}
      <ArrowRight size={11} />
    </button>
  )
}

// ── Empty-state card (No Optimization) ───────────────────────────────────────

const EMPTY_DESCRIPTIONS = {
  'Smart Bidding':    'Optimize bids across all your keywords toward your strategy.',
  'Automations':      'Define your rules and let your campaigns run without daily manual work.',
  'Budget Allocation':'Move idle budget to your best performing campaigns and drive more value from your total spend.',
  'CPP A/B Testing':  'Test your creative alternatives and find the winning variant for your ads.',
}

function EmptyOptCard({ icon: Icon, iconColor, iconBg, title, navLabel }) {
  return (
    <CardShell icon={Icon} iconColor={iconColor} iconBg={iconBg} title={title}>
      <p className="text-xs leading-relaxed flex-1" style={{ color: '#6b7280' }}>
        {EMPTY_DESCRIPTIONS[title]}
      </p>
      <NavButton label={navLabel} />
    </CardShell>
  )
}

// ── Individual cards ──────────────────────────────────────────────────────────

function SmartBiddingCard({ data }) {
  return (
    <CardShell icon={Zap} iconColor="#f59e0b" iconBg="#fef3c7" title="Smart Bidding">
      <StatusRow
        total={data.total}
        primary={{ label: 'Active', value: data.active }}
        secondary={{ label: 'Paused', value: data.paused }}
      />
      <KpiStat
        label="Spend Impacted"
        value={`$${data.spendImpacted.toLocaleString()}`}
      />
      <NavButton label="Go to Smart Bidding" />
    </CardShell>
  )
}

function AutomationsCard({ data }) {
  return (
    <CardShell icon={GitFork} iconColor="#8b5cf6" iconBg="#f5f3ff" title="Automations">
      <StatusRow
        total={data.total}
        primary={{ label: 'Active', value: data.active }}
        secondary={{ label: 'Paused', value: data.paused }}
      />
      <KpiStat
        label="Successful Actions Taken"
        value={data.actionsTaken.toLocaleString()}
      />
      <NavButton label="Go to Automations" />
    </CardShell>
  )
}

function CppTestingCard({ data }) {
  return (
    <CardShell icon={FlaskConical} iconColor="#06b6d4" iconBg="#ecfeff" title="CPP A/B Testing">
      <StatusRow
        total={data.total}
        primary={{ label: 'Active', value: data.active }}
        secondary={{ label: 'Completed', value: data.completed }}
      />
      <KpiStat
        label="Spend Impacted"
        value={`$${data.spendImpacted.toLocaleString()}`}
      />
      <NavButton label="Go to CPP A/B Testing" />
    </CardShell>
  )
}

function BudgetAllocationCard({ data }) {
  return (
    <CardShell icon={Wallet} iconColor="#10b981" iconBg="#d1fae5" title="Budget Allocation">
      <StatusRow
        total={data.total}
        primary={{ label: 'Active', value: data.active }}
        secondary={{ label: 'Campaigns Affected', value: data.campaignsAffected }}
      />
      <KpiStat
        label="Budget Utilization Ratio"
        value={`${data.utilizationRatio}%`}
      />
      <NavButton label="Go to Budget Allocation" />
    </CardShell>
  )
}

// ── Section ───────────────────────────────────────────────────────────────────
export default function OptimizationSection({ app, integrationState }) {
  const data = OPTIMIZATION_DATA[app] || OPTIMIZATION_DATA['Square Point of Sale (POS)']

  if (integrationState === 'no-optimization') {
    return (
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
        <EmptyOptCard icon={Zap}          iconColor="#f59e0b" iconBg="#fef3c7" title="Smart Bidding"    navLabel="Go to Smart Bidding"    />
        <EmptyOptCard icon={GitFork}      iconColor="#8b5cf6" iconBg="#f5f3ff" title="Automations"      navLabel="Go to Automations"      />
        <EmptyOptCard icon={FlaskConical} iconColor="#06b6d4" iconBg="#ecfeff" title="CPP A/B Testing"  navLabel="Go to CPP A/B Testing"  />
        <EmptyOptCard icon={Wallet}       iconColor="#10b981" iconBg="#d1fae5" title="Budget Allocation" navLabel="Go to Budget Allocation" />
      </div>
    )
  }

  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
      <SmartBiddingCard     data={data.smartBidding}     />
      <AutomationsCard      data={data.automations}      />
      <CppTestingCard       data={data.cppTesting}       />
      <BudgetAllocationCard data={data.budgetAllocation} />
    </div>
  )
}
