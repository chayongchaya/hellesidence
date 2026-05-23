import { useEffect, useState } from 'react'
import { api } from '../services/http'
import { toast } from 'react-toastify'
import ConfirmDialog from '../components/ConfirmDialog'
import {
  validatePhone, validateIdCard, validateEmail, validateRequired,
  formatPhoneInput, formatIdCardInput, stripFormatting
} from '../utils/validation'

const EMPTY = { name: '', phone: '', email: '', address: '', id_card_no: '' }

function FieldError({ msg }) {
  if (!msg) return null
  return <span style={{ color: '#e53e3e', fontSize: 11, marginTop: 3, display: 'block' }}>⚠ {msg}</span>
}

export default function TenantsPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [search, setSearch] = useState('')
  const [confirm, setConfirm] = useState(null)

  const load = () => {
    setLoading(true)
    api.get('/api/v1/tenants').then(setRows).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const open = (row = null) => {
    setEditing(row)
    setForm(row ? { ...row } : EMPTY)
    setErrors({})
    setShowForm(true)
  }

  const handleChange = e => {
    const { name, value } = e.target
    let finalValue = value
    if (name === 'phone') finalValue = formatPhoneInput(value)
    if (name === 'id_card_no') finalValue = formatIdCardInput(value)
    setForm(f => ({ ...f, [name]: finalValue }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }))
  }

  const validate = () => {
    const errs = {}
    errs.name = validateRequired(form.name, 'Full Name')
    errs.phone = validatePhone(form.phone)
    errs.email = validateEmail(form.email)
    errs.id_card_no = validateIdCard(form.id_card_no)
    Object.keys(errs).forEach(k => { if (!errs[k]) delete errs[k] })
    return errs
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      toast.error('Please fix the errors before submitting')
      return
    }
    const payload = {
      ...form,
      phone: stripFormatting(form.phone),
      id_card_no: stripFormatting(form.id_card_no),
    }
    try {
      if (editing) await api.put(`/api/v1/tenants/${editing.tenant_id}`, payload)
      else await api.post('/api/v1/tenants', payload)
      toast.success(editing ? 'Tenant updated!' : 'Tenant created!')
      setShowForm(false); load()
    } catch (err) { toast.error(err.message) }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/v1/tenants/${id}`)
      toast.success('Deleted'); setConfirm(null); load()
    } catch (err) { toast.error(err.message) }
  }

  const filtered = rows.filter(r => {
    if (!search.trim()) return true
    const kw = search.trim().toLowerCase()
    return (
      r.name?.toLowerCase().includes(kw) ||
      r.phone?.includes(kw) ||
      r.email?.toLowerCase().includes(kw) ||
      r.id_card_no?.includes(kw) ||
      String(r.tenant_id).padStart(3, '0').includes(kw) ||
      ('t' + String(r.tenant_id).padStart(3, '0')).includes(kw)
    )
  })

  return (
    <>
      <div className="topbar"><h1>👤 Tenants</h1></div>
      <div className="page-content">
        <div className="page-header">
          <div><h2>Tenant Management</h2><p>{rows.length} total tenants</p></div>
          <button className="btn btn-primary" onClick={() => open()}>+ New Tenant</button>
        </div>
        <div className="filter-bar" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div className="form-group" style={{ minWidth: 260, flex: '1 1 260px' }}>
            <label>Search (Name / Phone / ID / Card No)</label>
            <input placeholder="e.g. John, T001, 081-xxx, 1-xxxx…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <button className="btn btn-ghost" onClick={() => setSearch('')}>✕ Clear</button>
          </div>
        </div>
        <div className="card mb-0">
          <div className="tbl-wrap">
            {loading ? <div className="loading">Loading…</div> :
              <table>
                <thead><tr><th>ID</th><th>Name</th><th>Phone</th><th>Email</th><th>ID Card No</th><th>Actions</th></tr></thead>
                <tbody>
                  {filtered.map(r => (
                    <tr key={r.tenant_id}>
                      <td>T{String(r.tenant_id).padStart(3, '0')}</td>
                      <td><strong>{r.name}</strong></td>
                      <td>{r.phone}</td>
                      <td>{r.email || '—'}</td>
                      <td>{r.id_card_no}</td>
                      <td><div className="tbl-actions">
                        <button className="btn btn-outline btn-sm" onClick={() => open(r)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setConfirm(r.tenant_id)}>Del</button>
                      </div></td>
                    </tr>
                  ))}
                  {!filtered.length && <tr><td colSpan={7}><div className="empty-state"><div className="icon">👤</div><p>No tenants found</p></div></td></tr>}
                </tbody>
              </table>}
          </div>
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editing ? 'Edit Tenant' : 'New Tenant'}</h2>
              <button className="btn btn-ghost btn-sm" style={{ color: '#fff' }} onClick={() => setShowForm(false)}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} noValidate>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group full">
                    <label>Full Name *</label>
                    <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. John Smith"
                      style={errors.name ? { borderColor: '#e53e3e' } : {}} />
                    <FieldError msg={errors.name} />
                  </div>
                  <div className="form-group">
                    <label>Phone * <small style={{ fontWeight: 400, color: 'var(--text-light)' }}>(10 digits)</small></label>
                    <input name="phone" value={form.phone} onChange={handleChange}
                      placeholder="081-234-5678" maxLength={12}
                      style={errors.phone ? { borderColor: '#e53e3e' } : {}} />
                    <FieldError msg={errors.phone} />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input name="email" type="text" value={form.email || ''} onChange={handleChange}
                      placeholder="example@email.com"
                      style={errors.email ? { borderColor: '#e53e3e' } : {}} />
                    <FieldError msg={errors.email} />
                  </div>
                  <div className="form-group">
                    <label>ID Card No * <small style={{ fontWeight: 400, color: 'var(--text-light)' }}>(13 digits)</small></label>
                    <input name="id_card_no" value={form.id_card_no} onChange={handleChange}
                      placeholder="1-2345-67890-12-3" maxLength={17}
                      style={errors.id_card_no ? { borderColor: '#e53e3e' } : {}} />
                    <FieldError msg={errors.id_card_no} />
                  </div>
                  <div className="form-group full">
                    <label>Address</label>
                    <textarea name="address" value={form.address || ''} onChange={handleChange} rows={2} style={{ resize: 'vertical' }} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 5, verticalAlign: 'middle' }}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg> Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {confirm && <ConfirmDialog message="Delete this tenant?" onConfirm={() => handleDelete(confirm)} onCancel={() => setConfirm(null)} />}
    </>
  )
}
