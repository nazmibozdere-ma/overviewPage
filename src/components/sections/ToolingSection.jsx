import { ArrowRight, BarChart2, Search } from 'lucide-react'

// ── Shared card shell ─────────────────────────────────────────────────────────
function ToolCard({ icon: Icon, iconColor, iconBg, title, children, linkLabel }) {
  return (
    <div
      className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-3"
      style={{ boxShadow: '0 1px 4px 0 rgba(0,0,0,0.06)' }}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: iconBg }}
        >
          <Icon size={14} style={{ color: iconColor }} />
        </div>
        <span className="text-sm font-semibold" style={{ color: '#111827' }}>{title}</span>
      </div>

      <div className="flex-1">{children}</div>

      <div className="pt-2" style={{ borderTop: '1px solid #f3f4f6' }}>
        <button
          className="inline-flex items-center gap-1 text-xs font-medium hover:underline transition-colors"
          style={{ color: '#4B7BF5' }}
        >
          {linkLabel}
          <ArrowRight size={11} />
        </button>
      </div>
    </div>
  )
}

// ── Benchmarks card ───────────────────────────────────────────────────────────
function BenchmarksCard() {
  return (
    <ToolCard
      icon={BarChart2}
      iconColor="#f59e0b"
      iconBg="#fef3c7"
      title="Benchmarks"
      linkLabel="Explore Category Benchmarks"
    >
      <p className="text-xs leading-relaxed" style={{ color: '#6b7280' }}>
        Check the category benchmarks to understand how other apps in your category are performing.
      </p>
    </ToolCard>
  )
}

// ── Keyword Planner placeholder ───────────────────────────────────────────────
function KeywordPlannerCard() {
  return (
    <ToolCard
      icon={Search}
      iconColor="#8b5cf6"
      iconBg="#f5f3ff"
      title="Keyword Planner"
      linkLabel="Discover New Keywords"
    >
      <p className="text-xs leading-relaxed" style={{ color: '#6b7280' }}>
        Discover new keyword opportunities and estimate traffic volume before adding them to your campaigns.
      </p>
    </ToolCard>
  )
}

// ── Section ───────────────────────────────────────────────────────────────────
export default function ToolingSection({ app }) {
  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
      <BenchmarksCard />
      <KeywordPlannerCard />
    </div>
  )
}
