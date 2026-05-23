import { useNavigate } from 'react-router-dom'
import ReportTopbar from '../../components/ReportTopbar'
import { useEffect, useState, useCallback } from 'react'
import { api } from '../../services/http'
import { formatBaht, formatDate } from '../../utils/utils'

export default function ReportUnpaidBalances() {
  const [rows, setRows] = useState([])
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState({ tenant_id:'' })
  const [ran, setRan] = useState(false)

  useEffect(()=>{ api.get('/api/v1/tenants').then(setTenants) },[])

  const run = () => {
    setLoading(true); setRan(true)
    let q = '/api/v1/reports/unpaid-balances?'
    if (filter.tenant_id) q += `tenant_id=${filter.tenant_id}&`
    api.get(q).then(setRows).finally(()=>setLoading(false))
  }
  const totalOutstanding = rows.reduce((s,r)=>s+parseFloat(r.balance||0),0)
  const sBadge = s => s==='Unpaid'?'unpaid':'partial'

  return (
    <>
      <ReportTopbar title="Unpaid Balances by Tenant" />
      <div className="page-content">
        <div className="card">
          <div className="card-header" style={{gap:8}}><span style={{fontSize:16}}>🔎</span><h3>Filter & Parameters</h3></div>
          <div className="card-body">
            <div className="filter-bar" style={{background:'transparent',border:'none',padding:0}}>
              <div className="form-group"><label>Tenant</label>
                <select value={filter.tenant_id} onChange={e=>setFilter(f=>({...f,tenant_id:e.target.value}))}>
                  <option value="">All Tenants</option>
                  {tenants.map(t=><option key={t.tenant_id} value={t.tenant_id}>{t.name}</option>)}
                </select>
              </div>
              <button className="btn btn-primary" onClick={run}>Run Report</button>
            </div>
          </div>
        </div>
        {ran && (
          <>
            {rows.length>0&&(
              <div className="stats-row">
                <div className="stat-card accent"><div className="stat-label">Total Outstanding</div><div className="stat-value" style={{fontSize:22}}>{formatBaht(totalOutstanding)}</div></div>
                <div className="stat-card"><div className="stat-label">Unpaid Bills</div><div className="stat-value">{rows.filter(r=>r.status==='Unpaid').length}</div></div>
                <div className="stat-card orange"><div className="stat-label">Partial Bills</div><div className="stat-value">{rows.filter(r=>r.status==='Partially Paid').length}</div></div>
                <div className="stat-card"><div className="stat-label">Tenants Affected</div><div className="stat-value">{[...new Set(rows.map(r=>r.tenant_name))].length}</div></div>
              </div>
            )}
            <div className="card mb-0">
              <div className="card-header" style={{background:'var(--red-text)',color:'#fff'}}>
                <h3 style={{color:'#fff'}}>Unpaid Balances — Total Outstanding: {formatBaht(totalOutstanding)}</h3>
              </div>
              <div className="tbl-wrap">
                {loading ? <div className="loading">Loading…</div> :
                <table>
                  <thead><tr><th>Tenant</th><th>Room</th><th>Bill No</th><th>Month</th><th>Due Date</th><th>Bill Total</th><th>Paid</th><th>Balance Due</th><th>Status</th></tr></thead>
                  <tbody>
                    {rows.map((r,i)=>(
                      <tr key={i}>
                        <td><strong>{r.tenant_name}</strong></td>
                        <td>{r.room_no}</td>
                        <td>B{String(r.bill_no).padStart(4,'0')}</td>
                        <td>{r.billing_month}</td>
                        <td>{formatDate(r.due_date)}</td>
                        <td>{formatBaht(r.bill_total)}</td>
                        <td style={{color:'var(--green-text)'}}>{formatBaht(r.paid_amount)}</td>
                        <td style={{fontWeight:700,color:'var(--red-text)'}}>{formatBaht(r.balance)}</td>
                        <td><span className={`badge badge-${sBadge(r.status)}`}>{r.status}</span></td>
                      </tr>
                    ))}
                    {rows.length>0&&(
                      <tr style={{background:'#fce4ec',fontWeight:700}}>
                        <td colSpan={7} style={{textAlign:'right'}}>TOTAL OUTSTANDING</td>
                        <td style={{color:'var(--red-text)'}}>{formatBaht(totalOutstanding)}</td>
                        <td></td>
                      </tr>
                    )}
                    {!rows.length&&<tr><td colSpan={9} style={{textAlign:'center',color:'var(--text-muted)',padding:20}}>No unpaid balances 🎉</td></tr>}
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
