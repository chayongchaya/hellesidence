import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/http'
import { toast } from 'react-toastify'
import ConfirmDialog from '../components/ConfirmDialog'
import { formatDate } from '../utils/utils'

export default function MaintenancePage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirm, setConfirm] = useState(null)
  const [filter, setFilter] = useState({ status: '', priority_level: '', issue_type: '', search: '' })

  const load = () => {
    setLoading(true)
    let q = '/api/v1/maintenance-tickets?'
    if (filter.status) q += `status=${filter.status}&`
    if (filter.priority_level) q += `priority_level=${filter.priority_level}&`
    if (filter.issue_type) q += `issue_type=${filter.issue_type}&`
    api.get(q).then(data => {
      if (filter.search.trim()) {
        const kw = filter.search.trim().toLowerCase()
        data = data.filter(r =>
          String(r.ticket_no).padStart(4,'0').includes(kw) ||
          r.tenant_name?.toLowerCase().includes(kw) ||
          r.room_no?.toLowerCase().includes(kw) ||
          r.issue_type?.toLowerCase().includes(kw) ||
          r.description?.toLowerCase().includes(kw)
        )
      }
      setRows(data)
    }).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const clearFilter = () => setFilter({ status:'', priority_level:'', issue_type:'', search:'' })

  const handleDelete = async id => {
    try { await api.delete(`/api/v1/maintenance-tickets/${id}`); toast.success('Deleted'); setConfirm(null); load() }
    catch (err) { toast.error(err.message) }
  }

  const priorityBadge = p => ({ High: 'high', Urgent: 'urgent', Medium: 'medium', Low: 'low' }[p] || 'default')
  const statusBadge = s => ({ Pending: 'pending', 'In Progress': 'progress', Completed: 'completed' }[s] || 'default')

  return (
    <>
      <div className="topbar"><h1><span style={{display:"inline-flex",alignItems:"center",gap:6}}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>Maintenance Tickets</span></h1></div>
      <div className="page-content">
        <div className="page-header">
          <div>
            <h2>Maintenance Requests</h2>
            <p>{rows.length} tickets</p>
          </div>
          <div style={{display:'flex', gap:8}}>
            <button onClick={() => window.print()} className="btn btn-outline">🖨 Print</button>
            <Link to="/maintenance/new" className="btn btn-primary">+ New Ticket</Link>
          </div>
        </div>

        <div className="stats-row">
          {[
            { label: 'Pending',     cls: 'orange' },
            { label: 'In Progress', cls: 'blue'   },
            { label: 'Completed',   cls: 'green'  },
          ].map(({ label, cls }) => (
            <div key={label} className={`stat-card ${cls}`} style={{cursor:'pointer'}} onClick={() => setFilter(f => ({...f, status: f.status===label?'':label}))}>
              <div className="stat-label">{label}</div>
              <div className="stat-value" style={{fontSize:22}}>{rows.filter(r=>r.status===label).length}</div>
            </div>
          ))}
        </div>

        <div className="filter-bar" style={{flexWrap:'wrap',gap:12}}>
          <div className="form-group" style={{minWidth:200,flex:'1 1 200px'}}>
            <label>Search (Ticket No / Name / Room / Issue)</label>
            <input placeholder="e.g. MX0001, tenant name, 101…" value={filter.search} onChange={e => setFilter(f => ({...f, search:e.target.value}))} onKeyDown={e => e.key==='Enter' && load()} />
          </div>
          <div className="form-group" style={{minWidth:130,flex:'1 1 130px'}}>
            <label>Status</label>
            <select value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}>
              <option value="">All</option><option>Pending</option><option>In Progress</option><option>Completed</option>
            </select>
          </div>
          <div className="form-group" style={{minWidth:120,flex:'1 1 120px'}}>
            <label>Priority</label>
            <select value={filter.priority_level} onChange={e => setFilter(f => ({ ...f, priority_level: e.target.value }))}>
              <option value="">All</option><option>Low</option><option>Medium</option><option>High</option><option>Urgent</option>
            </select>
          </div>
          <div className="form-group" style={{minWidth:130,flex:'1 1 130px'}}>
            <label>Issue Type</label>
            <select value={filter.issue_type} onChange={e => setFilter(f => ({ ...f, issue_type: e.target.value }))}>
              <option value="">All</option><option>Plumbing</option><option>Electrical</option><option>Furniture</option><option>Other</option>
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
              <thead><tr><th>Ticket No</th><th>Date</th><th>Room</th><th>Tenant</th><th>Issue Type</th><th>Priority</th><th>Status</th><th>Technician</th><th>Actions</th></tr></thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.ticket_no}>
                    <td><strong>MX{String(r.ticket_no).padStart(4,'0')}</strong></td>
                    <td>{formatDate(r.request_date)}</td>
                    <td>{r.room_no}</td>
                    <td>{r.tenant_name}</td>
                    <td>{r.issue_type}</td>
                    <td><span className={`badge badge-${priorityBadge(r.priority_level)}`}>{r.priority_level}</span></td>
                    <td><span className={`badge badge-${statusBadge(r.status)}`}>{r.status}</span></td>
                    <td>{r.technician_name || '—'}</td>
                    <td>
                      <div className="tbl-actions">
                        <Link to={`/maintenance/${r.ticket_no}/edit`} className="btn btn-outline btn-sm">Edit</Link>
                        <button className="btn btn-danger btn-sm" onClick={() => setConfirm(r.ticket_no)}>Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!rows.length && <tr><td colSpan={9}><div className="empty-state"><div className="icon">🔧</div><p>No tickets found</p></div></td></tr>}
              </tbody>
            </table>}
          </div>
        </div>
      </div>
      {confirm && <ConfirmDialog onConfirm={() => handleDelete(confirm)} onCancel={() => setConfirm(null)} />}
    </>
  )
}