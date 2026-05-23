import { useNavigate } from 'react-router-dom'
import ReportTopbar from '../../components/ReportTopbar'
import { useState } from 'react'
import { api } from '../../services/http'
import { formatBaht } from '../../utils/utils'

export default function ReportRentalIncome() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState({ date_from:'', date_to:'' })
  const [ran, setRan] = useState(false)

  const run = () => {
    setLoading(true); setRan(true)
    let q = '/api/v1/reports/rental-income?'
    if (filter.date_from) q += `date_from=${filter.date_from}&`
    if (filter.date_to) q += `date_to=${filter.date_to}&`
    api.get(q).then(setRows).finally(() => setLoading(false))
  }

  const grandTotal = rows.reduce((s,r)=>s+parseFloat(r.total_rental||0),0)

  return (
    <>
      <ReportTopbar title="Total Rental Income" />
      <div className="page-content">
        <div className="card">
          <div className="card-header" style={{gap:8}}><span style={{fontSize:16}}>🔎</span><h3>Filter & Parameters</h3></div>
          <div className="card-body">
            <div className="filter-bar" style={{background:'transparent',border:'none',padding:0}}>
              <div className="form-group"><label>Date From *</label><input type="date" value={filter.date_from} onChange={e=>setFilter(f=>({...f,date_from:e.target.value}))}/></div>
              <div className="form-group"><label>Date To *</label><input type="date" value={filter.date_to} onChange={e=>setFilter(f=>({...f,date_to:e.target.value}))}/></div>
              <button className="btn btn-primary" onClick={run}>Run Report</button>
            </div>
          </div>
        </div>
        {ran && (
          <div className="card mb-0">
            <div className="card-header" style={{background:'var(--primary)',color:'#fff'}}>
              <h3 style={{color:'#fff'}}>Rental Income Analysis — Grand Total: {formatBaht(grandTotal)}</h3>
            </div>
            <div className="tbl-wrap">
              {loading ? <div className="loading">Loading…</div> :
              <table>
                <thead><tr><th>Tenant</th><th>Room</th><th>Room Type</th><th>Months Billed</th><th>Monthly Rent</th><th>Total Rental</th><th>% of Total</th></tr></thead>
                <tbody>
                  {rows.map((r,i)=>(
                    <tr key={i}>
                      <td><strong>{r.tenant_name}</strong></td>
                      <td>{r.room_no}</td>
                      <td>{r.room_type}</td>
                      <td style={{textAlign:'center'}}>{r.months_billed}</td>
                      <td>{formatBaht(r.monthly_rent)}</td>
                      <td style={{fontWeight:700,color:'var(--primary)'}}>{formatBaht(r.total_rental)}</td>
                      <td>{r.pct_of_total}%</td>
                    </tr>
                  ))}
                  {rows.length > 0 && (
                    <tr className="report-total-row" style={{background:'var(--surface2)',fontWeight:700}}>
                      <td colSpan={5} style={{textAlign:'right'}}>GRAND TOTAL</td>
                      <td style={{color:'var(--primary)'}}>{formatBaht(grandTotal)}</td>
                      <td>100%</td>
                    </tr>
                  )}
                  {!rows.length&&<tr><td colSpan={7} style={{textAlign:'center',color:'var(--text-muted)',padding:20}}>No data</td></tr>}
                </tbody>
              </table>}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
