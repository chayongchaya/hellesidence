import { useNavigate } from 'react-router-dom'
import ReportTopbar from '../../components/ReportTopbar'
import { useState } from 'react'
import { api } from '../../services/http'
import { formatBaht, formatDate } from '../../utils/utils'

export default function ReportPayments() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState({ date_from:'', date_to:'', payment_method:'' })
  const [ran, setRan] = useState(false)

  const run = () => {
    setLoading(true); setRan(true)
    let q = '/api/v1/reports/payments?'
    if (filter.date_from) q += `date_from=${filter.date_from}&`
    if (filter.date_to) q += `date_to=${filter.date_to}&`
    if (filter.payment_method) q += `payment_method=${filter.payment_method}&`
    api.get(q).then(setRows).finally(() => setLoading(false))
  }
  const grandTotal = rows.reduce((s,r)=>s+parseFloat(r.total_paid||0),0)

  return (
    <>
      <ReportTopbar title="Payment Receipts" />
      <div className="page-content">
        <div className="card">
          <div className="card-header" style={{gap:8}}><span style={{fontSize:16}}>🔎</span><h3>Filter & Parameters</h3></div>
          <div className="card-body">
            <div className="filter-bar" style={{background:'transparent',border:'none',padding:0}}>
              <div className="form-group"><label>Date From</label><input type="date" value={filter.date_from} onChange={e=>setFilter(f=>({...f,date_from:e.target.value}))}/></div>
              <div className="form-group"><label>Date To</label><input type="date" value={filter.date_to} onChange={e=>setFilter(f=>({...f,date_to:e.target.value}))}/></div>
              <div className="form-group"><label>Payment Method</label>
                <select value={filter.payment_method} onChange={e=>setFilter(f=>({...f,payment_method:e.target.value}))}>
                  <option value="">All</option><option>Cash</option><option>Transfer</option><option>Card</option>
                </select>
              </div>
              <button className="btn btn-primary" onClick={run}>Run Report</button>
            </div>
          </div>
        </div>
        {ran && (
          <div className="card mb-0">
            <div className="card-header" style={{background:'var(--primary)',color:'#fff'}}>
              <h3 style={{color:'#fff'}}>Payment Receipts — {rows.length} records | Total: {formatBaht(grandTotal)}</h3>
            </div>
            <div className="tbl-wrap">
              {loading ? <div className="loading">Loading…</div> :
              <table>
                <thead><tr><th>Receipt No</th><th>Date</th><th>Tenant</th><th>Room</th><th>Method</th><th>Ref No</th><th>Total Paid</th></tr></thead>
                <tbody>
                  {rows.map(r=>(
                    <tr key={r.receipt_no}>
                      <td><strong>R{String(r.receipt_no).padStart(4,'0')}</strong></td>
                      <td>{formatDate(r.receipt_date)}</td>
                      <td>{r.tenant_name}</td>
                      <td>{r.room_no}</td>
                      <td><span className="badge badge-active">{r.payment_method}</span></td>
                      <td>{r.reference_number||'—'}</td>
                      <td style={{fontWeight:700,color:'var(--green-text)'}}>{formatBaht(r.total_paid)}</td>
                    </tr>
                  ))}
                  {rows.length>0&&(
                    <tr style={{background:'var(--surface2)',fontWeight:700}}>
                      <td colSpan={6} style={{textAlign:'right'}}>TOTAL</td>
                      <td style={{color:'var(--green-text)'}}>{formatBaht(grandTotal)}</td>
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
