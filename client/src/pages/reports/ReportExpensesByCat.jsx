import { useNavigate } from 'react-router-dom'
import ReportTopbar from '../../components/ReportTopbar'
import { useEffect, useState, useCallback } from 'react'
import { api } from '../../services/http'
import { formatBaht } from '../../utils/utils'

export default function ReportExpensesByCat() {
  const [rows, setRows] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState({ date_from:'', date_to:'', supplier_id:'' })
  const [ran, setRan] = useState(false)

  useEffect(()=>{ api.get('/api/v1/suppliers').then(setSuppliers) },[])

  const run = () => {
    setLoading(true); setRan(true)
    let q = '/api/v1/reports/expenses-by-category?'
    if (filter.date_from) q += `date_from=${filter.date_from}&`
    if (filter.date_to) q += `date_to=${filter.date_to}&`
    if (filter.supplier_id) q += `supplier_id=${filter.supplier_id}&`
    api.get(q).then(setRows).finally(()=>setLoading(false))
  }
  const grand = rows.reduce((s,r)=>s+parseFloat(r.total_amount||0),0)
  const catColors = ['#1a237e','#b71c1c','#2e7d32','#e65100','#6a1b9a','#0277bd']

  return (
    <>
      <ReportTopbar title="Expenses by Category" />
      <div className="page-content">
        <div className="card">
          <div className="card-header" style={{gap:8}}><span style={{fontSize:16}}>🔎</span><h3>Filter & Parameters</h3></div>
          <div className="card-body">
            <div className="filter-bar" style={{background:'transparent',border:'none',padding:0}}>
              <div className="form-group"><label>Date From</label><input type="date" value={filter.date_from} onChange={e=>setFilter(f=>({...f,date_from:e.target.value}))}/></div>
              <div className="form-group"><label>Date To</label><input type="date" value={filter.date_to} onChange={e=>setFilter(f=>({...f,date_to:e.target.value}))}/></div>
              <div className="form-group"><label>Supplier</label>
                <select value={filter.supplier_id} onChange={e=>setFilter(f=>({...f,supplier_id:e.target.value}))}>
                  <option value="">All Suppliers</option>
                  {suppliers.map(s=><option key={s.supplier_id} value={s.supplier_id}>{s.name}</option>)}
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
                <div className="stat-card accent"><div className="stat-label">Total Expenses</div><div className="stat-value" style={{fontSize:20}}>{formatBaht(grand)}</div></div>
                <div className="stat-card"><div className="stat-label">Transactions</div><div className="stat-value">{rows.reduce((s,r)=>s+parseInt(r.expense_count||0),0)}</div></div>
                <div className="stat-card"><div className="stat-label">Categories</div><div className="stat-value">{rows.length}</div></div>
              </div>
            )}
            <div className="card mb-0">
              <div className="card-header" style={{background:'var(--primary)',color:'#fff'}}>
                <h3 style={{color:'#fff'}}>Expenses by Category — Total: {formatBaht(grand)}</h3>
              </div>
              <div className="tbl-wrap">
                {loading ? <div className="loading">Loading…</div> :
                <table>
                  <thead><tr><th>Category</th><th>No. Transactions</th><th>No. Items</th><th>Total Amount</th><th>% of Total</th></tr></thead>
                  <tbody>
                    {rows.map((r,i)=>(
                      <tr key={i}>
                        <td><strong style={{color:catColors[i%catColors.length]}}>■</strong> {r.expense_category}</td>
                        <td style={{textAlign:'center'}}>{r.expense_count}</td>
                        <td style={{textAlign:'center'}}>{r.item_count}</td>
                        <td style={{fontWeight:700,color:'var(--red-text)'}}>{formatBaht(r.total_amount)}</td>
                        <td>
                          <div style={{display:'flex',alignItems:'center',gap:8}}>
                            <div style={{background:'#f0f0f0',borderRadius:4,height:10,flex:1}}>
                              <div style={{background:catColors[i%catColors.length],borderRadius:4,height:10,width:`${r.pct_of_total}%`}}/>
                            </div>
                            <span style={{minWidth:40,fontSize:12}}>{r.pct_of_total}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {rows.length>0&&(
                      <tr style={{background:'var(--surface2)',fontWeight:700}}>
                        <td>TOTAL</td>
                        <td style={{textAlign:'center'}}>{rows.reduce((s,r)=>s+parseInt(r.expense_count||0),0)}</td>
                        <td style={{textAlign:'center'}}>{rows.reduce((s,r)=>s+parseInt(r.item_count||0),0)}</td>
                        <td style={{color:'var(--red-text)'}}>{formatBaht(grand)}</td>
                        <td>100%</td>
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
