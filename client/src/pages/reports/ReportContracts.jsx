import { useNavigate } from 'react-router-dom'
import ReportTopbar from '../../components/ReportTopbar'
import { useState } from 'react'
import { api } from '../../services/http'
import { formatBaht, formatDate } from '../../utils/utils'

export default function ReportContracts() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState({ date_from:'', date_to:'' })
  const [ran, setRan] = useState(false)

  const run = () => {
    setLoading(true); setRan(true)
    let q = '/api/v1/reports/contracts?'
    if (filter.date_from) q += `date_from=${filter.date_from}&`
    if (filter.date_to) q += `date_to=${filter.date_to}&`
    api.get(q).then(setRows).finally(() => setLoading(false))
  }

  return (
    <>
      <ReportTopbar title="Rental Contract Printout" />
      <div className="page-content">
        <div className="card">
          <div className="card-header" style={{gap:8}}><span style={{fontSize:16}}>🔎</span><h3>Filter & Parameters</h3></div>
          <div className="card-body">
            <div className="filter-bar" style={{background:'transparent',border:'none',padding:0}}>
              <div className="form-group"><label>Date From</label><input type="date" value={filter.date_from} onChange={e=>setFilter(f=>({...f,date_from:e.target.value}))}/></div>
              <div className="form-group"><label>Date To</label><input type="date" value={filter.date_to} onChange={e=>setFilter(f=>({...f,date_to:e.target.value}))}/></div>
              <button className="btn btn-primary" onClick={run}>Run Report</button>
            </div>
          </div>
        </div>
        {ran && (
          <div className="card mb-0">
            <div className="card-header" style={{background:'var(--primary)',color:'#fff'}}>
              <h3 style={{color:'#fff'}}>Rental Contracts — {rows.length} records</h3>
            </div>
            <div className="tbl-wrap">
              {loading ? <div className="loading">Loading…</div> :
              <table>
                <thead><tr><th>Contract No</th><th>Date</th><th>Tenant</th><th>Room</th><th>Room Type</th><th>Start</th><th>End</th><th>Monthly Rent</th><th>Total Value</th><th>Status</th></tr></thead>
                <tbody>
                  {rows.map(r=>(
                    <tr key={r.contract_no}>
                      <td><strong>C{String(r.contract_no).padStart(4,'0')}</strong></td>
                      <td>{formatDate(r.contract_date)}</td>
                      <td>{r.tenant_name}</td>
                      <td>{r.room_no}</td>
                      <td>{r.room_type}</td>
                      <td>{formatDate(r.start_date)}</td>
                      <td>{formatDate(r.end_date)}</td>
                      <td>{formatBaht(r.monthly_rent)}</td>
                      <td>{formatBaht(r.total_value)}</td>
                      <td><span className={`badge badge-${r.status==='Active'?'active':r.status==='Expiring'?'expiring':'expired'}`}>{r.status}</span></td>
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
