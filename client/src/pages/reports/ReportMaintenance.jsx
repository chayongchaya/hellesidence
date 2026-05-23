import { useNavigate } from 'react-router-dom'
import ReportTopbar from '../../components/ReportTopbar'
import { useState } from 'react'
import { api } from '../../services/http'
import { formatDate } from '../../utils/utils'

export default function ReportMaintenance() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState({ date_from:'', date_to:'', status:'', issue_type:'', priority_level:'' })
  const [ran, setRan] = useState(false)

  const run = () => {
    setLoading(true); setRan(true)
    let q = '/api/v1/reports/maintenance?'
    if (filter.date_from) q += `date_from=${filter.date_from}&`
    if (filter.date_to) q += `date_to=${filter.date_to}&`
    if (filter.status) q += `status=${filter.status}&`
    if (filter.issue_type) q += `issue_type=${filter.issue_type}&`
    if (filter.priority_level) q += `priority_level=${filter.priority_level}&`
    api.get(q).then(setRows).finally(() => setLoading(false))
  }
  const pBadge = p => ({High:'high',Urgent:'urgent',Medium:'medium',Low:'low'}[p]||'default')
  const sBadge = s => ({Pending:'pending','In Progress':'progress',Completed:'completed'}[s]||'default')

  return (
    <>
      <ReportTopbar title="Maintenance Requests" />
      <div className="page-content">
        <div className="card">
          <div className="card-header" style={{gap:8}}><span style={{fontSize:16}}>🔎</span><h3>Filter & Parameters</h3></div>
          <div className="card-body">
            <div className="filter-bar" style={{background:'transparent',border:'none',padding:0}}>
              <div className="form-group"><label>Date From</label><input type="date" value={filter.date_from} onChange={e=>setFilter(f=>({...f,date_from:e.target.value}))}/></div>
              <div className="form-group"><label>Date To</label><input type="date" value={filter.date_to} onChange={e=>setFilter(f=>({...f,date_to:e.target.value}))}/></div>
              <div className="form-group"><label>Status</label>
                <select value={filter.status} onChange={e=>setFilter(f=>({...f,status:e.target.value}))}>
                  <option value="">All</option><option>Pending</option><option>In Progress</option><option>Completed</option>
                </select>
              </div>
              <div className="form-group"><label>Issue Type</label>
                <select value={filter.issue_type} onChange={e=>setFilter(f=>({...f,issue_type:e.target.value}))}>
                  <option value="">All</option><option>Plumbing</option><option>Electrical</option><option>Furniture</option><option>Other</option>
                </select>
              </div>
              <div className="form-group"><label>Priority</label>
                <select value={filter.priority_level} onChange={e=>setFilter(f=>({...f,priority_level:e.target.value}))}>
                  <option value="">All</option><option>Low</option><option>Medium</option><option>High</option><option>Urgent</option>
                </select>
              </div>
              <button className="btn btn-primary" onClick={run}>Run Report</button>
            </div>
          </div>
        </div>
        {ran && (
          <div className="card mb-0">
            <div className="card-header" style={{background:'var(--primary)',color:'#fff'}}>
              <h3 style={{color:'#fff'}}>Maintenance Requests — {rows.length} records</h3>
            </div>
            <div className="tbl-wrap">
              {loading ? <div className="loading">Loading…</div> :
              <table>
                <thead><tr><th>Ticket No</th><th>Date</th><th>Room</th><th>Tenant</th><th>Issue Type</th><th>Description</th><th>Priority</th><th>Status</th><th>Technician</th><th>Actual Cost</th></tr></thead>
                <tbody>
                  {rows.map(r=>(
                    <tr key={r.ticket_id}>
                      <td><strong>MX{String(r.ticket_id).padStart(4,'0')}</strong></td>
                      <td>{formatDate(r.request_date)}</td>
                      <td>{r.room_no}</td>
                      <td>{r.tenant_name}</td>
                      <td>{r.issue_type}</td>
                      <td style={{maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.description}</td>
                      <td><span className={`badge badge-${pBadge(r.priority_level)}`}>{r.priority_level}</span></td>
                      <td><span className={`badge badge-${sBadge(r.status)}`}>{r.status}</span></td>
                      <td>{r.technician_name||'—'}</td>
                      <td>{r.actual_cost==='—'?'—':`฿${Number(r.actual_cost).toLocaleString()}`}</td>
                    </tr>
                  ))}
                  {!rows.length&&<tr><td colSpan={10} style={{textAlign:'center',color:'var(--text-muted)',padding:20}}>No data</td></tr>}
                </tbody>
              </table>}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
