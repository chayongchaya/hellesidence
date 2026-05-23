import { useNavigate } from 'react-router-dom'
import ReportTopbar from '../../components/ReportTopbar'
import { useState } from 'react'
import { api } from '../../services/http'
import { formatBaht } from '../../utils/utils'

export default function ReportPaymentsByMethod() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState({ date_from:'', date_to:'' })
  const [ran, setRan] = useState(false)

  const run = () => {
    setLoading(true); setRan(true)
    let q = '/api/v1/reports/payments-by-method?'
    if (filter.date_from) q += `date_from=${filter.date_from}&`
    if (filter.date_to) q += `date_to=${filter.date_to}&`
    api.get(q).then(setRows).finally(()=>setLoading(false))
  }
  const grand = rows.reduce((s,r)=>s+parseFloat(r.total_amount||0),0)
  const methodIcon = m => ({Cash:'💵',Transfer:'🏦',Card:'💳'}[m]||'💰')

  return (
    <>
      <ReportTopbar title="Payments by Method" />
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
          <>
            {rows.length>0&&(
              <div className="stats-row">
                {rows.map((r,i)=>(
                  <div key={i} className="stat-card">
                    <div className="stat-label">{methodIcon(r.payment_method)} {r.payment_method}</div>
                    <div className="stat-value" style={{fontSize:20}}>{formatBaht(r.total_amount)}</div>
                    <div className="stat-sub">{r.receipt_count} receipts · {r.pct_of_total}%</div>
                  </div>
                ))}
              </div>
            )}
            <div className="card mb-0">
              <div className="card-header" style={{background:'var(--primary)',color:'#fff'}}>
                <h3 style={{color:'#fff'}}>Payments by Method — Grand Total: {formatBaht(grand)}</h3>
              </div>
              <div className="tbl-wrap">
                {loading ? <div className="loading">Loading…</div> :
                <table>
                  <thead><tr><th>Payment Method</th><th>No. Receipts</th><th>Total Amount</th><th>% of Total</th><th>Avg per Receipt</th></tr></thead>
                  <tbody>
                    {rows.map((r,i)=>(
                      <tr key={i}>
                        <td><strong>{methodIcon(r.payment_method)} {r.payment_method}</strong></td>
                        <td style={{textAlign:'center'}}>{r.receipt_count}</td>
                        <td style={{fontWeight:700,color:'var(--green-text)'}}>{formatBaht(r.total_amount)}</td>
                        <td>
                          <div style={{display:'flex',alignItems:'center',gap:8}}>
                            <div style={{background:'var(--surface2)',borderRadius:4,height:8,flex:1}}>
                              <div style={{background:'#1a237e',borderRadius:4,height:8,width:`${r.pct_of_total}%`}}/>
                            </div>
                            <span style={{minWidth:36}}>{r.pct_of_total}%</span>
                          </div>
                        </td>
                        <td>{formatBaht(r.avg_per_receipt)}</td>
                      </tr>
                    ))}
                    {rows.length>0&&(
                      <tr style={{background:'var(--surface2)',fontWeight:700}}>
                        <td>TOTAL</td>
                        <td style={{textAlign:'center'}}>{rows.reduce((s,r)=>s+parseInt(r.receipt_count||0),0)}</td>
                        <td style={{color:'var(--green-text)'}}>{formatBaht(grand)}</td>
                        <td>100%</td><td>—</td>
                      </tr>
                    )}
                    {!rows.length&&<tr><td colSpan={5} style={{textAlign:'center',color:'var(--text-muted)',padding:20}}>No data</td></tr>}
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
