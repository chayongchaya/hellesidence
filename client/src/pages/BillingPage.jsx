import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/http'
import { toast } from 'react-toastify'
import ConfirmDialog from '../components/ConfirmDialog'
import { formatBaht, formatDate, statusClass } from '../utils/utils'

export function BillingPage() {
  const [rows, setRows]       = useState([])
  const [tenants, setTenants] = useState([])
  const [rooms, setRooms]     = useState([])
  const [loading, setLoading] = useState(true)
  const [confirm, setConfirm] = useState(null)
  const [filter, setFilter]   = useState({
    status: '', billing_month_from: '', billing_month_to: '',
    tenant_id: '', room_no: '', search: ''
  })

  useEffect(() => {
    Promise.all([
      api.get('/api/v1/tenants'),
      api.get('/api/v1/rooms'),
    ]).then(([t, r]) => { setTenants(t); setRooms(r) })
  }, [])

  const load = () => {
    setLoading(true)
    let q = '/api/v1/monthly-bills?'
    if (filter.status)               q += `status=${filter.status}&`
    if (filter.billing_month_from)   q += `billing_month_from=${filter.billing_month_from}&`
    if (filter.billing_month_to)     q += `billing_month_to=${filter.billing_month_to}&`
    if (filter.tenant_id)            q += `tenant_id=${filter.tenant_id}&`
    if (filter.room_no)              q += `room_no=${encodeURIComponent(filter.room_no)}&`
    api.get(q).then(data => {
      // Client-side search filter by Bill No or Tenant name
      if (filter.search.trim()) {
        const kw = filter.search.trim().toLowerCase()
        data = data.filter(r =>
          String(r.bill_no).padStart(4,'0').includes(kw) ||
          r.tenant_name?.toLowerCase().includes(kw) ||
          r.room_no?.toLowerCase().includes(kw)
        )
      }
      setRows(data)
    }).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const clearFilter = () => {
    setFilter({ status:'', billing_month_from:'', billing_month_to:'', tenant_id:'', room_no:'', search:'' })
  }

  const handleDelete = async id => {
    try { await api.delete(`/api/v1/monthly-bills/${id}`); toast.success('Deleted'); setConfirm(null); load() }
    catch (err) { toast.error(err.message) }
  }

  const statusBadge = s => s === 'Fully Paid' ? 'paid' : s === 'Partially Paid' ? 'partial' : 'unpaid'

  return (
    <>
      <div className="topbar"><h1><span style={{display:"inline-flex",alignItems:"center",gap:6}}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>Monthly Billing</span></h1></div>
      <div className="page-content">
        <div className="page-header">
          <div><h2>Monthly Bills</h2><p>{rows.length} bills</p></div>
          <div style={{display:'flex', gap:8}}>
            <button onClick={() => window.print()} className="btn btn-outline">🖨 Print</button>
            <Link to="/billing/new" className="btn btn-primary">+ New Bill</Link>
          </div>
        </div>
        <div className="filter-bar" style={{flexWrap:'wrap', gap:12}}>
          {/* Row 1: Search + Tenant + Room */}
          <div className="form-group" style={{minWidth:200, flex:'1 1 200px'}}>
            <label>Search (Bill No / Name)</label>
            <input
              placeholder="e.g. B0001 or tenant name…"
              value={filter.search}
              onChange={e => setFilter(f => ({...f, search:e.target.value}))}
              onKeyDown={e => e.key === 'Enter' && load()}
            />
          </div>
          <div className="form-group" style={{minWidth:180, flex:'1 1 180px'}}>
            <label>Tenant</label>
            <select value={filter.tenant_id} onChange={e => setFilter(f => ({...f, tenant_id:e.target.value}))}>
              <option value="">All</option>
              {tenants.map(t => <option key={t.tenant_id} value={t.tenant_id}>T{String(t.tenant_id).padStart(3,'0')} – {t.name}</option>)}
            </select>
          </div>
          <div className="form-group" style={{minWidth:140, flex:'1 1 140px'}}>
            <label>Room Number</label>
            <select value={filter.room_no} onChange={e => setFilter(f => ({...f, room_no:e.target.value}))}>
              <option value="">All</option>
              {rooms.map(r => <option key={r.room_no} value={r.room_no}>{r.room_no} – {r.room_type}</option>)}
            </select>
          </div>
          <div className="form-group" style={{minWidth:140, flex:'1 1 140px'}}>
            <label>Month From</label>
            <input type="month" value={filter.billing_month_from} onChange={e => setFilter(f => ({...f, billing_month_from:e.target.value}))} />
          </div>
          <div className="form-group" style={{minWidth:140, flex:'1 1 140px'}}>
            <label>Month To</label>
            <input type="month" value={filter.billing_month_to} onChange={e => setFilter(f => ({...f, billing_month_to:e.target.value}))} />
          </div>
          <div className="form-group" style={{minWidth:130, flex:'1 1 130px'}}>
            <label>Status</label>
            <select value={filter.status} onChange={e => setFilter(f => ({...f, status:e.target.value}))}>
              <option value="">All</option>
              <option>Unpaid</option><option>Partially Paid</option><option>Fully Paid</option>
            </select>
          </div>
          <div style={{display:'flex', alignItems:'flex-end', gap:8}}>
            <button className="btn btn-primary" onClick={load}>🔍 Search</button>
            <button className="btn btn-ghost" onClick={clearFilter} title="Clear filters">✕ Clear</button>
          </div>
        </div>
        <div className="card mb-0">
          <div className="tbl-wrap">
            {loading ? <div className="loading">Loading…</div> :
            <table>
              <thead><tr><th>Bill No</th><th>Month</th><th>Tenant</th><th>Room</th><th>Due Date</th><th>Total</th><th>Paid</th><th>Balance</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.bill_no}>
                    <td><strong>B{String(r.bill_no).padStart(4,'0')}</strong></td>
                    <td>{r.billing_month}</td>
                    <td>{r.tenant_name}</td>
                    <td>{r.room_no}</td>
                    <td>{formatDate(r.due_date)}</td>
                    <td>{formatBaht(r.total_bill_amount)}</td>
                    <td style={{color:'#2e7d32'}}>{formatBaht(r.total_paid)}</td>
                    <td style={{color: parseFloat(r.balance_due)>0 ? '#b71c1c' : '#2e7d32', fontWeight:700}}>{formatBaht(r.balance_due)}</td>
                    <td><span className={`badge badge-${statusBadge(r.status)}`}>{r.status}</span></td>
                    <td>
                      <div className="tbl-actions">
                        <Link to={`/billing/${r.bill_no}/edit`} className="btn btn-outline btn-sm">Edit</Link>
                        <button className="btn btn-danger btn-sm" onClick={() => setConfirm(r.bill_no)}>Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!rows.length && <tr><td colSpan={10}><div className="empty-state"><div className="icon">🧾</div><p>No bills found</p></div></td></tr>}
              </tbody>
            </table>}
          </div>
        </div>
      </div>
      {confirm && <ConfirmDialog onConfirm={() => handleDelete(confirm)} onCancel={() => setConfirm(null)} />}
    </>
  )
}

export default BillingPage