import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/http'
import { formatBaht } from '../utils/utils'

function DonutRing({ pct, size = 88 }) {
  const r = 30, cx = 44, cy = 44
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  return (
    <svg width={size} height={size} viewBox="0 0 88 88">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb" strokeWidth="9" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#3b82f6" strokeWidth="9"
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
        transform="rotate(-90 44 44)" />
      <text x={cx} y={cy + 5} textAnchor="middle" fill="#1d4ed8" fontSize="14"
        fontWeight="800" fontFamily="Inter, sans-serif">{pct}%</text>
    </svg>
  )
}

// Module tiles — icons match reference screenshot style with colored rounded squares
const modules = [
  { to: '/tenants',               label: 'Tenants',          desc: 'Manage tenant records | Search, add, edit, view',  icon: '👥', bg: '#3b82f6' },
  { to: '/rooms',                 label: 'Rooms',            desc: 'Room list, status, | type and pricing',            icon: '🏠', bg: '#10b981' },
  { to: '/contracts',             label: 'Rental Contracts', desc: 'Create and view | rental agreements',              icon: '📋', bg: '#f97316' },
  { to: '/billing',               label: 'Monthly Billing',  desc: 'Generate and manage | monthly bills',              icon: '💲', bg: '#8b5cf6' },
  { to: '/payments',              label: 'Payment Receipts', desc: 'Record and track | tenant payments',               icon: '💳', bg: '#ec4899' },
  { to: '/maintenance',           label: 'Maintenance Tickets', desc: 'Log and manage | repair requests',              icon: '🔧', bg: '#f59e0b' },
  { to: '/inspections',           label: 'Room Inspections', desc: 'Schedule and record | room checks',                icon: '🔍', bg: '#06b6d4' },
  { to: '/expenses',              label: 'Expenses',         desc: 'Track and manage | hostel spending',               icon: '🛒', bg: '#84cc16' },
  { to: '/reports',              label: 'Reports',          desc: 'Analytics, statements | and printouts',            icon: '📊', bg: '#6366f1' },
]

export default function Dashboard() {
  const [rooms, setRooms]     = useState([])
  const [bills, setBills]     = useState([])
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const nav = useNavigate()

  useEffect(() => {
    Promise.all([
      api.get('/api/v1/rooms'),
      api.get('/api/v1/monthly-bills?status=Unpaid'),
      api.get('/api/v1/maintenance-tickets?status=Pending'),
    ]).then(([r, b, t]) => { setRooms(r); setBills(b); setTickets(t) })
      .finally(() => setLoading(false))
  }, [])

  const occupied    = rooms.filter(r => r.status === 'Occupied').length
  const available   = rooms.filter(r => r.status === 'Available').length
  const maintenance = rooms.filter(r => r.status === 'Maintenance').length
  const occPct      = rooms.length ? Math.round(occupied / rooms.length * 100) : 0
  const unpaidTotal = bills.reduce((s, b) => s + parseFloat(b.balance_due || 0), 0)
  const today       = new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <>
      {/* TOPBAR */}
      <div className="topbar" style={{ justifyContent: 'flex-end' }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{today}</span>
      </div>

      <div className="page-content">
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: 'var(--text-muted)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>⏳</div>
              <div style={{ fontWeight: 600 }}>Loading…</div>
            </div>
          </div>
        ) : <>

          {/* STAT CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Total Rooms',    value: rooms.length,   sub: 'all units',        accent: '#3b82f6', accentBg: '#eff6ff' },
              { label: 'Occupied',       value: occupied,       sub: `${occPct}% rate`,  accent: '#10b981', accentBg: '#f0fdf4' },
              { label: 'Available',      value: available,      sub: 'ready to rent',    accent: '#22c55e', accentBg: '#f0fdf4' },
              { label: 'Pending Issues', value: tickets.length, sub: 'maintenance open', accent: '#f59e0b', accentBg: '#fffbeb' },
            ].map(s => (
              <div key={s.label} style={{
                background: '#fff',
                border: '1px solid var(--border)',
                borderRadius: 16,
                padding: '20px 22px',
                boxShadow: 'var(--shadow)',
                borderTop: `4px solid ${s.accent}`,
              }}>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.6px', color: 'var(--text-muted)', marginBottom: 8 }}>{s.label}</div>
                <div style={{ fontSize: 34, fontWeight: 800, color: s.accent, letterSpacing: '-1px', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* MODULE TILES — matches reference screenshot exactly */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {modules.map(m => (
                <button
                  key={m.to}
                  onClick={() => nav(m.to)}
                  style={{
                    background: '#fff',
                    border: '1px solid var(--border)',
                    borderRadius: 16,
                    padding: '24px 22px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 12,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all .18s',
                    boxShadow: 'var(--shadow)',
                    position: 'relative',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)'
                    e.currentTarget.style.borderColor = '#d1d5db'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = ''
                    e.currentTarget.style.boxShadow = 'var(--shadow)'
                    e.currentTarget.style.borderColor = 'var(--border)'
                  }}
                >
                  {/* Icon bubble */}
                  <div style={{
                    width: 52, height: 52,
                    borderRadius: 16,
                    background: m.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 24,
                  }}>{m.icon}</div>

                  {/* Label */}
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{m.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{m.desc}</div>
                  </div>

                  {/* Enter link */}
                  <div style={{
                    marginTop: 4,
                    fontSize: 11, fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '.8px',
                    color: 'var(--text-muted)',
                    display: 'flex', alignItems: 'center', gap: 5,
                  }}>
                    ENTER MODULE <span style={{ fontSize: 14 }}>›</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* OCCUPANCY + UNPAID BILLS */}
          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16, marginBottom: 24 }}>

            {/* Occupancy widget */}
            <div style={{
              background: '#fff', border: '1px solid var(--border)',
              borderRadius: 16, padding: '22px 20px',
              boxShadow: 'var(--shadow)',
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>Room Occupancy</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 20 }}>
                <DonutRing pct={occPct} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { label: 'Occupied',    val: occupied,    dot: '#3b82f6' },
                    { label: 'Available',   val: available,   dot: '#22c55e' },
                    { label: 'Maintenance', val: maintenance, dot: '#f59e0b' },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--text-muted)' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.dot, display: 'inline-block', flexShrink: 0 }} />
                        {item.label}
                      </div>
                      <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.7px', color: 'var(--text-muted)', marginBottom: 6 }}>Outstanding</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#f59e0b', letterSpacing: '-.5px' }}>{formatBaht(unpaidTotal)}</div>
                <div style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 3 }}>{bills.length} unpaid bill{bills.length !== 1 ? 's' : ''}</div>
              </div>
            </div>

            {/* Unpaid bills table */}
            <div style={{
              background: '#fff', border: '1px solid var(--border)',
              borderRadius: 16, overflow: 'hidden',
              boxShadow: 'var(--shadow)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Unpaid Bills</span>
                <span style={{ fontSize: 11, background: 'var(--yellow-bg)', color: 'var(--yellow-text)', padding: '3px 10px', borderRadius: 20, fontWeight: 700 }}>
                  {bills.length} pending
                </span>
              </div>
              <div className="tbl-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Tenant</th>
                      <th>Room</th>
                      <th>Month</th>
                      <th>Balance Due</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bills.slice(0, 7).map(b => (
                      <tr key={b.bill_no}>
                        <td style={{ fontWeight: 600 }}>{b.tenant_name}</td>
                        <td>
                          <span style={{ background: 'var(--blue-bg)', color: 'var(--blue-text)', padding: '2px 9px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
                            {b.room_no}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{b.billing_month}</td>
                        <td style={{ color: 'var(--red-text)', fontWeight: 700 }}>{formatBaht(b.balance_due)}</td>
                      </tr>
                    ))}
                    {!bills.length && (
                      <tr><td colSpan={4}>
                        <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
                          <div style={{ fontSize: 28, marginBottom: 6 }}>🎉</div>
                          <div style={{ fontWeight: 600 }}>All bills paid!</div>
                        </div>
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* MAINTENANCE TICKETS */}
          {tickets.length > 0 && (
            <div style={{
              background: '#fff', border: '1px solid var(--border)',
              borderRadius: 16, overflow: 'hidden',
              boxShadow: 'var(--shadow)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Open Maintenance Tickets</span>
                <span style={{ fontSize: 11, background: 'var(--orange-bg)', color: 'var(--orange-text)', padding: '3px 10px', borderRadius: 20, fontWeight: 700 }}>{tickets.length} open</span>
              </div>
              <div className="tbl-wrap">
                <table>
                  <thead><tr>
                    <th>Room</th>
                    <th>Description</th>
                    <th>Priority</th>
                  </tr></thead>
                  <tbody>
                    {tickets.slice(0, 5).map(t => (
                      <tr key={t.ticket_no}>
                        <td><span style={{ background: 'var(--yellow-bg)', color: 'var(--yellow-text)', padding: '2px 9px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>{t.room_no}</span></td>
                        <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.description}</td>
                        <td><span className={`badge badge-${t.priority_level?.toLowerCase()}`}>{t.priority_level}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>}
      </div>
    </>
  )
}
