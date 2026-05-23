import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom'
import { api } from '../services/http'
import { formatBaht } from '../utils/utils'

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'

const ACCENT = '#1a237e'

const statusStyle = (status) => ({
  bg:    status === 'Fully Paid' ? '#e8f5e9' : status === 'Partially Paid' ? '#fff3e0' : '#ffebee',
  color: status === 'Fully Paid' ? '#2e7d32' : status === 'Partially Paid' ? '#e65100' : '#b71c1c',
})

export default function BillingView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const wasCreated = searchParams.get('created') === '1'
  const wasUpdated = searchParams.get('updated') === '1'

  const [bill, setBill]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    setLoading(true)
    api.get(`/api/v1/monthly-bills/${id}`)
      .then(data => { setBill(data); setError(null) })
      .catch(err  => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="loading">Loading…</div>
  if (error) return (
    <div className="page-content">
      <div className="card" style={{ padding: 32, textAlign: 'center' }}>
        <p style={{ color: '#b71c1c', marginBottom: 16 }}>Failed to load bill: {error}</p>
        <button className="btn btn-primary" onClick={() => navigate('/billing')}>Back to Bills</button>
      </div>
    </div>
  )
  if (!bill) return (
    <div className="page-content">
      <div className="card" style={{ padding: 32, textAlign: 'center' }}>
        <p style={{ marginBottom: 16 }}>Bill not found.</p>
        <button className="btn btn-primary" onClick={() => navigate('/billing')}>Back to Bills</button>
      </div>
    </div>
  )

  const ss = statusStyle(bill.status)

  return (
    <div className="invoice-preview">

      {/* ── Topbar: hidden on print ── */}
      <div className="page-header no-print">
        <h3>Bill B{String(bill.bill_no).padStart(4, '0')}</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to="/billing" className="btn btn-outline">← Back</Link>
          <Link to={`/billing/${id}/edit`} className="btn btn-outline">Edit</Link>
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
        background: 'linear-gradient(135deg,#2e7d32,#43a047)',
        borderRadius: 12, padding: '14px 20px', marginBottom: 24,
        boxShadow: '0 2px 12px rgba(46,125,50,.25)',
      }}>
        <span style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </span>
        <div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>
            {wasCreated ? 'Bill Created Successfully' : 'Bill Updated Successfully'}
          </div>
          <div style={{ color: 'rgba(255,255,255,.8)', fontSize: 13 }}>
            {wasCreated ? 'The new bill has been saved to the database.' : 'All changes have been saved to the database.'}
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
              <div style={{ fontSize: 14 }}>{bill.tenant_name || '—'}</div>
              <div style={{ fontSize: 13, color: '#888' }}>Room {bill.room_no || '—'}</div>
            </div>
          </div>

          <div className="doc-meta">
            <div className="doc-title" style={{ color: ACCENT }}>MONTHLY BILL</div>
            <div><span className="label">Bill No:</span> B{String(bill.bill_no).padStart(4, '0')}</div>
            <div><span className="label">Bill Date:</span> {fmt(bill.bill_date)}</div>
            <div><span className="label">Billing Month:</span> {bill.billing_month || '—'}</div>
            <div><span className="label">Due Date:</span> {fmt(bill.due_date)}</div>
            <div style={{ marginTop: 6 }}>
              <span className="doc-badge" style={{ background: ss.bg, color: ss.color }}>{bill.status}</span>
            </div>
          </div>
        </div>

        {/* Charges table */}
        <table className="doc-table">
          <thead>
            <tr style={{ background: ACCENT }}>
              <th>PRODUCT</th>
              <th>DESCRIPTION</th>
              <th className="text-right">QTY</th>
              <th className="text-right">UNIT PRICE</th>
              <th className="text-right">AMOUNT</th>
              <th>NOTES</th>
            </tr>
          </thead>
          <tbody>
            {(bill.line_items || []).map((li, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 600 }}>{li.product_code} — {li.product_name}</td>
                <td style={{ color: '#555' }}>{li.description || '—'}</td>
                <td className="text-right">{li.quantity}</td>
                <td className="text-right">{formatBaht(li.unit_price)}</td>
                <td className="text-right" style={{ fontWeight: 700, color: ACCENT }}>{formatBaht(li.amount)}</td>
                <td style={{ color: '#888' }}>{li.notes || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="doc-totals">
          <div className="doc-totals-note">
            Please settle the balance due by the due date. Contact management for any queries.
          </div>
          <div className="doc-totals-box">
            <div className="doc-totals-row">
              <span>Total Bill Amount:</span>
              <span style={{ fontWeight: 600 }}>{formatBaht(bill.total_bill_amount)}</span>
            </div>
            <div className="doc-totals-row" style={{ color: '#2e7d32' }}>
              <span>Total Paid:</span>
              <span style={{ fontWeight: 600 }}>{formatBaht(bill.total_paid)}</span>
            </div>
            <div className="doc-totals-grand" style={{
              background: bill.status === 'Fully Paid' ? '#e8f5e9' : '#fff0f0',
              color:      bill.status === 'Fully Paid' ? '#2e7d32' : '#b71c1c',
            }}>
              <span>Balance Due:</span>
              <span>{formatBaht(bill.balance_due)}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}