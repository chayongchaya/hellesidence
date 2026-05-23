import { useEffect, useState } from 'react'
import { api } from '../services/http'
import { toast } from 'react-toastify'
import ConfirmDialog from '../components/ConfirmDialog'
import { formatBaht } from '../utils/utils'
import { validateRequired, validatePositiveNumber } from '../utils/validation'

const EMPTY = { description: '', base_price: '', max_occupants: 1, size_sqm: '' }

function FieldError({ msg }) {
  if (!msg) return null
  return <span style={{ color: '#e53e3e', fontSize: 11, marginTop: 3, display: 'block' }}>⚠ {msg}</span>
}

export default function RoomTypesPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [confirm, setConfirm] = useState(null)

  const load = () => { setLoading(true); api.get('/api/v1/room-types').then(setRows).finally(() => setLoading(false)) }
  useEffect(load, [])

  const open = (row = null) => { setEditing(row); setForm(row ? { ...row } : EMPTY); setErrors({}); setShowForm(true) }

  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }))
  }

  const validate = () => {
    const errs = {}
    errs.description = validateRequired(form.description, 'Room Type Description')
    errs.base_price = validatePositiveNumber(form.base_price, 'Base Price')
    if (form.max_occupants < 1) errs.max_occupants = 'Max occupants must be greater than 0'
    if (form.size_sqm !== '' && form.size_sqm !== null) {
      if (isNaN(Number(form.size_sqm)) || Number(form.size_sqm) <= 0) errs.size_sqm = 'Room size must be a positive number'
    }
    Object.keys(errs).forEach(k => { if (!errs[k]) delete errs[k] })
    return errs
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); toast.error('Please fix the errors before submitting'); return }
    try {
      if (editing) await api.put(`/api/v1/room-types/${editing.room_type_id}`, form)
      else await api.post('/api/v1/room-types', form)
      toast.success('Saved!'); setShowForm(false); load()
    } catch (err) { toast.error(err.message) }
  }

  const handleDelete = async id => {
    try { await api.delete(`/api/v1/room-types/${id}`); toast.success('Deleted'); setConfirm(null); load() }
    catch (err) { toast.error(err.message) }
  }

  return (
    <>
      <div className="topbar"><h1><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>Room Types</span></h1></div>
      <div className="page-content">
        <div className="page-header"><h2>Room Type Setup</h2><button className="btn btn-primary" onClick={() => open()}>+ Add Type</button></div>
        <div className="card mb-0"><div className="tbl-wrap">
          {loading ? <div className="loading">Loading…</div> :
            <table>
              <thead><tr><th>ID</th><th>Description</th><th>Base Price</th><th>Max Occupants</th><th>Size (m²)</th><th>Actions</th></tr></thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.room_type_id}>
                    <td>RT-{String(r.room_type_id).padStart(3, '0')}</td>
                    <td><strong>{r.description}</strong></td>
                    <td>{formatBaht(r.base_price)}</td>
                    <td>{r.max_occupants}</td>
                    <td>{r.size_sqm ? `${r.size_sqm} m²` : '—'}</td>
                    <td><div className="tbl-actions">
                      <button className="btn btn-outline btn-sm" onClick={() => open(r)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => setConfirm(r.room_type_id)}>Del</button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>}
        </div></div>
      </div>

      {showForm && (
        <div className="modal-overlay"><div className="modal" style={{ maxWidth: 480 }}>
          <div className="modal-header"><h2>{editing ? 'Edit Room Type' : 'New Room Type'}</h2>
            <button className="btn btn-ghost btn-sm" style={{ color: '#fff' }} onClick={() => setShowForm(false)}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>
          <form onSubmit={handleSubmit} noValidate>
            <div className="modal-body"><div className="form-grid">
              <div className="form-group full">
                <label>Room Type Description *</label>
                <input name="description" value={form.description} onChange={handleChange}
                  placeholder="e.g. Standard, Deluxe, Suite"
                  style={errors.description ? { borderColor: '#e53e3e' } : {}} />
                <FieldError msg={errors.description} />
              </div>
              <div className="form-group">
                <label>Base Price (฿) *</label>
                <input name="base_price" type="number" step="0.01" min={0} value={form.base_price} onChange={handleChange}
                  placeholder="3000"
                  style={errors.base_price ? { borderColor: '#e53e3e' } : {}} />
                <FieldError msg={errors.base_price} />
              </div>
              <div className="form-group">
                <label>Max Occupants</label>
                <input name="max_occupants" type="number" min={1} value={form.max_occupants} onChange={handleChange}
                  style={errors.max_occupants ? { borderColor: '#e53e3e' } : {}} />
                <FieldError msg={errors.max_occupants} />
              </div>
              <div className="form-group">
                <label>Room Size (m²)</label>
                <input name="size_sqm" type="number" step="0.01" min={0} value={form.size_sqm || ''} onChange={handleChange}
                  placeholder="25"
                  style={errors.size_sqm ? { borderColor: '#e53e3e' } : {}} />
                <FieldError msg={errors.size_sqm} />
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
