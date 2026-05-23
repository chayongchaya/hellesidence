import ReportTopbar from '../../components/ReportTopbar'
import { useState, useEffect } from 'react'
import { api } from '../../services/http'

export default function ReportOccupancy() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [ran, setRan] = useState(false)
  const [roomTypes, setRoomTypes] = useState([])
  const [filter, setFilter] = useState({ room_type_id: '' })

  useEffect(() => {
    api.get('/api/v1/room-types').then(setRoomTypes).catch(() => {})
  }, [])

  const run = () => {
    setLoading(true); setRan(true)
    let q = '/api/v1/reports/occupancy?'
    if (filter.room_type_id) q += `room_type_id=${filter.room_type_id}&`
    api.get(q).then(setRows).catch(() => setRows([])).finally(() => setLoading(false))
  }

  const total = rows.find(r => r.room_type === 'TOTAL' || !r.room_type)

  return (
    <>
      <ReportTopbar title="Room Occupancy Rate" />
      <div className="page-content">
        <div className="card">
          <div className="card-header" style={{gap:8}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <h3>Filter & Parameters</h3>
          </div>
          <div className="card-body">
            <div className="filter-bar" style={{background:'transparent',border:'none',padding:0}}>
              <div className="form-group">
                <label>Room Type</label>
                <select value={filter.room_type_id} onChange={e => setFilter(f => ({...f, room_type_id: e.target.value}))}>
                  <option value="">All Room Types</option>
                  {roomTypes.map(rt => (
                    <option key={rt.room_type_id} value={rt.room_type_id}>{rt.description}</option>
                  ))}
                </select>
              </div>
              <button className="btn btn-primary" onClick={run}>Run Report</button>
            </div>
          </div>
        </div>
        {ran && (
          <>
            {total && (
              <div className="stats-row">
                <div className="stat-card"><div className="stat-label">Overall Occupancy</div><div className="stat-value" style={{color:'var(--blue-text)'}}>{total.occupancy_rate_pct}%</div></div>
                <div className="stat-card"><div className="stat-label">Total Rooms</div><div className="stat-value">{total.total_rooms}</div></div>
                <div className="stat-card green"><div className="stat-label">Occupied</div><div className="stat-value">{total.occupied}</div></div>
                <div className="stat-card orange"><div className="stat-label">Available</div><div className="stat-value">{total.available}</div></div>
                <div className="stat-card accent"><div className="stat-label">Maintenance</div><div className="stat-value">{total.maintenance}</div></div>
              </div>
            )}
            <div className="card mb-0">
              <div className="card-header" style={{background:'var(--primary)',color:'#fff'}}>
                <h3 style={{color:'#fff'}}>Occupancy Rate by Room Type</h3>
              </div>
              <div className="tbl-wrap">
                {loading ? <div className="loading">Loading…</div> :
                <table>
                  <thead><tr><th>Room Type</th><th>Total Rooms</th><th>Occupied</th><th>Available</th><th>Maintenance</th><th>Occupancy Rate</th></tr></thead>
                  <tbody>
                    {rows.filter(r=>r.room_type && r.room_type !== 'TOTAL').map((r,i)=>(
                      <tr key={i}>
                        <td><strong>{r.room_type}</strong></td>
                        <td style={{textAlign:'center'}}>{r.total_rooms}</td>
                        <td style={{textAlign:'center',color:'var(--blue-text)',fontWeight:700}}>{r.occupied}</td>
                        <td style={{textAlign:'center',color:'var(--green-text)'}}>{r.available}</td>
                        <td style={{textAlign:'center',color:'var(--orange-text)'}}>{r.maintenance}</td>
                        <td style={{fontWeight:700,color:'var(--primary)'}}>{r.occupancy_rate_pct}%</td>
                      </tr>
                    ))}
                    {total && (
                      <tr style={{background:'var(--surface2)',fontWeight:700}}>
                        <td>TOTAL</td>
                        <td style={{textAlign:'center'}}>{total.total_rooms}</td>
                        <td style={{textAlign:'center',color:'var(--blue-text)'}}>{total.occupied}</td>
                        <td style={{textAlign:'center',color:'var(--green-text)'}}>{total.available}</td>
                        <td style={{textAlign:'center',color:'var(--orange-text)'}}>{total.maintenance}</td>
                        <td style={{color:'var(--primary)'}}>{total.occupancy_rate_pct}%</td>
                      </tr>
                    )}
                  </tbody>
                </table>}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
