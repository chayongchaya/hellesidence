import ReportTopbar from '../../components/ReportTopbar'
import { useState, useEffect, useRef } from 'react'
import { api } from '../../services/http'
import { formatBaht, formatDate } from '../../utils/utils'

const PRIORITY_COLOR = {
  Urgent: { color: 'var(--red-text)',    bg: 'var(--red-bg)',    border: 'var(--red)'    },
  High:   { color: 'var(--orange-text)', bg: 'var(--orange-bg)', border: 'var(--orange)' },
  Medium: { color: 'var(--blue-text)',   bg: 'var(--blue-bg)',   border: 'var(--blue)'   },
  Low:    { color: 'var(--green-text)',  bg: 'var(--green-bg)',  border: 'var(--green)'  },
}

const STATUS_COLOR = {
  Pending:       { color: 'var(--yellow-text)', bg: 'var(--yellow-bg)' },
  'In Progress': { color: 'var(--blue-text)',   bg: 'var(--blue-bg)'   },
  Completed:     { color: 'var(--green-text)',  bg: 'var(--green-bg)'  },
}

const Badge = ({ label, map }) => {
  const s = map[label] || { color: 'var(--text-muted)', bg: 'var(--surface2)' }
  return (
    <span style={{
      display: 'inline-block', padding: '3px 12px', borderRadius: 20,
      fontSize: 12, fontWeight: 700, color: s.color, background: s.bg,
    }}>{label}</span>
  )
}

const Field = ({ label, value, wide }) => (
  <div style={{
    gridColumn: wide ? '1 / -1' : undefined,
    display: 'flex', flexDirection: 'column', gap: 4,
  }}>
    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
      {label}
    </span>
    <div style={{
      borderBottom: '1.5px solid var(--border)',
      paddingBottom: 6,
      minHeight: 28,
      fontSize: 14,
      fontWeight: 500,
      color: 'var(--text)',
    }}>
      {value || <span style={{ color: 'var(--text-muted)' }}>—</span>}
    </div>
  </div>
)

const SignatureLine = ({ label }) => (
  <div style={{ flex: 1, minWidth: 140 }}>
    <div style={{ borderBottom: '1.5px solid var(--border)', height: 48, marginBottom: 6 }} />
    <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>{label}</div>
  </div>
)

export default function ReportMaintenanceRequestVoucher() {
  const [data,         setData]         = useState(null)
  const [loading,      setLoading]      = useState(false)
  const [ran,          setRan]          = useState(false)
  const [ticketList,   setTicketList]   = useState([])
  const [searchText,   setSearchText]   = useState('')
  const [selected,     setSelected]     = useState(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [dropdownStyle,setDropdownStyle]= useState({})
  const inputRef    = useRef(null)
  const dropdownRef = useRef(null)

  useEffect(() => {
    api.get('/api/v1/reports/maintenance?').then(setTicketList).catch(() => {})
  }, [])

  useEffect(() => {
    const handler = e => {
      if (
        inputRef.current    && !inputRef.current.contains(e.target) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target)
      ) setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const openDropdown = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect()
      setDropdownStyle({ position: 'fixed', top: rect.bottom + 2, left: rect.left, width: rect.width, zIndex: 99999 })
    }
    setDropdownOpen(true)
  }

  const filtered = ticketList.filter(t => {
    const s = searchText.toLowerCase()
    return (
      String(t.ticket_no).includes(s) ||
      (t.tenant_name || '').toLowerCase().includes(s) ||
      (t.issue_type  || '').toLowerCase().includes(s) ||
      (t.room_no     || '').toLowerCase().includes(s) ||
      (t.description || '').toLowerCase().includes(s)
    )
  }).slice(0, 60)

  const selectTicket = t => {
    setSelected(t)
    setSearchText(`MX${String(t.ticket_no).padStart(4, '0')} — ${t.tenant_name} · Room ${t.room_no} (${t.issue_type})`)
    setDropdownOpen(false)
  }

  const run = () => {
    if (!selected) return
    setLoading(true); setRan(true)
    api.get(`/api/v1/reports/maintenance-voucher?ticket_id=${selected.ticket_no}`)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }

  const ticketNo = data ? `MX${String(data.ticket_no).padStart(4, '0')}` : ''
  const pc = data ? (PRIORITY_COLOR[data.priority_level] || {}) : {}

  return (
    <>
      <ReportTopbar title="Maintenance Request Voucher" />

      <div className="page-content">

        {/* ── Filter Card ── */}
        <div className="card">
          <div className="card-header" style={{ gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <h3>Select Ticket</h3>
          </div>
          <div className="card-body">
            <div className="filter-bar" style={{ background: 'transparent', border: 'none', padding: 0, alignItems: 'flex-end' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Ticket No *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchText}
                    onChange={e => { setSearchText(e.target.value); setSelected(null); openDropdown() }}
                    onFocus={openDropdown}
                    placeholder="Search by ticket no, tenant, room, issue type…"
                    style={{ paddingRight: 32 }}
                  />
                  <svg style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', opacity: .4, pointerEvents: 'none' }}
                    width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                  </svg>
                </div>
              </div>
              <button className="btn btn-primary" onClick={run} disabled={!selected}>
                Generate Voucher
              </button>
            </div>

            {/* Dropdown */}
            {dropdownOpen && filtered.length > 0 && (
              <div ref={dropdownRef} style={{
                ...dropdownStyle,
                background: '#fff', border: '1px solid var(--border)', borderRadius: 8,
                boxShadow: '0 4px 20px rgba(0,0,0,.12)', maxHeight: 280, overflowY: 'auto',
              }}>
                {filtered.map(t => {
                  const pc2 = PRIORITY_COLOR[t.priority_level] || {}
                  const sc  = STATUS_COLOR[t.status] || {}
                  return (
                    <div
                      key={t.ticket_no}
                      onMouseDown={() => selectTicket(t)}
                      style={{
                        padding: '9px 14px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8,
                        background: selected?.ticket_no === t.ticket_no ? '#eff6ff' : '#fff',
                      }}
                      onMouseEnter={ev => ev.currentTarget.style.background = '#f8faff'}
                      onMouseLeave={ev => ev.currentTarget.style.background = selected?.ticket_no === t.ticket_no ? '#eff6ff' : '#fff'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                        <strong style={{ color: 'var(--primary)', flexShrink: 0 }}>
                          MX{String(t.ticket_no).padStart(4, '0')}
                        </strong>
                        <span style={{ color: '#aaa' }}>|</span>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {t.tenant_name} · Room {t.room_no}
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>{t.issue_type}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, color: pc2.color, background: pc2.bg }}>
                          {t.priority_level}
                        </span>
                        <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, color: sc.color, background: sc.bg }}>
                          {t.status}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            {dropdownOpen && filtered.length === 0 && searchText && (
              <div ref={dropdownRef} style={{
                ...dropdownStyle, background: '#fff', border: '1px solid var(--border)',
                borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,.12)',
                padding: '12px 16px', color: 'var(--text-muted)', fontSize: 13,
              }}>No tickets found</div>
            )}
          </div>
        </div>

        {ran && loading && <div className="loading">Generating voucher…</div>}

        {/* ── Printable Voucher ── */}
        {ran && !loading && data && (
          <div className="card mb-0" id="print-voucher" style={{ maxWidth: 800, margin: '0 auto' }}>

            {/* ── Voucher Header ── */}
            <div style={{
              background: 'var(--primary)', color: '#fff',
              padding: '20px 28px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderRadius: '10px 10px 0 0',
            }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', opacity: .8, marginBottom: 4 }}>
                  Maintenance Department
                </div>
                <h2 style={{ color: '#fff', margin: 0, fontSize: 22 }}>Maintenance Request Voucher</h2>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: 1 }}>{ticketNo}</div>
                <div style={{ marginTop: 6 }}>
                  <Badge label={data.status} map={STATUS_COLOR} />
                </div>
              </div>
            </div>

            {/* ── Priority Banner ── */}
            {data.priority_level && (
              <div style={{
                background: pc.bg || 'var(--surface2)',
                borderBottom: `2px solid ${pc.border || 'var(--border)'}`,
                padding: '8px 28px',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: pc.color, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                  Priority Level:
                </span>
                <span style={{ fontWeight: 800, color: pc.color, fontSize: 14 }}>{data.priority_level}</span>
              </div>
            )}

            <div style={{ padding: '24px 28px' }}>

              {/* ── Section 1: Request Information ── */}
              <div style={{ marginBottom: 24 }}>
                <div style={{
                  fontSize: 11, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase',
                  letterSpacing: '.08em', marginBottom: 14, paddingBottom: 6,
                  borderBottom: '2px solid var(--primary)',
                }}>
                  § 1 — Request Information
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 32px' }}>
                  <Field label="Ticket No"     value={ticketNo} />
                  <Field label="Request Date"  value={formatDate(data.request_date)} />
                  <Field label="Room No"       value={data.room_no} />
                  <Field label="Tenant Name"   value={data.tenant_name} />
                  <Field label="Issue Type"    value={data.issue_type} />
                  <Field label="Priority"      value={<Badge label={data.priority_level} map={PRIORITY_COLOR} />} />
                </div>
              </div>

              {/* ── Section 2: Problem Description ── */}
              <div style={{ marginBottom: 24 }}>
                <div style={{
                  fontSize: 11, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase',
                  letterSpacing: '.08em', marginBottom: 14, paddingBottom: 6,
                  borderBottom: '2px solid var(--primary)',
                }}>
                  § 2 — Problem Description
                </div>
                <div style={{
                  border: '1px solid var(--border)', borderRadius: 8,
                  padding: '12px 16px', minHeight: 80,
                  fontSize: 14, lineHeight: 1.7, color: 'var(--text)',
                  background: 'var(--surface2)',
                }}>
                  {data.description || <span style={{ color: 'var(--text-muted)' }}>No description provided.</span>}
                </div>
              </div>

              {/* ── Section 3: Technician & Completion ── */}
              <div style={{ marginBottom: 24 }}>
                <div style={{
                  fontSize: 11, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase',
                  letterSpacing: '.08em', marginBottom: 14, paddingBottom: 6,
                  borderBottom: '2px solid var(--primary)',
                }}>
                  § 3 — Assignment & Completion
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 32px' }}>
                  <Field label="Assigned Technician" value={data.technician_name || '—'} />
                  <Field label="Completion Date"     value={data.completion_date ? formatDate(data.completion_date) : '—'} />
                </div>
              </div>

              {/* ── Section 4: Cost Summary ── */}
              <div style={{ marginBottom: 28 }}>
                <div style={{
                  fontSize: 11, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase',
                  letterSpacing: '.08em', marginBottom: 14, paddingBottom: 6,
                  borderBottom: '2px solid var(--primary)',
                }}>
                  § 4 — Cost Summary
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>

                  {/* Estimated */}
                  <div style={{
                    border: '1px solid var(--border)', borderRadius: 10,
                    padding: '14px 18px', background: 'var(--surface2)',
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6 }}>
                      Estimated Cost
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>
                      {data.estimated_cost ? formatBaht(data.estimated_cost) : '—'}
                    </div>
                  </div>

                  {/* Actual */}
                  <div style={{
                    border: `1px solid ${data.actual_cost ? 'var(--red)' : 'var(--border)'}`,
                    borderRadius: 10, padding: '14px 18px',
                    background: data.actual_cost ? 'var(--red-bg)' : 'var(--surface2)',
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: data.actual_cost ? 'var(--red-text)' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6 }}>
                      Actual Cost
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: data.actual_cost ? 'var(--red-text)' : 'var(--text-muted)' }}>
                      {data.actual_cost ? formatBaht(data.actual_cost) : '—'}
                    </div>
                  </div>

                  {/* Variance */}
                  {data.actual_cost && data.estimated_cost ? (() => {
                    const diff = parseFloat(data.actual_cost) - parseFloat(data.estimated_cost)
                    const over = diff > 0
                    return (
                      <div style={{
                        border: `1px solid ${over ? 'var(--orange)' : 'var(--green)'}`,
                        borderRadius: 10, padding: '14px 18px',
                        background: over ? 'var(--orange-bg)' : 'var(--green-bg)',
                      }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6 }}>
                          Variance
                        </div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: over ? 'var(--orange-text)' : 'var(--green-text)' }}>
                          {over ? '+' : ''}{formatBaht(diff)}
                        </div>
                      </div>
                    )
                  })() : (
                    <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '14px 18px', background: 'var(--surface2)' }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6 }}>Variance</div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-muted)' }}>—</div>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Section 5: Signatures ── */}
              <div>
                <div style={{
                  fontSize: 11, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase',
                  letterSpacing: '.08em', marginBottom: 20, paddingBottom: 6,
                  borderBottom: '2px solid var(--primary)',
                }}>
                  § 5 — Authorisation Signatures
                </div>
                <div style={{ display: 'flex', gap: 32, justifyContent: 'space-between' }}>
                  <SignatureLine label="Requested By (Tenant)" />
                  <SignatureLine label="Received By (Staff)" />
                  <SignatureLine label="Approved By (Manager)" />
                  <SignatureLine label="Completed By (Technician)" />
                </div>
              </div>

              {/* ── Footer ── */}
              <div style={{
                marginTop: 28, paddingTop: 14,
                borderTop: '1px dashed var(--border)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                fontSize: 11, color: 'var(--text-muted)',
              }}>
                <span>Printed: {new Date().toLocaleString()}</span>
                <span style={{ fontWeight: 700 }}>Voucher Ref: {ticketNo}</span>
                <span>Hostel Management System</span>
              </div>

            </div>
          </div>
        )}

        {ran && !loading && !data && (
          <div className="error-msg">Ticket not found. Please check the Ticket No.</div>
        )}
      </div>


    </>
  )
}
