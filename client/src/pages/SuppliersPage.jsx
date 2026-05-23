import { useEffect, useState } from 'react'
import { api } from '../services/http'
import { toast } from 'react-toastify'
import ConfirmDialog from '../components/ConfirmDialog'
import { validateRequired } from '../utils/validation'

const EMPTY = { name: '', contact_information: '' }

function FieldError({ msg }) {
  if (!msg) return null
  return <span style={{ color: '#e53e3e', fontSize: 11, marginTop: 3, display: 'block' }}>⚠ {msg}</span>
}

export default function SuppliersPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [confirm, setConfirm] = useState(null)

  const load = () => { setLoading(true); api.get('/api/v1/suppliers').then(setRows).finally(() => setLoading(false)) }
  useEffect(load, [])

  const open = (row = null) => { setEditing(row); setForm(row ? { ...row } : EMPTY); setErrors({}); setShowForm(true) }

  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }))
  }

  const validate = () => {
    const errs = {}
    errs.name = validateRequired(form.name, 'Supplier Name')
    errs.contact_information = validateRequired(form.contact_information, 'Contact Info')
    Object.keys(errs).forEach(k => { if (!errs[k]) delete errs[k] })
    return errs
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); toast.error('Please fix the errors before submitting'); return }
    try {
      if (editing) await api.put(`/api/v1/suppliers/${editing.supplier_id}`, form)
      else await api.post('/api/v1/suppliers', form)
      toast.success('Saved!'); setShowForm(false); load()
    } catch (err) { toast.error(err.message) }
  }

  const handleDelete = async id => {
    try { await api.delete(`/api/v1/suppliers/${id}`); toast.success('Deleted'); setConfirm(null); load() }
    catch (err) { toast.error(err.message) }
  }

  return (
    <>
      <div className="topbar"><h1><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><rect x="1" y="3" width="15" height="13" rx="2" /><path d="M16 8h4l3 3v5h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>Suppliers</span></h1></div>
      <div className="page-content">
        <div className="page-header"><h2>Supplier Management</h2><button className="btn btn-primary" onClick={() => open()}>+ Add Supplier</button></div>
        <div className="card mb-0"><div className="tbl-wrap">
          {loading ? <div className="loading">Loading…</div> :
            <table>
              <thead><tr><th>ID</th><th>Name</th><th>Contact</th><th>Actions</th></tr></thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.supplier_id}>
                    <td>SUP{String(r.supplier_id).padStart(3, '0')}</td>
                    <td><strong>{r.name}</strong></td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.contact_information}</td>
                    <td><div className="tbl-actions">
                      <button className="btn btn-outline btn-sm" onClick={() => open(r)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => setConfirm(r.supplier_id)}>Del</button>
                    </div></td>
                  </tr>
                ))}
                {!rows.length && <tr><td colSpan={6}><div className="empty-state"><div className="icon">🏭</div><p>No suppliers</p></div></td></tr>}
              </tbody>
            </table>}
        </div></div>
      </div>

      {showForm && (
        <div className="modal-overlay"><div className="modal" style={{ maxWidth: 560 }}>
          <div className="modal-header"><h2>{editing ? 'Edit Supplier' : 'New Supplier'}</h2>
            <button className="btn btn-ghost btn-sm" style={{ color: '#fff' }} onClick={() => setShowForm(false)}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>
          <form onSubmit={handleSubmit} noValidate>
            <div className="modal-body"><div className="form-grid">
              <div className="form-group full">
                <label>Supplier Name *</label>
                <input name="name" value={form.name} onChange={handleChange}
                  placeholder="e.g. ABC Company Ltd."
                  style={errors.name ? { borderColor: '#e53e3e' } : {}} />
                <FieldError msg={errors.name} />
              </div>
              <div className="form-group full">
                <label>Contact Info *</label>
                <input name="contact_information" value={form.contact_information} onChange={handleChange}
                  placeholder="Phone / Email / Address"
                  style={errors.contact_information ? { borderColor: '#e53e3e' } : {}} />
                <FieldError msg={errors.contact_information} />
              </div>
            </div></div>
            <div className="modal-footer">
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 5, verticalAlign: 'middle' }}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg> Save
              </button>
            </div>
          </form>
        </div></div>
      )}
      {confirm && <ConfirmDialog onConfirm={() => handleDelete(confirm)} onCancel={() => setConfirm(null)} />}
    </>
  )
}
