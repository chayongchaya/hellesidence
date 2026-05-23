import { Icon } from '../components/Icons'
import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

// ─── Data ────────────────────────────────────────────────────────────────────

const groups = [
  {
    id: 'tenants',
    label: 'Tenants & Contracts',
    icon: 'tenants',
    color: '#3b82f6',
    bg: '#eff6ff',
    borderColor: '#bfdbfe',
    reports: [
      { to: '/reports/tenants',   label: 'Tenant List',       desc: 'Full list of all tenants',       icon: 'tenant-list' },
      { to: '/reports/contracts', label: 'Contract Printout', desc: 'Printable rental agreements',    icon: 'contract-print' },
    ],
  },
  {
    id: 'rooms',
    label: 'Rooms',
    icon: 'rooms',
    color: '#10b981',
    bg: '#f0fdf4',
    borderColor: '#a7f3d0',
    reports: [
      { to: '/reports/rooms',           label: 'Room List',       desc: 'All rooms with status & type', icon: 'room-list' },
      { to: '/reports/available-rooms', label: 'Available Rooms', desc: 'Rooms ready to rent',          icon: 'available-rooms' },
      { to: '/reports/occupancy',       label: 'Occupancy Rate',  desc: 'Occupancy trends over time',   icon: 'occupancy' },
    ],
  },
  {
    id: 'finance',
    label: 'Finance',
    icon: 'rental-income',
    color: '#8b5cf6',
    bg: '#faf5ff',
    borderColor: '#ddd6fe',
    reports: [
      { to: '/reports/rental-income',      label: 'Rental Income',      desc: 'Income summary by period',  icon: 'rental-income' },
      { to: '/reports/monthly-bills',      label: 'Monthly Bills',      desc: 'All bills generated',       icon: 'monthly-bills' },
      { to: '/reports/billing-statement',  label: 'Billing Statement',  desc: 'Per-tenant statement',      icon: 'billing-statement' },
      { to: '/reports/charges-by-type',    label: 'Charges by Type',    desc: 'Breakdown of charge types', icon: 'charges-by-type' },
      { to: '/reports/payments',           label: 'Payment List',       desc: 'All payment receipts',      icon: 'payment-list' },
      { to: '/reports/unpaid-balances',    label: 'Unpaid Balances',    desc: 'Outstanding amounts',       icon: 'unpaid-balances' },
      { to: '/reports/payments-by-method', label: 'Payments by Method', desc: 'Cash, transfer, etc.',      icon: 'payments-method' },
    ],
  },
  {
    id: 'maintenance',
    label: 'Maintenance',
    icon: 'maintenance',
    color: '#f59e0b',
    bg: '#fffbeb',
    borderColor: '#fde68a',
    reports: [
      { to: '/reports/maintenance',                 label: 'Maintenance List',            desc: 'All repair tickets',            icon: 'maint-list'    },
      { to: '/reports/maintenance-request-voucher', label: 'Maintenance Request Voucher', desc: 'Printable request form & sign', icon: 'maint-voucher' },
      { to: '/reports/maintenance-cost',            label: 'Maintenance Cost',            desc: 'Spending on repairs',           icon: 'maint-cost'    },
    ],
  },
  {
    id: 'expenses',
    label: 'Expenses',
    icon: 'expenses',
    color: '#ef4444',
    bg: '#fef2f2',
    borderColor: '#fecaca',
    reports: [
      { to: '/reports/expenses',        label: 'Expense List',         desc: 'All expense records',  icon: 'expense-list' },
      { to: '/reports/expense-voucher', label: 'Expense Voucher',      desc: 'Printable vouchers',   icon: 'expense-voucher' },
      { to: '/reports/expenses-by-cat', label: 'Expenses by Category', desc: 'Spending breakdown',   icon: 'expenses-by-cat' },
    ],
  },
]

const totalReports = groups.reduce((s, g) => s + g.reports.length, 0)
const RECENT_KEY = 'reportsHub_recent'
const MAX_RECENT = 5

// ─── Helpers ─────────────────────────────────────────────────────────────────

function loadRecent() {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]') } catch { return [] }
}
function saveRecent(items) {
  try { localStorage.setItem(RECENT_KEY, JSON.stringify(items)) } catch {}
}
function addRecent(to) {
  const prev = loadRecent().filter(x => x !== to)
  saveRecent([to, ...prev].slice(0, MAX_RECENT))
}

function highlight(text, query, color) {
  if (!query) return text
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: `${color}28`, color, borderRadius: 3, padding: '0 2px' }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  )
}

function findReport(to) {
  for (const g of groups) {
    const r = g.reports.find(r => r.to === to)
    if (r) return { r, g }
  }
  return null
}

// ─── ReportCard (grid) ───────────────────────────────────────────────────────

function ReportCard({ r, g, searchQuery, onOpen }) {
  const [hov, setHov] = useState(false)

  return (
    <button
      onClick={() => onOpen(r.to)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? g.bg : 'var(--surface)',
        border: `1.5px solid ${hov ? g.color : 'var(--border)'}`,
        borderRadius: 14,
        padding: '15px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        cursor: 'pointer',
        textAlign: 'left',
        transform: hov ? 'translateY(-2px)' : 'none',
        boxShadow: hov ? `0 6px 20px ${g.color}1a` : 'none',
        transition: 'all .16s cubic-bezier(.4,0,.2,1)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* top accent bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: g.color,
        opacity: hov ? 0.7 : 0.3,
        borderRadius: '14px 14px 0 0',
        transition: 'opacity .16s',
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3 }}>
            {highlight(r.label, searchQuery, g.color)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3, lineHeight: 1.4 }}>
            {highlight(r.desc, searchQuery, g.color)}
          </div>
        </div>
        <div style={{
          fontSize: 17, flexShrink: 0,
          background: g.bg, border: `1px solid ${g.borderColor}`,
          borderRadius: 10, width: 34, height: 34,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name={r.icon} size={15} />
        </div>
      </div>

      <div style={{
        marginTop: 2, fontSize: 11, fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '.7px',
        color: g.color, display: 'flex', alignItems: 'center', gap: 3,
        opacity: hov ? 1 : 0.6, transition: 'opacity .16s',
      }}>
        Open Report <span style={{ fontSize: 13 }}>→</span>
      </div>
    </button>
  )
}

// ─── ReportRow (list) ────────────────────────────────────────────────────────

function ReportRow({ r, g, searchQuery, onOpen }) {
  const [hov, setHov] = useState(false)

  return (
    <button
      onClick={() => onOpen(r.to)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: '100%',
        background: hov ? g.bg : 'transparent',
        border: 'none',
        borderRadius: 10,
        padding: '9px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'background .13s',
      }}
    >
      <div style={{
        width: 30, height: 30, borderRadius: 8,
        background: hov ? 'white' : g.bg,
        border: `1px solid ${g.borderColor}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 15, flexShrink: 0,
        transition: 'background .13s',
      }}>
        <Icon name={r.icon} size={15} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
          {highlight(r.label, searchQuery, g.color)}
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 1 }}>
          {highlight(r.desc, searchQuery, g.color)}
        </div>
      </div>
      <div style={{
        fontSize: 14, color: g.color,
        opacity: hov ? 1 : 0,
        transition: 'opacity .13s',
        fontWeight: 700,
      }}>→</div>
    </button>
  )
}

// ─── ReportGroup ─────────────────────────────────────────────────────────────

function ReportGroup({ g, searchQuery, viewMode, onOpen, groupRef }) {
  const [open, setOpen] = useState(true)

  const filtered = searchQuery
    ? g.reports.filter(r =>
        r.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.desc.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : g.reports

  if (searchQuery && filtered.length === 0) return null

  return (
    <div
      id={`group-${g.id}`}
      ref={groupRef}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 18,
        overflow: 'hidden',
        boxShadow: 'var(--shadow)',
        scrollMarginTop: 80,
      }}
    >
      {/* Group header */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 13,
          padding: '14px 20px',
          background: 'none', border: 'none',
          cursor: 'pointer', textAlign: 'left',
          borderBottom: open && filtered.length > 0 ? '1px solid var(--border)' : 'none',
        }}
      >
        <div style={{ width: 4, height: 38, borderRadius: 4, background: g.color, flexShrink: 0 }} />

        <div style={{
          width: 38, height: 38, borderRadius: 11,
          background: g.bg, border: `1.5px solid ${g.borderColor}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 17, flexShrink: 0,
        }}><Icon name={g.icon} size={15} /></div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{g.label}</div>
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 1 }}>
            {searchQuery ? `${filtered.length} of ${g.reports.length}` : g.reports.length} reports
          </div>
        </div>

        <div style={{
          padding: '3px 10px',
          background: g.bg,
          border: `1px solid ${g.borderColor}`,
          borderRadius: 20,
          fontSize: 11, fontWeight: 700,
          color: g.color,
        }}>
          {filtered.length}
        </div>

        <div style={{
          fontSize: 18, color: 'var(--text-muted)',
          transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
          transition: 'transform .2s',
          marginLeft: 4,
        }}>›</div>
      </button>

      {/* Cards / rows */}
      {open && filtered.length > 0 && (
        viewMode === 'grid' ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
            gap: 10,
            padding: '14px 18px',
            background: 'var(--bg)',
          }}>
            {filtered.map(r => (
              <ReportCard key={r.to} r={r} g={g} searchQuery={searchQuery} onOpen={onOpen} />
            ))}
          </div>
        ) : (
          <div style={{ padding: '8px 10px', background: 'var(--bg)' }}>
            {filtered.map((r, i) => (
              <div key={r.to}>
                <ReportRow r={r} g={g} searchQuery={searchQuery} onOpen={onOpen} />
                {i < filtered.length - 1 && (
                  <div style={{ height: 1, background: 'var(--border)', margin: '0 12px', opacity: .6 }} />
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}

// ─── Recently Viewed ─────────────────────────────────────────────────────────

function RecentlyViewed({ recent, onOpen }) {
  if (recent.length === 0) return null

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 18,
      padding: '14px 18px',
      boxShadow: 'var(--shadow)',
    }}>
      <div style={{
        fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
        letterSpacing: '.8px', textTransform: 'uppercase', marginBottom: 10,
      }}>
        Recently Viewed
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {recent.map(to => {
          const found = findReport(to)
          if (!found) return null
          const { r, g } = found
          return (
            <button
              key={to}
              onClick={() => onOpen(to)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 10px 5px 7px',
                background: g.bg,
                border: `1.5px solid ${g.borderColor}`,
                borderRadius: 20,
                cursor: 'pointer',
                fontSize: 12, fontWeight: 600, color: g.color,
                transition: 'all .13s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = g.color; e.currentTarget.style.filter = 'brightness(.97)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = g.borderColor; e.currentTarget.style.filter = 'none' }}
            >
              <span style={{ fontSize: 13 }}><Icon name={r.icon} size={15} /></span>
              {r.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Category Jump Nav ────────────────────────────────────────────────────────

function CategoryNav({ groups, activeId }) {
  return (
    <div style={{
      display: 'flex', gap: 6, flexWrap: 'wrap',
    }}>
      {groups.map(g => (
        <button
          key={g.id}
          onClick={() => {
            const el = document.getElementById(`group-${g.id}`)
            el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '4px 11px 4px 7px',
            background: activeId === g.id ? g.bg : 'var(--surface)',
            border: `1.5px solid ${activeId === g.id ? g.color : 'var(--border)'}`,
            borderRadius: 20,
            fontSize: 12, fontWeight: 600,
            color: activeId === g.id ? g.color : 'var(--text-muted)',
            cursor: 'pointer',
            transition: 'all .13s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = g.color; e.currentTarget.style.color = g.color; e.currentTarget.style.background = g.bg }}
          onMouseLeave={e => {
            if (activeId !== g.id) {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.color = 'var(--text-muted)'
              e.currentTarget.style.background = 'var(--surface)'
            }
          }}
        >
          <span style={{ fontSize: 13 }}><Icon name={g.icon} size={15} /></span>
          {g.label}
        </button>
      ))}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ReportsHub() {
  const nav = useNavigate()
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'
  const [recent, setRecent] = useState(loadRecent)
  const [activeGroupId, setActiveGroupId] = useState(null)
  const groupRefs = useRef({})
  const searchRef = useRef(null)

  // Scroll spy
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const id = e.target.id.replace('group-', '')
            setActiveGroupId(id)
          }
        }
      },
      { rootMargin: '-60px 0px -70% 0px', threshold: 0 }
    )
    groups.forEach(g => {
      const el = document.getElementById(`group-${g.id}`)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  // Keyboard shortcut: / to focus search
  useEffect(() => {
    const handler = e => {
      if (e.key === '/' && document.activeElement !== searchRef.current) {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const totalMatches = useMemo(() => {
    if (!search) return totalReports
    return groups.reduce((s, g) =>
      s + g.reports.filter(r =>
        r.label.toLowerCase().includes(search.toLowerCase()) ||
        r.desc.toLowerCase().includes(search.toLowerCase())
      ).length, 0)
  }, [search])

  function handleOpen(to) {
    addRecent(to)
    setRecent(loadRecent())
    nav(to)
  }

  return (
    <>
      {/* ── Topbar ── */}
      <div className="topbar" style={{ gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-.4px' }}>Reports</h1>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>
            {search
              ? `${totalMatches} ${totalMatches === 1 ? 'result' : 'results'} for "${search}"`
              : `${totalReports} reports across ${groups.length} categories`
            }
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
          {/* Search */}
          <div style={{ position: 'relative', width: 240 }}>
            <span style={{
              position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
              fontSize: 13, color: 'var(--text-muted)', pointerEvents: 'none',
            }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg></span>
            <input
              ref={searchRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search… (press /)"
              style={{
                width: '100%',
                padding: '7px 28px 7px 30px',
                border: '1.5px solid var(--border)',
                borderRadius: 10,
                fontSize: 13,
                background: 'var(--bg)',
                outline: 'none',
                fontFamily: 'inherit',
                transition: 'border-color .15s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute', right: 7, top: '50%', transform: 'translateY(-50%)',
                  background: 'var(--border)', border: 'none', borderRadius: '50%',
                  width: 17, height: 17, cursor: 'pointer', fontSize: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-muted)',
                }}
              ><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            )}
          </div>

          {/* View toggle */}
          <div style={{
            display: 'flex',
            border: '1.5px solid var(--border)',
            borderRadius: 10,
            overflow: 'hidden',
            background: 'var(--surface)',
          }}>
            {['grid', 'list'].map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                title={`${mode.charAt(0).toUpperCase() + mode.slice(1)} view`}
                style={{
                  padding: '6px 11px',
                  border: 'none',
                  background: viewMode === mode ? 'var(--accent)' : 'transparent',
                  color: viewMode === mode ? '#fff' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: 14,
                  transition: 'all .13s',
                  display: 'flex', alignItems: 'center',
                }}
              >
                {mode === 'grid'
                  ? <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="0" y="0" width="6" height="6" rx="1.5"/><rect x="8" y="0" width="6" height="6" rx="1.5"/><rect x="0" y="8" width="6" height="6" rx="1.5"/><rect x="8" y="8" width="6" height="6" rx="1.5"/></svg>
                  : <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="0" y="1" width="14" height="2" rx="1"/><rect x="0" y="6" width="14" height="2" rx="1"/><rect x="0" y="11" width="14" height="2" rx="1"/></svg>
                }
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* ── Category quick stats + jump nav (hidden when searching) ── */}
        {!search && (
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 18,
            padding: '14px 18px',
            boxShadow: 'var(--shadow)',
            display: 'flex', flexDirection: 'column', gap: 12,
          }}>
            {/* Stat pills */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: 8,
            }}>
              {groups.map(g => (
                <button
                  key={g.id}
                  onClick={() => {
                    const el = document.getElementById(`group-${g.id}`)
                    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: g.bg,
                    border: `1.5px solid ${activeGroupId === g.id ? g.color : g.borderColor}`,
                    borderRadius: 12, padding: '10px 13px',
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'all .14s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = g.color}
                  onMouseLeave={e => { if (activeGroupId !== g.id) e.currentTarget.style.borderColor = g.borderColor }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: 9,
                    background: 'white', border: `1px solid ${g.borderColor}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 15, flexShrink: 0,
                  }}><Icon name={g.icon} size={15} /></div>
                  <div>
                    <div style={{ fontSize: 11, color: g.color, fontWeight: 600, lineHeight: 1.2 }}>{g.label}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', lineHeight: 1.2, marginTop: 1 }}>
                      {g.reports.length}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: 'var(--border)' }} />

            {/* Jump nav pills */}
            <CategoryNav groups={groups} activeId={activeGroupId} />
          </div>
        )}

        {/* ── Recently viewed ── */}
        {!search && <RecentlyViewed recent={recent} onOpen={handleOpen} />}

        {/* ── No results ── */}
        {search && totalMatches === 0 && (
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 18,
            padding: '52px 24px',
            textAlign: 'center',
          }}>
            <div style={{ display:'flex', justifyContent:'center' }}><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg></div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginTop: 12 }}>
              No reports match "{search}"
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 5 }}>
              Try a different keyword
            </div>
            <button
              onClick={() => setSearch('')}
              style={{
                marginTop: 16, padding: '8px 20px', borderRadius: 10,
                background: 'var(--accent)', color: '#fff', border: 'none',
                cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: 'inherit',
              }}
            >Clear Search</button>
          </div>
        )}

        {/* ── Report groups ── */}
        {groups.map(g => (
          <ReportGroup
            key={g.id}
            g={g}
            searchQuery={search}
            viewMode={viewMode}
            onOpen={handleOpen}
            groupRef={el => { if (el) groupRefs.current[g.id] = el }}
          />
        ))}

      </div>
    </>
  )
}
