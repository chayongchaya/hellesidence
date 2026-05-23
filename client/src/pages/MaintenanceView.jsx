import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom'
import { api } from '../services/http'
import { formatBaht } from '../utils/utils'

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'

const ACCENT = '#bf360c'

const PRIORITY_COLORS = {
  Low:    { bg: '#e8f5e9', color: '#2e7d32' },
  Medium: { bg: '#fff3e0', color: '#e65100' },
  High:   { bg: '#fce4ec', color: '#c62828' },
  Urgent: { bg: '#b71c1c', color: '#fff'    },
}
const STATUS_COLORS = {
  Pending:       { bg: '#fff8e1', color: '#f57f17' },
  'In Progress': { bg: '#e3f2fd', color: '#1565c0' },
  Completed:     { bg: '#e8f5e9', color: '#2e7d32' },
}

export default function MaintenanceView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const wasCreated = searchParams.get("created") === "1"
  const wasUpdated = searchParams.get("updated") === "1"

  const [ticket, setTicket]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    api.get(`/api/v1/maintenance-tickets/${id}`)
      .then(data => { setTicket(data); setError(null) })
      .catch(err  => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="loading">Loading…</div>
  if (error) return (
    <div className="page-content">
      <div className="card" style={{ padding: 32, textAlign: 'center' }}>
        <p style={{ color: '#b71c1c', marginBottom: 16 }}>Failed to load ticket: {error}</p>
        <button className="btn btn-primary" onClick={() => navigate('/maintenance')}>Back to Maintenance</button>
      </div>
    </div>
  )
  if (!ticket) return (
    <div className="page-content">
      <div className="card" style={{ padding: 32, textAlign: 'center' }}>
        <p style={{ marginBottom: 16 }}>Ticket not found.</p>
        <button className="btn btn-primary" onClick={() => navigate('/maintenance')}>Back to Maintenance</button>
      </div>
    </div>
  )

  const pc = PRIORITY_COLORS[ticket.priority_level] || PRIORITY_COLORS.Medium
  const sc = STATUS_COLORS[ticket.status]           || STATUS_COLORS.Pending

  return (
    <div className="invoice-preview">

      {/* ── Topbar: hidden on print ── */}
      <div className="page-header no-print">
        <h3>Ticket M{String(ticket.ticket_no).padStart(4, '0')}</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to="/maintenance" className="btn btn-outline">← Back</Link>
          <Link to={`/maintenance/${id}/edit`} className="btn btn-outline">Edit</Link>
          <button onClick={() => window.print()} className="btn btn-primary">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
            </svg>
            Print PDF
          </button>
        </div>
      </div>

      {/* ── Success banner ── */}
      {(wasCreated || wasUpdated) && (
      <div className="no-print" style={{
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'linear-gradient(135deg,#e65100,#f4511e)',
        borderRadius: 12, padding: '14px 20px', marginBottom: 24,
        boxShadow: '0 2px 12px rgba(230,81,0,.2)',
      }}>
        <span style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </span>
        <div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>
            {wasCreated ? 'Maintenance Ticket Created Successfully' : 'Maintenance Ticket Updated Successfully'}
          </div>
          <div style={{ color: 'rgba(255,255,255,.8)', fontSize: 13 }}>
            {wasCreated ? 'The new ticket has been saved to the database.' : 'All changes have been saved to the database.'}
          </div>
        </div>
      </div>
      )}

      {/* ══ PRINTABLE DOCUMENT ════════════════════════════════ */}
      <div className="card" style={{ padding: 40 }}>

        {/* Header */}
        <div className="doc-header">
          <div>
            <div className="doc-brand" style={{ color: ACCENT }}>Hellesidence</div>
            <div className="doc-subtitle">Dormitory Management System</div>
            <div style={{ marginTop: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>Tenant</div>
              <div style={{ fontSize: 14 }}>{ticket.tenant_name || '—'}</div>
              <div style={{ fontSize: 13, color: '#888' }}>Room {ticket.room_no || '—'}</div>
            </div>
          </div>

          <div className="doc-meta">
            <div className="doc-title" style={{ color: ACCENT }}>MAINTENANCE TICKET</div>
            <div><span className="label">Ticket No:</span> M{String(ticket.ticket_no).padStart(4, '0')}</div>
            <div><span className="label">Request Date:</span> {fmt(ticket.request_date)}</div>
            <div><span className="label">Issue Type:</span> {ticket.issue_type || '—'}</div>
            <div><span className="label">Technician:</span> {ticket.technician_name || 'Not assigned'}</div>
            {ticket.completion_date && (
              <div><span className="label">Completed:</span> {fmt(ticket.completion_date)}</div>
            )}
            <div style={{ marginTop: 6, display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
              <span className="doc-badge" style={{ background: pc.bg, color: pc.color }}>{ticket.priority_level}</span>
              <span className="doc-badge" style={{ background: sc.bg, color: sc.color }}>{ticket.status}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        {ticket.description && (
          <div style={{ background: '#fff8f5', border: '1px solid #ffe0d0', borderRadius: 8, padding: '14px 18px', marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: ACCENT, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6 }}>Description</div>
            <div style={{ fontSize: 14, color: '#333', lineHeight: 1.7 }}>{ticket.description}</div>
          </div>
        )}

        {/* Cost table */}
        <table className="doc-table">
          <thead>
            <tr style={{ background: ACCENT }}>
              <th>COST BREAKDOWN</th>
              <th className="text-right">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ color: '#555' }}>Estimated Cost</td>
              <td className="text-right">{ticket.estimated_cost ? formatBaht(ticket.estimated_cost) : '—'}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 600 }}>Actual Cost</td>
              <td className="text-right" style={{ fontWeight: 700, color: ACCENT }}>
                {ticket.actual_cost ? formatBaht(ticket.actual_cost) : '—'}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Signature lines */}
        <div className="doc-signatures">
          <div>
            <div className="doc-sig-line">Tenant Signature</div>
            <div className="doc-sig-name">{ticket.tenant_name || '—'}</div>
          </div>
          <div>
            <div className="doc-sig-line">Technician</div>
            <div className="doc-sig-name">{ticket.technician_name || '—'}</div>
          </div>
        </div>

      </div>
    </div>
  )
}