import { useEffect, useState } from 'react'
import { api } from '../services/http'
import { toast } from 'react-toastify'
import ConfirmDialog from '../components/ConfirmDialog'
import { formatBaht } from '../utils/utils'

const EMPTY = { product_code:'', product_name:'', product_type:'Rent', default_unit_price:'', unit:'' }

export default function ProductCodesPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [confirm, setConfirm] = useState(null)

  const load = () => { setLoading(true); api.get('/api/v1/product-codes').then(setRows).finally(()=>setLoading(false)) }
  useEffect(load,[])
  const open = (row=null) => { setEditing(row); setForm(row?{...row}:EMPTY); setShowForm(true) }
  const handleChange = e => setForm(f=>({...f,[e.target.name]:e.target.value}))
  const handleSubmit = async e => {
    e.preventDefault()
    try {
      if(editing) await api.put(`/api/v1/product-codes/${editing.product_code}`, form)
      else await api.post('/api/v1/product-codes', form)
      toast.success('Saved!'); setShowForm(false); load()
    } catch(err){ toast.error(err.message) }
  }
  const handleDelete = async code => {
    try { await api.delete(`/api/v1/product-codes/${code}`); toast.success('Deleted'); setConfirm(null); load() }
    catch(err){ toast.error(err.message) }
  }
  const typeBadge = t => t==='Rent'?'active':t==='Fine'?'unpaid':t==='Maintenance'?'maintenance':'progress'
  return (
    <>
      <div className="topbar"><h1><span style={{display:"inline-flex",alignItems:"center",gap:6}}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>Product Codes</span></h1></div>
      <div className="page-content">
        <div className="page-header"><h2>Product Code Setup</h2><button className="btn btn-primary" onClick={()=>open()}>+ Add Product Code</button></div>
        <div className="card mb-0"><div className="tbl-wrap">
          {loading?<div className="loading">Loading…</div>:
          <table>
            <thead><tr><th>Code</th><th>Name</th><th>Type</th><th>Unit Price</th><th>Unit</th><th>Actions</th></tr></thead>
            <tbody>
              {rows.map(r=>(
                <tr key={r.product_code}>
                  <td><code>{r.product_code}</code></td>
                  <td><strong>{r.product_name}</strong></td>
                  <td><span className={`badge badge-${typeBadge(r.product_type)}`}>{r.product_type}</span></td>
                  <td>{formatBaht(r.default_unit_price)}</td>
                  <td>{r.unit||'—'}</td>
                  <td><div className="tbl-actions">
                    <button className="btn btn-outline btn-sm" onClick={()=>open(r)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={()=>setConfirm(r.product_code)}>Del</button>
                  </div></td>
                </tr>
              ))}
              {!rows.length&&<tr><td colSpan={6}><div className="empty-state"><div className="icon">📦</div><p>No product codes</p></div></td></tr>}
            </tbody>
          </table>}
        </div></div>
      </div>
      {showForm&&(
        <div className="modal-overlay"><div className="modal" style={{maxWidth:560}}>
          <div className="modal-header"><h2>{editing?'Edit Product Code':'New Product Code'}</h2>
            <button className="btn btn-ghost btn-sm" style={{color:'#fff'}} onClick={()=>setShowForm(false)}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body"><div className="form-grid">
              <div className="form-group"><label>Product Code *</label><input name="product_code" value={form.product_code} onChange={handleChange} required disabled={!!editing}/></div>
              <div className="form-group"><label>Product Name *</label><input name="product_name" value={form.product_name} onChange={handleChange} required/></div>
              <div className="form-group"><label>Type *</label>
                <select name="product_type" value={form.product_type} onChange={handleChange}>
                  {['Rent','Utility','Maintenance','Fine'].map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Default Unit Price (฿) *</label><input name="default_unit_price" type="number" step="0.01" value={form.default_unit_price} onChange={handleChange} required/></div>
              <div className="form-group"><label>Unit</label><input name="unit" value={form.unit||''} onChange={handleChange} placeholder="Month, Unit, Item…"/></div>
            </div></div>
            <div className="modal-footer">
              <button type="button" className="btn btn-ghost" onClick={()=>setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:5,verticalAlign:"middle"}}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Save</button>
            </div>
          </form>
        </div></div>
      )}
      {confirm&&<ConfirmDialog message="Delete this product code?" onConfirm={()=>handleDelete(confirm)} onCancel={()=>setConfirm(null)}/>}
    </>
  )
}
