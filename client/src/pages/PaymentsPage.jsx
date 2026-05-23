import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/http'
import { toast } from 'react-toastify'
import ConfirmDialog from '../components/ConfirmDialog'
import { formatBaht, formatDate } from '../utils/utils'

export function PaymentsPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirm, setConfirm] = useState(null)
  const [filter, setFilter] = useState({ date_from:'', date_to:'', payment_method:'', search:'' })

  const load = () => {
    setLoading(true)
    let q = '/api/v1/payment-receipts?'
    if (filter.date_from) q += `date_from=${filter.date_from}&`
    if (filter.date_to) q += `date_to=${filter.date_to}&`
    if (filter.payment_method) q += `payment_method=${filter.payment_method}&`
    api.get(q).then(data => {
      if (filter.search.trim()) {
        const kw = filter.search.trim().toLowerCase()
        data = data.filter(r =>
          String(r.receipt_no).padStart(4,'0').includes(kw) ||
          r.tenant_name?.toLowerCase().includes(kw) ||
          r.room_no?.toLowerCase().includes(kw) ||
          r.reference_number?.toLowerCase().includes(kw)
        )
      }
      setRows(data)
    }).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const clearFilter = () => setFilter({ date_from:'', date_to:'', payment_method:'', search:'' })

  const handleDelete = async id => {
    try { await api.delete(`/api/v1/payment-receipts/${id}`); toast.success('Deleted'); setConfirm(null); load() }
    catch (err) { toast.error(err.message) }
  }

  return (
    <>
      <div className="topbar"><h1><span style={{display:"inline-flex",alignItems:"center",gap:6}}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>Payment Receipts</span></h1></div>
      <div className="page-content">
        <div className="page-header">
          <div><h2>Payment Receipts</h2><p>{rows.length} receipts</p></div>
          <div style={{display:'flex', gap:8}}>
            <button onClick={() => window.print()} className="btn btn-outline">🖨 Print</button>
            <Link to="/payments/new" className="btn btn-primary">+ New Receipt</Link>
          </div>
        </div>
        <div className="filter-bar" style={{flexWrap:'wrap',gap:12}}>
          <div className="form-group" style={{minWidth:200,flex:'1 1 200px'}}>
            <label>Search (Receipt No / Name / Room / Ref)</label>
            <input placeholder="e.g. R0001, tenant name, 101…" value={filter.search} onChange={e => setFilter(f => ({...f, search:e.target.value}))} onKeyDown={e => e.key==='Enter' && load()} />
          </div>
          <div className="form-group" style={{minWidth:140,flex:'1 1 140px'}}>
            <label>Date From</label>
            <input type="date" value={filter.date_from} onChange={e => setFilter(f => ({...f, date_from:e.target.value}))} />
          </div>
          <div className="form-group" style={{minWidth:140,flex:'1 1 140px'}}>
            <label>Date To</label>
            <input type="date" value={filter.date_to} onChange={e => setFilter(f => ({...f, date_to:e.target.value}))} />
          </div>
          <div className="form-group" style={{minWidth:120,flex:'1 1 120px'}}>
            <label>Method</label>
            <select value={filter.payment_method} onChange={e => setFilter(f => ({...f, payment_method:e.target.value}))}>
              <option value="">All</option><option>Cash</option><option>Transfer</option><option>Card</option>
            </select>
          </div>
          <div style={{display:'flex',alignItems:'flex-end',gap:8}}>
            <button className="btn btn-primary" onClick={load}>🔍 Search</button>
            <button className="btn btn-ghost" onClick={clearFilter}>✕ Clear</button>
          </div>
        </div>
        <div className="card mb-0">
          <div className="tbl-wrap">
            {loading ? <div className="loading">Loading…</div> :
            <table>
              <thead><tr><th>Receipt No</th><th>Date</th><th>Tenant</th><th>Room</th><th>Method</th><th>Reference</th><th>Total Paid</th><th>Actions</th></tr></thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.receipt_no}>
                    <td><strong>R{String(r.receipt_no).padStart(4,'0')}</strong></td>
                    <td>{formatDate(r.receipt_date)}</td>
                    <td>{r.tenant_name}</td>
                    <td>{r.room_no}</td>
                    <td><span className="badge badge-active">{r.payment_method}</span></td>
                    <td>{r.reference_number || '—'}</td>
                    <td style={{fontWeight:700, color:'#2e7d32'}}>{formatBaht(r.total_paid)}</td>
                    <td>
                      <div className="tbl-actions">
                        <Link to={`/payments/${r.receipt_no}/view`} className="btn btn-outline btn-sm">View</Link>
                        <button className="btn btn-danger btn-sm" onClick={() => setConfirm(r.receipt_no)}>Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!rows.length && <tr><td colSpan={8}><div className="empty-state"><div className="icon">💳</div><p>No receipts found</p></div></td></tr>}
              </tbody>
            </table>}
          </div>
        </div>
      </div>
      {confirm && <ConfirmDialog onConfirm={() => handleDelete(confirm)} onCancel={() => setConfirm(null)} />}
    </>
  )
}

export default PaymentsPage