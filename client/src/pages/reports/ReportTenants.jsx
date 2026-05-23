import { useNavigate } from 'react-router-dom'
import ReportTopbar from '../../components/ReportTopbar'
import { useEffect, useState, useCallback } from 'react'
import { api } from '../../services/http'
import { formatDate } from '../../utils/utils'

export default function ReportTenants() {
  const [rows, setRows] = useState([])
  const [types, setTypes] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState({ name:'', room_type_id:'' })
  const [ran, setRan] = useState(false)

  useEffect(() => { api.get('/api/v1/room-types').then(setTypes) }, [])

  const run = () => {
    setLoading(true); setRan(true)
    let q = '/api/v1/reports/tenants?'
    if (filter.name) q += `name=${encodeURIComponent(filter.name)}&`
    if (filter.room_type_id) q += `room_type_id=${filter.room_type_id}&`
    api.get(q).then(setRows).finally(() => setLoading(false))
  }

  return (
    <>
      <ReportTopbar title="Tenant List" />
      <div className="page-content">
        <div className="card">
          <div className="card-header" style={{gap:8}}><span style={{fontSize:16}}>🔎</span><h3>Filter & Parameters</h3></div>
          <div className="card-body">
            <div className="filter-bar" style={{background:'transparent',border:'none',padding:0}}>
              <div className="form-group"><label>Name / Search</label><input value={filter.name} onChange={e=>setFilter(f=>({...f,name:e.target.value}))} placeholder="Tenant name…"/></div>
              <div className="form-group"><label>Room Type</label>
                <select value={filter.room_type_id} onChange={e=>setFilter(f=>({...f,room_type_id:e.target.value}))}>
                  <option value="">All Types</option>
                  {types.map(t=><option key={t.room_type_id} value={t.room_type_id}>{t.description}</option>)}
                </select>
              </div>
              <button className="btn btn-primary" onClick={run}>Run Report</button>
            </div>
          </div>
        </div>
        {ran && (
          <div className="card mb-0">
            <div className="card-header" style={{background:'var(--primary)',color:'#fff'}}>
              <h3 style={{color:'#fff'}}>Tenant List — {rows.length} records</h3>
            </div>
            <div className="tbl-wrap">
              {loading ? <div className="loading">Loading…</div> :
              <table>
                <thead><tr><th>Tenant ID</th><th>Name</th><th>Phone</th><th>Email</th><th>Room No</th><th>Room Type</th><th>ID Card No</th><th>Status</th></tr></thead>
                <tbody>
                  {rows.map(r=>(
                    <tr key={r.tenant_id}>
                      <td>T{String(r.tenant_id).padStart(3,'0')}</td>
                      <td><strong>{r.name}</strong></td>
                      <td>{r.phone}</td>
                      <td>{r.email||'—'}</td>
                      <td>{r.room_no||'—'}</td>
                      <td>{r.room_type||'—'}</td>
                      <td>{r.id_card_no}</td>
                      <td><span className={`badge badge-${r.status==='Occupied'?'occupied':r.status==='Available'?'available':'default'}`}>{r.status||'No Contract'}</span></td>
                    </tr>
                  ))}
                  {!rows.length&&<tr><td colSpan={8} style={{textAlign:'center',color:'var(--text-muted)',padding:20}}>No data</td></tr>}
                </tbody>
              </table>}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
