import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom'
import { api } from '../services/http'
import { formatBaht } from '../utils/utils'
import ConfirmDialog from '../components/ConfirmDialog'

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'

const ACCENT = '#2e7d32'

export default function PaymentView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const wasCreated = searchParams.get('created') === '1'

  const [receipt, setReceipt]         = useState(null)
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  useEffect(() => {
    api.get(`/api/v1/payment-receipts/${id}`)
      .then(data => { setReceipt(data); setError(null) })
      .catch(err  => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  const handleDelete = async () => {
    try {
      await api.delete(`/api/v1/payment-receipts/${id}`)
      navigate('/payments')
    } catch (e) {
      setError(e.message)
      setConfirmOpen(false)
    }
  }

  if (loading) return <div className="loading">Loading…</div>
  if (error) return (
    <div className="page-content">
      <div className="card" style={{ padding: 32, textAlign: 'center' }}>
        <p style={{ color: '#b71c1c', marginBottom: 16 }}>Failed to load receipt: {error}</p>
        <button className="btn btn-primary" onClick={() => navigate('/payments')}>Back to Payments</button>
      </div>
    </div>
  )
  if (!receipt) return (
    <div className="page-content">
      <div className="card" style={{ padding: 32, textAlign: 'center' }}>
        <p style={{ marginBottom: 16 }}>Receipt not found.</p>
        <button className="btn btn-primary" onClick={() => navigate('/payments')}>Back to Payments</button>
      </div>
    </div>
  )

  const totalPaid = receipt.total_paid ||
    (receipt.line_items || []).reduce((s, l) => s + parseFloat(l.amount_paid || 0), 0)

  return (
    <div className="invoice-preview">

      {confirmOpen && (
        <ConfirmDialog
          message="Delete this payment receipt? This cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setConfirmOpen(false)}
        />
      )}

      {/* ── Topbar: hidden on print ── */}
      <div className="page-header no-print">
        <h3>Receipt R{String(receipt.receipt_no).padStart(4, '0')}</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to="/payments" className="btn btn-outline">← Back</Link>
          <button onClick={() => setConfirmOpen(true)} className="btn btn-danger">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
            Delete
          </button>
          <button onClick={() => window.print()} className="btn btn-primary">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
            </svg>
            Print PDF
          </button>
        </div>
      </div>

      {/* ── Success banner ── */}
      {wasCreated && (
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
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Payment Receipt Created Successfully</div>
            <div style={{ color: 'rgba(255,255,255,.8)', fontSize: 13 }}>The receipt has been saved. Receipts cannot be edited — delete and re-create if a correction is needed.</div>
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
              <div style={{ fontSize: 14 }}>{receipt.tenant_name || '—'}</div>
              <div style={{ fontSize: 13, color: '#888' }}>Room {receipt.room_no || '—'}</div>
            </div>
          </div>

          <div className="doc-meta">
            <div className="doc-title" style={{ color: ACCENT }}>PAYMENT RECEIPT</div>
            <div><span className="label">Receipt No:</span> R{String(receipt.receipt_no).padStart(4, '0')}</div>
            <div><span className="label">Date:</span> {fmt(receipt.receipt_date)}</div>
            <div><span className="label">Payment Method:</span> {receipt.payment_method || '—'}</div>
            {receipt.reference_number && (
              <div><span className="label">Reference:</span> {receipt.reference_number}</div>
            )}
          </div>
        </div>

        {/* Bills paid table — receipt format */}
        <table className="doc-table receipt-table">
          <thead>
            <tr style={{ background: ACCENT }}>
              <th>INVOICE NO</th>
              <th className="text-right">AMOUNT DUE</th>
              <th className="text-right">ALREADY RECEIVED</th>
              <th className="text-right">BALANCE BEFORE</th>
              <th className="text-right">AMOUNT RECEIVED HERE</th>
              <th className="text-right">BALANCE AFTER</th>
            </tr>
          </thead>
          <tbody>
            {(receipt.line_items || []).map((li, i) => {
              const due        = parseFloat(li.bill_total_amount || 0)
              const alreadyRec = parseFloat(li.already_received  || 0)
              const amtPaid    = parseFloat(li.amount_paid        || 0)
              const balBefore  = due - alreadyRec
              const balAfter   = balBefore - amtPaid
              return (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>INV-{String(li.bill_no).padStart(3, '0')}</td>
                  <td className="text-right">{formatBaht(due)}</td>
                  <td className="text-right">{formatBaht(alreadyRec)}</td>
                  <td className="text-right">{formatBaht(balBefore)}</td>
                  <td className="text-right" style={{ fontWeight: 700, color: ACCENT }}>{formatBaht(amtPaid)}</td>
                  <td className="text-right" style={{ color: balAfter <= 0 ? '#2e7d32' : '#b71c1c', fontWeight: 600 }}>{formatBaht(balAfter)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Totals */}
        <div className="doc-totals">
          <div className="doc-totals-note">
            Thank you for your payment. Please keep this receipt for your records.
          </div>
          <div className="doc-totals-box">
            <div className="doc-totals-grand" style={{ background: '#e8f5e9', color: ACCENT }}>
              <span>Total Received:</span>
              <span>{formatBaht(totalPaid)}</span>
            </div>
          </div>
        </div>

        {/* Signature lines */}
        <div className="doc-signatures">
          <div>
            <div className="doc-sig-line">Tenant Signature</div>
            <div className="doc-sig-name">{receipt.tenant_name || '—'}</div>
          </div>
          <div>
            <div className="doc-sig-line">Received By</div>
            <div className="doc-sig-name">Hellesidence Management</div>
          </div>
        </div>

      </div>
    </div>
  )
}