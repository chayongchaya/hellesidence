import { useNavigate } from 'react-router-dom'
import ReportTopbar from '../../components/ReportTopbar'
import { useEffect, useState, useCallback } from 'react'
import { api } from '../../services/http'
import { formatBaht, today } from '../../utils/utils'

export default function ReportAvailableRooms() {
  const [rows, setRows] = useState([])
  const [types, setTypes] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState({ as_of_date: today(), room_type_id:'' })
  const [ran, setRan] = useState(false)

  useEffect(() => { api.get('/api/v1/room-types').then(setTypes) }, [])

  const run = () => {
    setLoading(true); setRan(true)
    let q = `/api/v1/reports/available-rooms?as_of_date=${filter.as_of_date}`
    if (filter.room_type_id) q += `&room_type_id=${filter.room_type_id}`
    api.get(q).then(setRows).finally(() => setLoading(false))
  }

  return (
    <>
      <ReportTopbar title="Available Rooms" />
      <div className="page-content">
        <div className="card">
          <div className="card-header" style={{gap:8}}><span style={{fontSize:16}}>🔎</span><h3>Filter & Parameters</h3></div>
          <div className="card-body">
            <div className="filter-bar" style={{background:'transparent',border:'none',padding:0}}>
              <div className="form-group"><label>As of Date *</label><input type="date" value={filter.as_of_date} onChange={e=>setFilter(f=>({...f,as_of_date:e.target.value}))}/></div>
              <div className="form-group"><label>Room Type</label>
                <select value={filter.room_type_id} onChange={e=>setFilter(f=>({...f,room_type_id:e.target.value}))}>
                  <option value="">All</option>
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
              <h3 style={{color:'#fff'}}>Available Rooms as of {filter.as_of_date} — {rows.length} rooms</h3>
            </div>
            <div className="tbl-wrap">
              {loading ? <div className="loading">Loading…</div> :
              <table>
                <thead><tr><th>Room No</th><th>Room Type</th><th>Floor</th><th>Monthly Price</th></tr></thead>
                <tbody>
                  {rows.map(r=>(
                    <tr key={r.room_no}>
                      <td><strong>{r.room_no}</strong></td>
                      <td>{r.room_type}</td>
                      <td>Floor {r.floor}</td>
                      <td style={{color:'var(--green-text)',fontWeight:700}}>{formatBaht(r.monthly_price)}</td>
                    </tr>
                  ))}
                  {!rows.length&&<tr><td colSpan={4} style={{textAlign:'center',color:'var(--text-muted)',padding:20}}>No available rooms on this date</td></tr>}
                </tbody>
              </table>}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
