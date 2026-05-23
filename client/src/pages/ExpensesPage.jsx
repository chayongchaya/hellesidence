import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/http'
import { toast } from 'react-toastify'
import ConfirmDialog from '../components/ConfirmDialog'
import { formatBaht, formatDate } from '../utils/utils'

export default function ExpensesPage() {
  const [rows, setRows] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirm, setConfirm] = useState(null)
  const [filter, setFilter] = useState({ date_from: '', date_to: '', expense_category: '', supplier_id: '', search: '' })

  const load = () => {
    setLoading(true)
    let q = '/api/v1/expenses?'
    if (filter.date_from) q += `date_from=${filter.date_from}&`
    if (filter.date_to) q += `date_to=${filter.date_to}&`
    if (filter.expense_category) q += `expense_category=${encodeURIComponent(filter.expense_category)}&`
    if (filter.supplier_id) q += `supplier_id=${filter.supplier_id}&`
    Promise.all([api.get(q), api.get('/api/v1/suppliers')])
      .then(([data, s]) => {
        setSuppliers(s)
        if (filter.search.trim()) {
          const kw = filter.search.trim().toLowerCase()
          data = data.filter(r =>
            String(r.expense_no).padStart(4,'0').includes(kw) ||
            r.supplier_name?.toLowerCase().includes(kw) ||
            r.expense_category?.toLowerCase().includes(kw)
          )
        }
        setRows(data)
      })
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const clearFilter = () => setFilter({ date_from:'', date_to:'', expense_category:'', supplier_id:'', search:'' })

  const handleDelete = async id => {
    try { await api.delete(`/api/v1/expenses/${id}`); toast.success('Deleted'); setConfirm(null); load() }
    catch (err) { toast.error(err.message) }
  }

  const categories = ['Maintenance', 'Cleaning', 'Office Supplies', 'Electrical', 'Landscaping', 'Other']

  return (
    <>
      <div className="topbar"><h1><span style={{display:"inline-flex",alignItems:"center",gap:6}}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>Expenses / Purchases</span></h1></div>
      <div className="page-content">
        <div className="page-header">
          <div><h2>Expense Records</h2><p>{rows.length} expenses</p></div>
          <div style={{display:'flex', gap:8}}>
            <button onClick={() => window.print()} className="btn btn-outline">🖨 Print</button>
            <Link to="/expenses/new" className="btn btn-primary">+ New Expense</Link>
          </div>
        </div>
        <div className="filter-bar" style={{flexWrap:'wrap',gap:12}}>
          <div className="form-group" style={{minWidth:200,flex:'1 1 200px'}}>
            <label>Search (Expense No / Supplier / Category)</label>
            <input placeholder="e.g. EXP0001, supplier name…" value={filter.search} onChange={e => setFilter(f => ({...f, search:e.target.value}))} onKeyDown={e => e.key==='Enter' && load()} />
          </div>
          <div className="form-group" style={{minWidth:140,flex:'1 1 140px'}}>
            <label>Date From</label>
            <input type="date" value={filter.date_from} onChange={e => setFilter(f => ({ ...f, date_from: e.target.value }))} />
          </div>
          <div className="form-group" style={{minWidth:140,flex:'1 1 140px'}}>
            <label>Date To</label>
            <input type="date" value={filter.date_to} onChange={e => setFilter(f => ({ ...f, date_to: e.target.value }))} />
          </div>
          <div className="form-group" style={{minWidth:140,flex:'1 1 140px'}}>
            <label>Category</label>
            <select value={filter.expense_category} onChange={e => setFilter(f => ({ ...f, expense_category: e.target.value }))}>
              <option value="">All</option>
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group" style={{minWidth:150,flex:'1 1 150px'}}>
            <label>Supplier</label>
            <select value={filter.supplier_id} onChange={e => setFilter(f => ({ ...f, supplier_id: e.target.value }))}>
              <option value="">All</option>
              {suppliers.map(s => <option key={s.supplier_id} value={s.supplier_id}>{s.name}</option>)}
            </select>
          </div>
          <div style={{display:'flex',alignItems:'flex-end',gap:8}}>
            <button className="btn btn-primary" onClick={load}>🔍 Search</button>
            <button className="btn btn-ghost" onClick={clearFilter}>✕ Clear</button>
          </div>
        </div>
        <div className="card mb-0">
          <div className="tbl-wrap">
            {loading ? <div className="loading">Loading…</div> :
            <table>
              <thead><tr><th>Expense No</th><th>Date</th><th>Supplier</th><th>Category</th><th>Total</th><th>Actions</th></tr></thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.expense_no}>
                    <td><strong>EXP{String(r.expense_no).padStart(4,'0')}</strong></td>
                    <td>{formatDate(r.expense_date)}</td>
                    <td>{r.supplier_name}</td>
                    <td><span className="badge badge-maintenance">{r.expense_category}</span></td>
                    <td style={{ fontWeight: 700, color: '#b71c1c' }}>{formatBaht(r.total_expense)}</td>
                    <td>
                      <div className="tbl-actions">
                        <Link to={`/expenses/${r.expense_no}/edit`} className="btn btn-outline btn-sm">Edit</Link>
                        <button className="btn btn-danger btn-sm" onClick={() => setConfirm(r.expense_no)}>Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!rows.length && <tr><td colSpan={6}><div className="empty-state"><div className="icon">🛒</div><p>No expenses found</p></div></td></tr>}
              </tbody>
            </table>}
          </div>
        </div>
      </div>
      {confirm && <ConfirmDialog onConfirm={() => handleDelete(confirm)} onCancel={() => setConfirm(null)} />}
    </>
  )
}