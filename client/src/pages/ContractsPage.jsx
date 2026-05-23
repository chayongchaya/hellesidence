import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/http'
import { toast } from 'react-toastify'
import ConfirmDialog from '../components/ConfirmDialog'
import { formatBaht, formatDate } from '../utils/utils'

export default function ContractsPage() {
  const [rows, setRows]   = useState([])
  const [loading, setLoading] = useState(true)
  const [confirm, setConfirm] = useState(null)
  const [filter, setFilter] = useState({ date_from:'', date_to:'', search:'' })

  const load = () => {
    setLoading(true)
    let q = '/api/v1/contracts?'
    if (filter.date_from) q += `date_from=${filter.date_from}&`
    if (filter.date_to)   q += `date_to=${filter.date_to}&`
    api.get(q).then(data => {
      if (filter.search.trim()) {
        const kw = filter.search.trim().toLowerCase()
        data = data.filter(r =>
          String(r.contract_no).padStart(4,'0').includes(kw) ||
          r.tenant_name?.toLowerCase().includes(kw) ||
          r.room_no?.toLowerCase().includes(kw)
        )
      }
      setRows(data)
    }).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const clearFilter = () => setFilter({ date_from:'', date_to:'', search:'' })

  const handleDelete = async id => {
    try { await api.delete(`/api/v1/contracts/${id}`); toast.success('Deleted'); setConfirm(null); load() }
    catch (err) { toast.error(err.message) }
  }

  const statusColor = s => s === 'Active' ? 'active' : s === 'Expiring' ? 'expiring' : 'expired'

  const stats = { total: rows.length, active: rows.filter(r=>r.status==='Active').length, expiring: rows.filter(r=>r.status==='Expiring').length, expired: rows.filter(r=>r.status==='Expired').length }

  return (
    <>
      <div className="topbar"><h1>📋 Rental Contracts</h1></div>
      <div className="page-content">
        <div className="page-header">
          <div>
            <h2>Rental Contracts</h2>
            <p>{rows.length} contracts</p>
          </div>
          <div style={{display:'flex', gap:8}}>
            <button onClick={() => window.print()} className="btn btn-outline">🖨 Print</button>
            <Link to="/contracts/new" className="btn btn-primary">+ New Contract</Link>
          </div>
        </div>

        <div className="stats-row">
          <div className="stat-card"><div className="stat-label">Total</div><div className="stat-value">{stats.total}</div></div>
          <div className="stat-card green"><div className="stat-label">Active</div><div className="stat-value">{stats.active}</div></div>
          <div className="stat-card orange"><div className="stat-label">Expiring Soon</div><div className="stat-value">{stats.expiring}</div></div>
          <div className="stat-card accent"><div className="stat-label">Expired</div><div className="stat-value">{stats.expired}</div></div>
        </div>

        <div className="filter-bar" style={{flexWrap:'wrap',gap:12}}>
          <div className="form-group" style={{minWidth:200,flex:'1 1 200px'}}>
            <label>Search (Contract No / Name / Room)</label>
            <input placeholder="e.g. C0001, tenant name, 101…" value={filter.search} onChange={e => setFilter(f => ({...f, search:e.target.value}))} onKeyDown={e => e.key==='Enter' && load()} />
          </div>
          <div className="form-group" style={{minWidth:140,flex:'1 1 140px'}}>
            <label>Date From</label>
            <input type="date" value={filter.date_from} onChange={e => setFilter(f => ({...f, date_from:e.target.value}))} />
          </div>
          <div className="form-group" style={{minWidth:140,flex:'1 1 140px'}}>
            <label>Date To</label>
            <input type="date" value={filter.date_to} onChange={e => setFilter(f => ({...f, date_to:e.target.value}))} />
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
              <thead><tr><th>Contract No</th><th>Date</th><th>Tenant</th><th>Room</th><th>Start</th><th>End</th><th>Monthly Rent</th><th>Total Value</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {rows.map(r => (
                    <tr key={r.contract_no}>
                      <td><strong>C{String(r.contract_no).padStart(4,'0')}</strong></td>
                      <td>{formatDate(r.contract_date)}</td>
                      <td>{r.tenant_name}</td>
                      <td>{r.room_no} <small style={{color:'#888'}}>({r.room_type})</small></td>
                      <td>{formatDate(r.start_date)}</td>
                      <td>{formatDate(r.end_date)}</td>
                      <td>{formatBaht(r.monthly_rent)}</td>
                      <td>{formatBaht(r.total_contract_value)}</td>
                      <td><span className={`badge badge-${statusColor(r.status)}`}>{r.status}</span></td>
                      <td>
                        <div className="tbl-actions">
                          <Link to={`/contracts/${r.contract_no}/edit`} className="btn btn-outline btn-sm">Edit</Link>
                          <button className="btn btn-danger btn-sm" onClick={() => setConfirm(r.contract_no)}>Del</button>
                        </div>
                      </td>
                    </tr>
                ))}
                {!rows.length && <tr><td colSpan={10}><div className="empty-state"><div className="icon">📋</div><p>No contracts found</p></div></td></tr>}
              </tbody>
            </table>}
          </div>
        </div>
      </div>
      {confirm && <ConfirmDialog message="Delete this contract?" onConfirm={() => handleDelete(confirm)} onCancel={() => setConfirm(null)} />}
    </>
  )
}