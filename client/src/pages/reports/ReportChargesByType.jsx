import { useNavigate } from 'react-router-dom'
import ReportTopbar from '../../components/ReportTopbar'
import { useState } from 'react'
import { api } from '../../services/http'
import { formatBaht } from '../../utils/utils'

export default function ReportChargesByType() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState({ date_from:'', date_to:'' })
  const [ran, setRan] = useState(false)

  const run = () => {
    setLoading(true); setRan(true)
    let q = '/api/v1/reports/charges-by-type?'
    if (filter.date_from) q += `date_from=${filter.date_from}&`
    if (filter.date_to) q += `date_to=${filter.date_to}&`
    api.get(q).then(setRows).finally(() => setLoading(false))
  }
  const grand = rows.reduce((s,r)=>s+parseFloat(r.total_amount||0),0)
  const typeBadge = t => t==='Rent'?'active':t==='Fine'?'unpaid':t==='Maintenance'?'maintenance':'progress'

  return (
    <>
      <ReportTopbar title="Charges by Product Type" />
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
              <h3 style={{color:'#fff'}}>Charges by Product Type — Grand Total: {formatBaht(grand)}</h3>
            </div>
            <div className="tbl-wrap">
              {loading ? <div className="loading">Loading…</div> :
              <table>
                <thead><tr><th>Product Type</th><th>Product Name</th><th>Times Charged</th><th>Total Amount</th><th>% of Total</th></tr></thead>
                <tbody>
                  {rows.map((r,i)=>(
                    <tr key={i}>
                      <td><span className={`badge badge-${typeBadge(r.product_type)}`}>{r.product_type}</span></td>
                      <td><strong>{r.product_name}</strong></td>
                      <td style={{textAlign:'center'}}>{r.times_charged}</td>
                      <td style={{fontWeight:700,color:'var(--primary)'}}>{formatBaht(r.total_amount)}</td>
                      <td>{r.pct_of_total}%</td>
                    </tr>
                  ))}
                  {rows.length>0&&(
                    <tr style={{background:'var(--surface2)',fontWeight:700}}>
                      <td colSpan={3} style={{textAlign:'right'}}>TOTAL</td>
                      <td style={{color:'var(--primary)'}}>{formatBaht(grand)}</td>
                      <td>100%</td>
                    </tr>
                  )}
                  {!rows.length&&<tr><td colSpan={5} style={{textAlign:'center',color:'var(--text-muted)',padding:20}}>No data</td></tr>}
                </tbody>
              </table>}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
