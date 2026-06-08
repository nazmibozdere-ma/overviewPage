import {
  LayoutGrid,
  Home,
  GitFork,
  FlaskConical,
  Lightbulb,
  Zap,
  Wallet,
  BarChart2,
  MessageSquare,
  Gavel,
  Smartphone,
  Search,
  LineChart,
  PanelLeftClose,
  PanelLeftOpen,
  Lock,
  Rocket,
} from 'lucide-react'

const NAV_SECTIONS = [
  {
    title: null,
    items: [
      { label: 'Overview', icon: Home, locked: false, active: false },
      { label: 'Ads Manager', icon: LayoutGrid, locked: false, active: false },
      { label: 'Automations', icon: GitFork, locked: false, active: false },
      { label: 'CPP A/B Testing', icon: FlaskConical, locked: true, active: false },
    ],
  },
  {
    title: 'CO-PILOT',
    items: [
      { label: 'Keyword Advisor', icon: Lightbulb, locked: true, active: false },
      { label: 'Smart Bidding', icon: Zap, locked: true, active: false },
      { label: 'Budget Allocation', icon: Wallet, locked: true, active: false },
    ],
  },
  {
    title: 'INSIGHTS CENTER',
    items: [
      { label: 'Benchmarks', icon: BarChart2, locked: true, active: false },
      { label: 'Recommendations', icon: MessageSquare, locked: true, active: false },
    ],
  },
  {
    title: 'COMPETITION ANALYSIS',
    items: [
      { label: 'Keyword Auction Insights', icon: Gavel, locked: true, active: false },
      { label: 'CPP Intelligence', icon: Smartphone, locked: false, active: false },
      { label: 'Organic Keyword Hunt', icon: Search, locked: true, active: false },
    ],
  },
  {
    title: 'MOBILE MEASUREMENT PARTNER',
    items: [
      { label: 'Attributions', icon: LineChart, locked: false, active: false },
    ],
  },
]

export default function Sidebar({ collapsed, onToggle, activePage, onNavigate }) {
  return (
    <div
      className="flex flex-col h-screen flex-shrink-0 transition-all duration-300 overflow-hidden"
      style={{
        width: collapsed ? '68px' : '260px',
        backgroundColor: '#0d1526',
      }}
    >
      {/* Logo row */}
      <div className="flex items-center justify-between px-4 pt-5 pb-4 flex-shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Rocket size={22} style={{ color: '#7b9cff' }} />
            <div className="leading-tight">
              <div className="font-bold text-white text-base tracking-tight">SearchAds.com</div>
              <div className="text-xs" style={{ color: '#6b7db3' }}>by MobileAction</div>
            </div>
          </div>
        )}
        {collapsed && <Rocket size={22} style={{ color: '#7b9cff' }} className="mx-auto" />}
        <button
          onClick={onToggle}
          className="flex items-center justify-center rounded-md p-1 transition-colors"
          style={{ color: '#6b7db3' }}
          onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
          onMouseLeave={e => e.currentTarget.style.color = '#6b7db3'}
        >
          {collapsed
            ? <PanelLeftOpen size={18} />
            : <PanelLeftClose size={18} />
          }
        </button>
      </div>

      {/* Switch button */}
      {!collapsed && (
        <div className="px-3 pb-4 flex-shrink-0">
          <div
            className="w-full text-center text-sm font-semibold py-2.5 rounded-lg"
            style={{ backgroundColor: '#1a2a4a', color: '#a0b4d6' }}
          >
            Switch to ASO Intelligence
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 pb-4" style={{ scrollbarWidth: 'none' }}>
        {NAV_SECTIONS.map((section, si) => (
          <div key={si} className={si > 0 ? 'mt-5' : ''}>
            {/* Section title */}
            {section.title && !collapsed && (
              <div
                className="text-xs font-semibold tracking-widest px-3 mb-2"
                style={{ color: '#4a5a7a' }}
              >
                {section.title}
              </div>
            )}
            {/* Items */}
            {section.items.map((item) => {
              const Icon = item.icon
              const isActive = activePage === item.label
              const isClickable = !item.locked && (item.label === 'Overview' || item.label === 'Ads Manager')
              return (
                <div
                  key={item.label}
                  onClick={() => isClickable && onNavigate && onNavigate(item.label)}
                  className="flex items-center gap-3 rounded-lg mb-0.5 relative"
                  style={{
                    padding: collapsed ? '10px 0' : '10px 12px',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    backgroundColor: isActive ? '#1a2d50' : 'transparent',
                    borderLeft: isActive ? '3px solid #ffffff' : '3px solid transparent',
                    borderRadius: isActive ? '0 8px 8px 0' : '8px',
                    cursor: isClickable ? 'pointer' : 'default',
                  }}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon
                    size={18}
                    style={{ color: isActive ? '#ffffff' : '#5a7099', flexShrink: 0 }}
                  />
                  {!collapsed && (
                    <>
                      <span
                        className="text-sm font-medium flex-1"
                        style={{ color: isActive ? '#ffffff' : '#8fa5cc' }}
                      >
                        {item.label}
                      </span>
                      {item.locked && (
                        <Lock size={13} style={{ color: '#4a5a7a' }} />
                      )}
                    </>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </nav>
    </div>
  )
}
