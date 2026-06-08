import { useState } from 'react'
import MetricCard from './components/MetricCard'
import DownloadChart from './components/DownloadChart'
import Sidebar from './components/Sidebar'
import Header, { CAMPAIGN_GROUPS } from './components/Header'
import OverviewPage from './pages/OverviewPage'

const COLORS = ['#4B7BF5', '#7B6CF6', '#F5A623', '#4CAF7D']

// All possible metric display values (including swappable ones like CPI)
const ALL_METRIC_VALUES = {
  'Impressions':      '269,153',
  'Taps':             '18,432',
  'Downloads':        '26,273',
  'Conversion Rate':  '14.2%',
  'Spend':            '$48,291',
  'Cost per Install': '$1.84',
  'TTR':              '6.85%',
  'Attr Installs':    '3,915',
  'CPI':              '$2.14',
}

const INITIAL_CARDS = [
  'Impressions', 'Taps', 'Downloads', 'Conversion Rate',
  'Spend', 'Cost per Install', 'TTR', 'Attr Installs',
]

function pickColor(selected) {
  const usedColors = selected.map((s) => s.color)
  return COLORS.find((c) => !usedColors.includes(c))
}

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activePage, setActivePage] = useState('Ads Manager')
  const [selectedCampaignGroup, setSelectedCampaignGroup] = useState('square-us')
  const [integrationState, setIntegrationState] = useState('both')

  const activeCampaignGroup = CAMPAIGN_GROUPS.find((g) => g.id === selectedCampaignGroup) || CAMPAIGN_GROUPS[0]
  const selectedApp = activeCampaignGroup.app

  // Which metric label each card slot currently shows
  const [cardAssignments, setCardAssignments] = useState(INITIAL_CARDS)

  // Ordered array of { label, color } — FIFO, max 4
  const [selected, setSelected] = useState([
    { label: INITIAL_CARDS[0], color: COLORS[0] },
    { label: INITIAL_CARDS[1], color: COLORS[1] },
  ])

  const toggle = (label) => {
    setSelected((prev) => {
      const isSelected = prev.some((s) => s.label === label)
      if (isSelected) {
        if (prev.length === 1) return prev
        return prev.filter((s) => s.label !== label)
      }
      const newEntry = { label, color: pickColor(prev) }
      if (prev.length < 4) return [...prev, newEntry]
      const afterEviction = prev.slice(1)
      return [...afterEviction, { label, color: pickColor(afterEviction) }]
    })
  }

  // Swap a card's metric. Preserves checked state: if fromLabel was checked,
  // the card becomes checked for toLabel with the same color.
  const assignMetricToCard = (fromLabel, toLabel) => {
    setCardAssignments((prev) => prev.map((l) => l === fromLabel ? toLabel : l))
    setSelected((prev) => prev.map((s) => s.label === fromLabel ? { ...s, label: toLabel } : s))
  }

  // Set of all labels currently assigned to any card — used to disable already-used metrics in dropdowns
  const assignedMetrics = new Set(cardAssignments)

  const renderCard = (metricLabel) => {
    const sel = selected.find((s) => s.label === metricLabel)
    return (
      <MetricCard
        key={metricLabel}
        label={metricLabel}
        value={ALL_METRIC_VALUES[metricLabel] ?? '-'}
        color={sel?.color ?? '#d1d5db'}
        checked={!!sel}
        disabled={selected.length === 1 && !!sel}
        onToggle={() => toggle(metricLabel)}
        onMetricSelect={(newLabel) => assignMetricToCard(metricLabel, newLabel)}
        assignedMetrics={assignedMetrics}
      />
    )
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((v) => !v)}
        activePage={activePage}
        onNavigate={setActivePage}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header
          activePage={activePage}
          selectedCampaignGroup={selectedCampaignGroup}
          onCampaignGroupChange={setSelectedCampaignGroup}
          integrationState={integrationState}
          onIntegrationStateChange={setIntegrationState}
        />

        {activePage === 'Overview' ? (
          <OverviewPage selectedApp={selectedApp} campaignGroup={activeCampaignGroup} integrationState={integrationState} />
        ) : (
          <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
            <div className="space-y-4">

              {/* Metric Cards */}
              {sidebarCollapsed ? (
                <div className="grid gap-2.5" style={{ gridTemplateColumns: 'repeat(8, 1fr)' }}>
                  {cardAssignments.map((label) => renderCard(label))}
                </div>
              ) : (
                <div className="flex flex-nowrap gap-2.5 overflow-x-auto pb-1">
                  {cardAssignments.map((label) => (
                    <div key={label} className="flex-shrink-0">
                      {renderCard(label)}
                    </div>
                  ))}
                </div>
              )}

              {/* Line Chart */}
              <div className="shadow-sm rounded-xl overflow-hidden">
                <DownloadChart selected={selected} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
