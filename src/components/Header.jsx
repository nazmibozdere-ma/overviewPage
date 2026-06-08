import { useState, useRef, useEffect } from 'react'
import { RefreshCw, SlidersHorizontal, CircleDot, CalendarDays, ChevronDown, Bell, Sparkles, Search, Check } from 'lucide-react'

const TABS = [
  'Campaign Groups',
  'Apps',
  'Campaigns',
  'Ad Groups',
  'Keywords',
  'Search Terms',
  'Ads',
  'CPP',
  'Negative Keywords',
]

export const CAMPAIGN_GROUPS = [
  {
    id:              'square-us',
    name:            'Square US',
    email:           'elisa.reyna@squareup.com',
    initial:         'S',
    color:           '#4B7BF5',
    app:             'Square Point of Sale (POS)',
    integrationDate: 'Feb 12, 2025',
  },
  {
    id:              'square-cash',
    name:            'Square Cash',
    email:           'marcus.cole@squareup.com',
    initial:         'S',
    color:           '#10b981',
    app:             'Cash App',
    integrationDate: 'Mar 8, 2025',
  },
  {
    id:              'afterpay-us',
    name:            'Afterpay US',
    email:           'anna.becker@afterpay.com',
    initial:         'A',
    color:           '#8b5cf6',
    app:             'Afterpay',
    integrationDate: 'Jul 22, 2025',
  },
]

// ── Campaign Group Dropdown ───────────────────────────────────────────────────
function CampaignGroupDropdown({ selectedId, onChange }) {
  const [open, setOpen]     = useState(false)
  const [search, setSearch] = useState('')
  const ref                 = useRef(null)

  const selected = CAMPAIGN_GROUPS.find((g) => g.id === selectedId) || CAMPAIGN_GROUPS[0]

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const query    = search.toLowerCase()
  const filtered = CAMPAIGN_GROUPS.filter(
    (g) => g.name.toLowerCase().includes(query) || g.email.toLowerCase().includes(query)
  )

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl transition-colors hover:bg-gray-50 select-none"
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
          style={{ backgroundColor: selected.color }}
        >
          {selected.initial}
        </div>
        <div className="text-left leading-tight">
          <div className="text-sm font-semibold" style={{ color: '#4B7BF5' }}>{selected.name}</div>
          <div className="text-xs" style={{ color: '#9ca3af' }}>{selected.email}</div>
        </div>
        <ChevronDown
          size={14}
          style={{
            color: '#9ca3af',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s',
          }}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 bg-white rounded-xl z-[9999] overflow-hidden"
          style={{
            minWidth: 300,
            border: '1.5px solid #e5e7eb',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          }}
        >
          {/* Search */}
          <div className="px-4 py-3" style={{ borderBottom: '1px solid #f3f4f6' }}>
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}
            >
              <Search size={13} style={{ color: '#9ca3af', flexShrink: 0 }} />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search campaign groups..."
                className="flex-1 text-sm outline-none bg-transparent placeholder-gray-400"
                style={{ color: '#374151' }}
              />
            </div>
          </div>

          {/* Group list */}
          <div className="py-1.5">
            {filtered.map((group) => {
              const isSelected = group.id === selectedId
              return (
                <button
                  key={group.id}
                  onClick={() => { onChange(group.id); setOpen(false); setSearch('') }}
                  className="w-full flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50"
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                    style={{ backgroundColor: group.color }}
                  >
                    {group.initial}
                  </div>
                  <div className="flex-1 text-left leading-tight">
                    <div
                      className="text-sm font-semibold"
                      style={{ color: isSelected ? '#4B7BF5' : '#111827' }}
                    >
                      {group.name}
                    </div>
                    <div className="text-xs" style={{ color: '#9ca3af' }}>{group.email}</div>
                  </div>
                  {isSelected && <Check size={14} style={{ color: '#4B7BF5' }} />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Shared header actions ─────────────────────────────────────────────────────
function HeaderActions({ selectedCampaignGroup, onCampaignGroupChange }) {
  return (
    <div className="flex items-center gap-2">
      <button
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium select-none"
        style={{
          background: 'linear-gradient(135deg, #4B7BF5 0%, #7B6CF6 100%)',
          color: '#ffffff',
          border: 'none',
          cursor: 'default',
        }}
      >
        <Sparkles size={14} />
        Ask AI
        <span
          className="ml-1 text-xs font-semibold px-1.5 py-0.5 rounded"
          style={{ backgroundColor: 'rgba(255,255,255,0.25)', color: '#ffffff' }}
        >
          Beta
        </span>
      </button>

      <button
        className="w-9 h-9 flex items-center justify-center rounded-full"
        style={{ color: '#6b7280', cursor: 'default' }}
      >
        <Bell size={18} />
      </button>

      <CampaignGroupDropdown
        selectedId={selectedCampaignGroup}
        onChange={onCampaignGroupChange}
      />
    </div>
  )
}

// ── Header ────────────────────────────────────────────────────────────────────
const INTEGRATION_STATES = [
  { value: 'none',            label: 'No Integrations' },
  { value: 'apple-only',      label: 'Apple Ads Only' },
  { value: 'both',            label: 'Both Integrated' },
  { value: 'no-optimization', label: 'No Optimization' },
]

export default function Header({ activePage, selectedCampaignGroup, onCampaignGroupChange, integrationState, onIntegrationStateChange }) {
  const title = activePage === 'Overview' ? 'Overview' : 'Ads Manager'

  if (activePage === 'Overview') {
    return (
      <div className="bg-white border-b border-gray-100">
        <div className="flex items-center justify-between px-8" style={{ height: '64px' }}>
          {/* Title + state selector */}
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h1>

            {/* Segmented integration state selector */}
            <div
              className="flex items-center rounded-lg p-0.5"
              style={{ backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb' }}
            >
              {INTEGRATION_STATES.map((s) => {
                const active = integrationState === s.value
                return (
                  <button
                    key={s.value}
                    onClick={() => onIntegrationStateChange?.(s.value)}
                    className="px-3 py-1 rounded-md text-xs font-medium transition-all select-none"
                    style={{
                      backgroundColor: active ? '#ffffff' : 'transparent',
                      color:           active ? '#111827' : '#6b7280',
                      boxShadow:       active ? '0 1px 3px rgba(0,0,0,0.10)' : 'none',
                    }}
                  >
                    {s.label}
                  </button>
                )
              })}
            </div>
          </div>

          <HeaderActions
            selectedCampaignGroup={selectedCampaignGroup}
            onCampaignGroupChange={onCampaignGroupChange}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border-b border-gray-100">
      {/* Title row */}
      <div className="flex items-center justify-between px-8 pt-4 pb-3">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h1>
          <RefreshCw size={15} className="text-gray-400" />
        </div>
        <HeaderActions
          selectedCampaignGroup={selectedCampaignGroup}
          onCampaignGroupChange={onCampaignGroupChange}
        />
      </div>

      {/* Tab row */}
      <div className="flex items-center gap-0 px-8 border-b border-gray-100">
        {TABS.map((tab) => {
          const isActive = tab === 'Campaign Groups'
          return (
            <div
              key={tab}
              className="relative px-1 py-3 mr-6 text-sm whitespace-nowrap"
              style={{
                color:      isActive ? '#111827' : '#6b7280',
                fontWeight: isActive ? '600' : '400',
                cursor:     'default',
                userSelect: 'none',
              }}
            >
              {tab}
              {isActive && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  style={{ backgroundColor: '#111827' }}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Filter row */}
      <div className="flex items-center justify-between px-8 py-3">
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-sm text-gray-700 select-none"
            style={{ cursor: 'default' }}
          >
            <SlidersHorizontal size={14} className="text-gray-500" />
            Filters
          </div>
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-sm text-gray-700 select-none"
            style={{ cursor: 'default' }}
          >
            <CircleDot size={14} className="text-gray-500" />
            Level
          </div>
        </div>

        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 text-sm text-gray-700 select-none"
          style={{ cursor: 'default' }}
        >
          <CalendarDays size={14} className="text-gray-500" />
          <span>Sep 01, 2025</span>
          <span className="text-gray-400 mx-0.5">—</span>
          <span>Feb 28, 2026</span>
          <ChevronDown size={14} className="text-gray-400 ml-1" />
        </div>
      </div>
    </div>
  )
}
