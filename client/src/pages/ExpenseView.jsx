import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom'
import { api } from '../services/http'
import { formatBaht } from '../utils/utils'

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'

const ACCENT = '#4a148c'

export default function ExpenseView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const wasCreated = searchParams.get("created") === "1"
  const wasUpdated = searchParams.get("updated") === "1"

  const [expense, setExpense] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    api.get(`/api/v1/expenses/${id}`)
      .then(data => { setExpense(data); setError(null) })
      .catch(err  => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="loading">Loading…</div>
  if (error) return (
    <div className="page-content">
      <div className="card" style={{ padding: 32, textAlign: 'center' }}>
        <p style={{ color: '#b71c1c', marginBottom: 16 }}>Failed to load expense: {error}</p>
        <button className="btn btn-primary" onClick={() => navigate('/expenses')}>Back to Expenses</button>
      </div>
    </div>
  )
  if (!expense) return (
    <div className="page-content">
      <div className="card" style={{ padding: 32, textAlign: 'center' }}>
        <p style={{ marginBottom: 16 }}>Expense not found.</p>
        <button className="btn btn-primary" onClick={() => navigate('/expenses')}>Back to Expenses</button>
      </div>
    </div>
  )

  const lineTotal = (li) => parseFloat(li.quantity || 0) * parseFloat(li.unit_price || 0)
  const total     = expense.total_amount || (expense.line_items || []).reduce((s, l) => s + lineTotal(l), 0)

  return (
    <div className="invoice-preview">

      {/* ── Topbar: hidden on print ── */}
      <div className="page-header no-print">
        <h3>Expense E{String(expense.expense_no).padStart(4, '0')}</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to="/expenses" className="btn btn-outline">← Back</Link>
          <Link to={`/expenses/${id}/edit`} className="btn btn-outline">Edit</Link>
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
        background: 'linear-gradient(135deg,#4a148c,#6a1b9a)',
        borderRadius: 12, padding: '14px 20px', marginBottom: 24,
        boxShadow: '0 2px 12px rgba(74,20,140,.2)',
      }}>
        <span style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </span>
        <div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>
            {wasCreated ? 'Expense Created Successfully' : 'Expense Updated Successfully'}
          </div>
          <div style={{ color: 'rgba(255,255,255,.8)', fontSize: 13 }}>
            {wasCreated ? 'The new expense has been saved to the database.' : 'All changes have been saved to the database.'}
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
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>Supplier</div>
              <div style={{ fontSize: 14 }}>{expense.supplier_name || '—'}</div>
              <div style={{ fontSize: 13, color: '#888' }}>{expense.expense_category || '—'}</div>
            </div>
          </div>

          <div className="doc-meta">
            <div className="doc-title" style={{ color: ACCENT }}>EXPENSE VOUCHER</div>
            <div><span className="label">Expense No:</span> E{String(expense.expense_no).padStart(4, '0')}</div>
            <div><span className="label">Date:</span> {fmt(expense.expense_date)}</div>
            <div><span className="label">Category:</span> {expense.expense_category || '—'}</div>
          </div>
        </div>

        {/* Items table */}
        <table className="doc-table">
          <thead>
            <tr style={{ background: ACCENT }}>
              <th>ITEM NAME</th>
              <th className="text-right">QTY</th>
              <th className="text-right">UNIT PRICE</th>
              <th className="text-right">EXTENDED PRICE</th>
            </tr>
          </thead>
          <tbody>
            {(expense.line_items || []).map((li, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 500 }}>{li.item_name}</td>
                <td className="text-right">{li.quantity}</td>
                <td className="text-right">{formatBaht(li.unit_price)}</td>
                <td className="text-right" style={{ fontWeight: 700, color: ACCENT }}>{formatBaht(lineTotal(li))}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="doc-totals">
          <div className="doc-totals-note">
            This expense voucher records a purchase or expenditure made on behalf of Hellesidence Dormitory.
          </div>
          <div className="doc-totals-box">
            <div className="doc-totals-grand" style={{ background: '#f3e5f5', color: ACCENT }}>
              <span>Total Expense:</span>
              <span>{formatBaht(total)}</span>
            </div>
          </div>
        </div>

        {/* Signature lines */}
        <div className="doc-signatures">
          <div>
            <div className="doc-sig-line">Approved By</div>
            <div className="doc-sig-name">Hellesidence Management</div>
          </div>
          <div>
            <div className="doc-sig-line">Received By / Supplier</div>
            <div className="doc-sig-name">{expense.supplier_name || '—'}</div>
          </div>
        </div>

      </div>
    </div>
  )
}