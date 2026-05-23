import { useEffect, useState } from 'react'
import { api } from '../api/http'
import { toast } from 'react-toastify'
import ConfirmDialog from '../components/ConfirmDialog'
import { formatBaht } from '../utils'

function SimplePage({ title, icon, endpoint, columns, renderRow, emptyForm, renderFormFields }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [confirm, setConfirm] = useState(null)

  const load = () => { setLoading(true); api.get(endpoint).then(setRows).finally(() => setLoading(false)) }
  useEffect(load, [])

  const open = (row = null) => { setEditing(row); setForm(row ? {...row} : emptyForm); setShowForm(true) }
  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const handleSubmit = async e => {
    e.preventDefault()
    try {
      const id = editing ? Object.values(editing)[0] : null
      if (editing) await api.put(`${endpoint}/${id}`, form)
      else await api.post(endpoint, form)
      toast.success('Saved!'); setShowForm(false); load()
    } catch (err) { toast.error(err.message) }
  }
  const handleDelete = async id => {
    try { await api.delete(`${endpoint}/${id}`); toast.success('Deleted'); setConfirm(null); load() }
    catch (err) { toast.error(err.message) }
  }

  return (
    <>
      <div className="topbar"><h1>{icon} {title}</h1></div>
      <div className="page-content">
        <div className="page-header">
          <h2>{title}</h2>
          <button className="btn btn-primary" onClick={() => open()}>+ Add New</button>
        </div>
        <div className="card mb-0">
          <div className="tbl-wrap">
            {loading ? <div className="loading">Loading…</div> :
            <table>
              <thead><tr>{columns.map(c => <th key={c}>{c}</th>)}<th>Actions</th></tr></thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i}>
                    {renderRow(r).map((cell, j) => <td key={j}>{cell}</td>)}
                    <td>
                      <div className="tbl-actions">
                        <button className="btn btn-outline btn-sm" onClick={() => open(r)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setConfirm(Object.values(r)[0])}>Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!rows.length && <tr><td colSpan={columns.length+1}><div className="empty-state"><div className="icon">{icon}</div><p>No records</p></div></td></tr>}
              </tbody>
            </table>}
          </div>
        </div>
      </div>
      {showForm && (
        <div className="modal-overlay">
          <div className="modal" style={{maxWidth:560}}>
            <div className="modal-header">
              <h2>{editing ? `Edit ${title}` : `New ${title}`}</h2>
              <button className="btn btn-ghost btn-sm" style={{color:'#fff'}} onClick={() => setShowForm(false)}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">{renderFormFields(form, handleChange)}</div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:5,verticalAlign:"middle"}}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {confirm && <ConfirmDialog onConfirm={() => handleDelete(confirm)} onCancel={() => setConfirm(null)} />}
    </>
  )
}

// ============ FURNITURE ============
export function FurniturePage() {
  return <SimplePage
    title="Furniture" icon="🛋️"
    endpoint="/api/v1/furniture"
    columns={['ID','Name','Category','Default Price']}
    emptyForm={{ name:'', category:'Bedroom', default_price:'', description:'' }}
    renderRow={r => [
      `F${String(r.item_id).padStart(3,'0')}`,
      <strong>{r.name}</strong>,
      r.category,
      formatBaht(r.default_price),
    ]}
    renderFormFields={(form, handleChange) => (
      <div className="form-grid">
        <div className="form-group full"><label>Name *</label><input name="name" value={form.name} onChange={handleChange} required /></div>
        <div className="form-group">
          <label>Category *</label>
          <select name="category" value={form.category} onChange={handleChange}>
            {['Bedroom','Office','Living Room','Bathroom','Electrical','Electronic','Other'].map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group"><label>Default Price (฿)</label><input name="default_price" type="number" step="0.01" value={form.default_price || ''} onChange={handleChange} /></div>
      </div>
    )}
  />
}

// ============ PRODUCT CODES ============
export function ProductCodesPage() {
  return <SimplePage
    title="Product Codes" icon="📦"
    endpoint="/api/v1/product-codes"
    columns={['Code','Name','Type','Unit Price','Unit']}
    emptyForm={{ product_code:'', product_name:'', product_type:'Rent', default_unit_price:'', unit:'' }}
    renderRow={r => [
      <code>{r.product_code}</code>,
      <strong>{r.product_name}</strong>,
      <span className={`badge badge-${r.product_type==='Rent'?'active':r.product_type==='Fine'?'unpaid':r.product_type==='Maintenance'?'maintenance':'progress'}`}>{r.product_type}</span>,
      formatBaht(r.default_unit_price),
      r.unit || '—',
    ]}
    renderFormFields={(form, handleChange) => (
      <div className="form-grid">
        <div className="form-group"><label>Product Code *</label><input name="product_code" value={form.product_code} onChange={handleChange} required maxLength={20} /></div>
        <div className="form-group"><label>Product Name *</label><input name="product_name" value={form.product_name} onChange={handleChange} required /></div>
        <div className="form-group">
          <label>Product Type *</label>
          <select name="product_type" value={form.product_type} onChange={handleChange}>
            {['Rent','Utility','Maintenance','Fine'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="form-group"><label>Default Unit Price (฿) *</label><input name="default_unit_price" type="number" step="0.01" value={form.default_unit_price} onChange={handleChange} required /></div>
        <div className="form-group"><label>Unit</label><input name="unit" value={form.unit || ''} onChange={handleChange} placeholder="Month, Unit, Item…" /></div>
      </div>
    )}
  />
}

// ============ STAFF ============
export function StaffPage() {
  return <SimplePage
    title="Staff" icon="👔"
    endpoint="/api/v1/staff"
    columns={['ID','Name','Position','Phone','Status']}
    emptyForm={{ name:'', position:'', phone:'', status:'Active' }}
    renderRow={r => [
      `S${String(r.staff_id).padStart(3,'0')}`,
      <strong>{r.name}</strong>,
      r.position,
      r.phone,
      <span className={`badge badge-${r.status==='Active'?'available':'maintenance'}`}>{r.status}</span>,
    ]}
    renderFormFields={(form, handleChange) => (
      <div className="form-grid">
        <div className="form-group full"><label>Full Name *</label><input name="name" value={form.name} onChange={handleChange} required /></div>
        <div className="form-group"><label>Position *</label><input name="position" value={form.position} onChange={handleChange} required /></div>
        <div className="form-group"><label>Phone *</label><input name="phone" value={form.phone} onChange={handleChange} required /></div>
        <div className="form-group"><label>Status</label><select name="status" value={form.status} onChange={handleChange}><option>Active</option><option>Inactive</option></select></div>
      </div>
    )}
  />
}

// ============ SUPPLIERS ============
export function SuppliersPage() {
  return <SimplePage
    title="Suppliers" icon="🏭"
    endpoint="/api/v1/suppliers"
    columns={['ID','Name','Category','Contact','Status']}
    emptyForm={{ name:'', contact_information:'', category:'Maintenance', email:'', tax_id:'', status:'Active' }}
    renderRow={r => [
      `SUP${String(r.supplier_id).padStart(3,'0')}`,
      <strong>{r.name}</strong>,
      r.category || '—',
      r.contact_information,
      <span className={`badge badge-${r.status==='Active'?'available':'maintenance'}`}>{r.status}</span>,
    ]}
    renderFormFields={(form, handleChange) => (
      <div className="form-grid">
        <div className="form-group full"><label>Supplier Name *</label><input name="name" value={form.name} onChange={handleChange} required /></div>
        <div className="form-group full"><label>Contact Info *</label><input name="contact_information" value={form.contact_information} onChange={handleChange} required /></div>
        <div className="form-group"><label>Category</label>
          <select name="category" value={form.category || ''} onChange={handleChange}>
            {['Maintenance','Cleaning','Office Supplies','Electrical','Landscaping','Other'].map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group"><label>Email</label><input name="email" type="email" value={form.email || ''} onChange={handleChange} /></div>
        <div className="form-group"><label>Tax ID</label><input name="tax_id" value={form.tax_id || ''} onChange={handleChange} /></div>
        <div className="form-group"><label>Status</label><select name="status" value={form.status} onChange={handleChange}><option>Active</option><option>Inactive</option></select></div>
      </div>
    )}
  />
}

export default FurniturePage