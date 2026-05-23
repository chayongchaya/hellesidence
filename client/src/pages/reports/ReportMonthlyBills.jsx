import { useNavigate } from 'react-router-dom'
import ReportTopbar from '../../components/ReportTopbar'
import { useState } from 'react'
import { api } from '../../services/http'
import { formatBaht, formatDate } from '../../utils/utils'

export default function ReportMonthlyBills() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState({ billing_month_from:'', billing_month_to:'', status:'' })
  const [ran, setRan] = useState(false)

  const run = () => {
    setLoading(true); setRan(true)
    let q = '/api/v1/reports/monthly-bills?'
    if (filter.billing_month_from) q += `billing_month_from=${filter.billing_month_from}&`
    if (filter.billing_month_to) q += `billing_month_to=${filter.billing_month_to}&`
    if (filter.status) q += `status=${encodeURIComponent(filter.status)}&`
    api.get(q).then(setRows).finally(() => setLoading(false))
  }
  const sBadge = s => s==='Fully Paid'?'paid':s==='Partially Paid'?'partial':'unpaid'

  return (
    <>
      <ReportTopbar title="Monthly Bills" />
      <div className="page-content">
        <div className="card">
          <div className="card-header" style={{gap:8}}><span style={{fontSize:16}}>🔎</span><h3>Filter & Parameters</h3></div>
          <div className="card-body">
            <div className="filter-bar" style={{background:'transparent',border:'none',padding:0}}>
              <div className="form-group"><label>Month From</label><input type="month" value={filter.billing_month_from} onChange={e=>setFilter(f=>({...f,billing_month_from:e.target.value}))}/></div>
              <div className="form-group"><label>Month To</label><input type="month" value={filter.billing_month_to} onChange={e=>setFilter(f=>({...f,billing_month_to:e.target.value}))}/></div>
              <div className="form-group"><label>Status</label>
                <select value={filter.status} onChange={e=>setFilter(f=>({...f,status:e.target.value}))}>
                  <option value="">All</option><option>Unpaid</option><option>Partially Paid</option><option>Fully Paid</option>
                </select>
              </div>
              <button className="btn btn-primary" onClick={run}>Run Report</button>
            </div>
          </div>
        </div>
        {ran && (
          <div className="card mb-0">
            <div className="card-header" style={{background:'var(--primary)',color:'#fff'}}>
              <h3 style={{color:'#fff'}}>Monthly Bills — {rows.length} records</h3>
            </div>
            <div className="tbl-wrap">
              {loading ? <div className="loading">Loading…</div> :
              <table>
                <thead><tr><th>Bill No</th><th>Bill Date</th><th>Month</th><th>Tenant</th><th>Room</th><th>Due Date</th><th>Total</th><th>Paid</th><th>Balance</th><th>Status</th></tr></thead>
                <tbody>
                  {rows.map(r=>(
                    <tr key={r.bill_no}>
                      <td><strong>B{String(r.bill_no).padStart(4,'0')}</strong></td>
                      <td>{formatDate(r.bill_date)}</td>
                      <td>{r.billing_month}</td>
                      <td>{r.tenant_name}</td>
                      <td>{r.room_no}</td>
                      <td>{formatDate(r.due_date)}</td>
                      <td>{formatBaht(r.total_bill_amount)}</td>
                      <td style={{color:'var(--green-text)'}}>{formatBaht(r.total_paid)}</td>
                      <td style={{color:parseFloat(r.balance_due)>0?'#b71c1c':'#2e7d32',fontWeight:700}}>{formatBaht(r.balance_due)}</td>
                      <td><span className={`badge badge-${sBadge(r.status)}`}>{r.status}</span></td>
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
