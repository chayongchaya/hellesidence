import { useEffect, useState } from 'react'
import { api } from '../services/http'
import { toast } from 'react-toastify'
import ConfirmDialog from '../components/ConfirmDialog'
import { formatBaht } from '../utils/utils'

const EMPTY = { name:'', category:'Bedroom', default_price:'', description:'' }
const CATEGORIES = ['Bedroom','Office','Living Room','Bathroom','Electrical','Electronic','Other']

export default function FurniturePage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [confirm, setConfirm] = useState(null)

  const load = () => { setLoading(true); api.get('/api/v1/furniture').then(setRows).finally(() => setLoading(false)) }
  useEffect(load, [])
  const open = (row=null) => { setEditing(row); setForm(row?{...row}:EMPTY); setShowForm(true) }
  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const handleSubmit = async e => {
    e.preventDefault()
    try {
      if (editing) await api.put(`/api/v1/furniture/${editing.item_id}`, form)
      else await api.post('/api/v1/furniture', form)
      toast.success('Saved!'); setShowForm(false); load()
    } catch(err) { toast.error(err.message) }
  }
  const handleDelete = async id => {
    try { await api.delete(`/api/v1/furniture/${id}`); toast.success('Deleted'); setConfirm(null); load() }
    catch(err) { toast.error(err.message) }
  }
  return (
    <>
      <div className="topbar"><h1>🛋️ Furniture</h1></div>
      <div className="page-content">
        <div className="page-header"><h2>Furniture Setup</h2><button className="btn btn-primary" onClick={()=>open()}>+ Add Furniture</button></div>
        <div className="card mb-0"><div className="tbl-wrap">
          {loading?<div className="loading">Loading…</div>:
          <table>
            <thead><tr><th>ID</th><th>Name</th><th>Category</th><th>Default Price</th><th>Actions</th></tr></thead>
            <tbody>
              {rows.map(r=>(
                <tr key={r.item_id}>
                  <td>F{String(r.item_id).padStart(3,'0')}</td>
                  <td><strong>{r.name}</strong></td>
                  <td>{r.category}</td>
                  <td>{formatBaht(r.default_price)}</td>
                  <td><div className="tbl-actions">
                    <button className="btn btn-outline btn-sm" onClick={()=>open(r)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={()=>setConfirm(r.item_id)}>Del</button>
                  </div></td>
                </tr>
              ))}
              {!rows.length&&<tr><td colSpan={5}><div className="empty-state"><div className="icon">🛋️</div><p>No furniture</p></div></td></tr>}
            </tbody>
          </table>}
        </div></div>
      </div>
      {showForm&&(
        <div className="modal-overlay"><div className="modal" style={{maxWidth:520}}>
          <div className="modal-header"><h2>{editing?'Edit Furniture':'New Furniture'}</h2>
            <button className="btn btn-ghost btn-sm" style={{color:'#fff'}} onClick={()=>setShowForm(false)}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body"><div className="form-grid">
              <div className="form-group full"><label>Name *</label><input name="name" value={form.name} onChange={handleChange} required/></div>
              <div className="form-group">
                  <label>Category *</label>
                <select name="category" value={form.category} onChange={handleChange}>
                  {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Default Price (฿)</label><input name="default_price" type="number" step="0.01" value={form.default_price||''} onChange={handleChange}/></div>
              <div className="form-group full"><label>Description</label><input name="description" value={form.description||''} onChange={handleChange} placeholder="Optional details…"/></div>
            </div></div>
            <div className="modal-footer">
              <button type="button" className="btn btn-ghost" onClick={()=>setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:5,verticalAlign:"middle"}}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Save</button>
            </div>
          </form>
        </div></div>
      )}
      {confirm&&<ConfirmDialog message="Delete this furniture?" onConfirm={()=>handleDelete(confirm)} onCancel={()=>setConfirm(null)}/>}
    </>
  )
}
