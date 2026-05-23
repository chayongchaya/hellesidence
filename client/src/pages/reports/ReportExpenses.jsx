import { useNavigate } from 'react-router-dom'
import ReportTopbar from '../../components/ReportTopbar'
import { useEffect, useState, useCallback } from 'react'
import { api } from '../../services/http'
import { formatBaht, formatDate } from '../../utils/utils'

export default function ReportExpenses() {
  const [rows, setRows] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState({ date_from:'', date_to:'', supplier_id:'', expense_category:'' })
  const [ran, setRan] = useState(false)

  useEffect(()=>{ api.get('/api/v1/suppliers').then(setSuppliers) },[])

  const run = () => {
    setLoading(true); setRan(true)
    let q = '/api/v1/reports/expenses?'
    if (filter.date_from) q += `date_from=${filter.date_from}&`
    if (filter.date_to) q += `date_to=${filter.date_to}&`
    if (filter.supplier_id) q += `supplier_id=${filter.supplier_id}&`
    if (filter.expense_category) q += `expense_category=${encodeURIComponent(filter.expense_category)}&`
    api.get(q).then(setRows).finally(()=>setLoading(false))
  }
  const grand = rows.reduce((s,r)=>s+parseFloat(r.total_expense||0),0)

  return (
    <>
      <ReportTopbar title="Dormitory Expenses" />
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
              <div className="form-group"><label>Category</label>
                <select value={filter.expense_category} onChange={e=>setFilter(f=>({...f,expense_category:e.target.value}))}>
                  <option value="">All</option>
                  {['Maintenance','Cleaning','Office Supplies','Electrical','Landscaping'].map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <button className="btn btn-primary" onClick={run}>Run Report</button>
            </div>
          </div>
        </div>
        {ran && (
          <div className="card mb-0">
            <div className="card-header" style={{background:'var(--primary)',color:'#fff'}}>
              <h3 style={{color:'#fff'}}>Expenses — {rows.length} records | Total: {formatBaht(grand)}</h3>
            </div>
            <div className="tbl-wrap">
              {loading ? <div className="loading">Loading…</div> :
              <table>
                <thead><tr><th>Expense No</th><th>Date</th><th>Supplier</th><th>Category</th><th>No. Items</th><th>Total Expense</th></tr></thead>
                <tbody>
                  {rows.map(r=>(
                    <tr key={r.expense_no}>
                      <td><strong>EX{String(r.expense_no).padStart(4,'0')}</strong></td>
                      <td>{formatDate(r.expense_date)}</td>
                      <td>{r.supplier_name}</td>
                      <td>{r.expense_category}</td>
                      <td style={{textAlign:'center'}}>{r.no_items}</td>
                      <td style={{fontWeight:700,color:'var(--red-text)'}}>{formatBaht(r.total_expense)}</td>
                    </tr>
                  ))}
                  {rows.length>0&&(
                    <tr style={{background:'var(--surface2)',fontWeight:700}}>
                      <td colSpan={5} style={{textAlign:'right'}}>TOTAL</td>
                      <td style={{color:'var(--red-text)'}}>{formatBaht(grand)}</td>
                    </tr>
                  )}
                  {!rows.length&&<tr><td colSpan={6} style={{textAlign:'center',color:'var(--text-muted)',padding:20}}>No data</td></tr>}
                </tbody>
              </table>}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
