import { useEffect, useState } from 'react'
import { api } from '../services/http'
import { toast } from 'react-toastify'
import ConfirmDialog from '../components/ConfirmDialog'
import { formatBaht } from '../utils/utils'
import { validateRoomNo, validateRequired, validatePositiveNumber } from '../utils/validation'

const EMPTY = { room_no: '', room_type_id: '', floor: 1, monthly_price: '', status: 'Available', description: '' }

function FieldError({ msg }) {
  if (!msg) return null
  return <span style={{ color: '#e53e3e', fontSize: 11, marginTop: 3, display: 'block' }}>⚠ {msg}</span>
}

export default function RoomsPage() {
  const [rows, setRows] = useState([])
  const [types, setTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [filterStatus, setFilterStatus] = useState('')
  const [search, setSearch] = useState('')
  const [confirm, setConfirm] = useState(null)

  const load = () => {
    setLoading(true)
    Promise.all([api.get('/api/v1/rooms'), api.get('/api/v1/room-types')])
      .then(([r, t]) => { setRows(r); setTypes(t) })
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const open = (row = null) => {
    setEditing(row)
    setForm(row ? { room_no: row.room_no, room_type_id: row.room_type_id, floor: row.floor, monthly_price: row.monthly_price, status: row.status, description: row.description || '' } : EMPTY)
    setErrors({})
    setShowForm(true)
  }

  const handleChange = e => {
    const { name, value } = e.target
    if (name === 'room_type_id') {
      const selected = types.find(t => String(t.room_type_id) === String(value))
      setForm(f => ({ ...f, room_type_id: value, monthly_price: selected ? selected.base_price : f.monthly_price }))
    } else {
      setForm(f => ({ ...f, [name]: value }))
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }))
  }

  const validate = () => {
    const errs = {}
    if (!editing) errs.room_no = validateRoomNo(form.room_no)
    errs.room_type_id = validateRequired(form.room_type_id, 'Room Type')
    errs.floor = form.floor < 1 ? 'Floor must be greater than 0' : null
    errs.monthly_price = validatePositiveNumber(form.monthly_price, 'Monthly Price')
    Object.keys(errs).forEach(k => { if (!errs[k]) delete errs[k] })
    return errs
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); toast.error('Please fix the errors before submitting'); return }
    try {
      if (editing) await api.put(`/api/v1/rooms/${editing.room_no}`, form)
      else await api.post('/api/v1/rooms', form)
      toast.success(editing ? 'Room updated!' : 'Room created!')
      setShowForm(false); load()
    } catch (err) { toast.error(err.message) }
  }

  const handleDelete = async id => {
    try { await api.delete(`/api/v1/rooms/${id}`); toast.success('Deleted'); setConfirm(null); load() }
    catch (err) { toast.error(err.message) }
  }

  const filtered = rows.filter(r => {
    if (filterStatus && r.status !== filterStatus) return false
    if (search.trim()) {
      const kw = search.trim().toLowerCase()
      return r.room_no?.toLowerCase().includes(kw) || r.room_type?.toLowerCase().includes(kw)
    }
    return true
  })

  const statusOptions = ['Available', 'Occupied', 'Maintenance']

  return (
    <>
      <div className="topbar"><h1>🚪 Rooms</h1></div>
      <div className="page-content">
        <div className="page-header">
          <div><h2>Room Management</h2><p>{rows.length} rooms total</p></div>
          <button className="btn btn-primary" onClick={() => open()}>+ New Room</button>
        </div>

        <div className="stats-row">
          {[
            { label: 'Available', cls: 'green' },
            { label: 'Occupied', cls: 'blue' },
            { label: 'Maintenance', cls: 'orange' },
          ].map(({ label, cls }) => (
            <div key={label} className={`stat-card ${cls}`} style={{ cursor: 'pointer' }} onClick={() => setFilterStatus(f => f === label ? '' : label)}>
              <div className="stat-label">{label}</div>
              <div className="stat-value" style={{ fontSize: 22 }}>{rows.filter(r => r.status === label).length}</div>
            </div>
          ))}
        </div>

        <div className="filter-bar" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div className="form-group" style={{ minWidth: 200, flex: '1 1 200px' }}>
            <label>Search (Room No / Type)</label>
            <input placeholder="e.g. 101, Suite, Standard…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="form-group" style={{ minWidth: 140, flex: '1 1 140px' }}>
            <label>Status</label>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">All</option>
              {statusOptions.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <button className="btn btn-ghost" onClick={() => { setSearch(''); setFilterStatus('') }}>✕ Clear</button>
          </div>
        </div>

        <div className="card mb-0">
          <div className="tbl-wrap">
            {loading ? <div className="loading">Loading…</div> :
              <table>
                <thead><tr><th>Room No</th><th>Type</th><th>Floor</th><th>Price/Mo</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {filtered.map(r => (
                    <tr key={r.room_no}>
                      <td><strong>{r.room_no}</strong></td>
                      <td>{r.room_type}</td>
                      <td>Floor {r.floor}</td>
                      <td>{formatBaht(r.monthly_price)}</td>
                      <td><span className={`badge badge-${r.status === 'Available' ? 'available' : r.status === 'Occupied' ? 'occupied' : 'maintenance'}`}>{r.status}</span></td>
                      <td><div className="tbl-actions">
                        <button className="btn btn-outline btn-sm" onClick={() => open(r)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setConfirm(r.room_no)}>Del</button>
                      </div></td>
                    </tr>
                  ))}
                  {!filtered.length && <tr><td colSpan={6}><div className="empty-state"><div className="icon">🚪</div><p>No rooms found</p></div></td></tr>}
                </tbody>
              </table>}
          </div>
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <h2>{editing ? `Edit Room ${editing.room_no}` : 'New Room'}</h2>
              <button className="btn btn-ghost btn-sm" style={{ color: '#fff' }} onClick={() => setShowForm(false)}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} noValidate>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Room No * <small style={{ fontWeight: 400, color: 'var(--text-light)' }}>(e.g. 101, A01)</small></label>
                    <input name="room_no" value={form.room_no} onChange={handleChange}
                      placeholder="101" disabled={!!editing}
                      style={errors.room_no ? { borderColor: '#e53e3e' } : {}} />
                    <FieldError msg={errors.room_no} />
                  </div>
                  <div className="form-group">
                    <label>Room Type *</label>
                    <select name="room_type_id" value={form.room_type_id} onChange={handleChange}
                      style={errors.room_type_id ? { borderColor: '#e53e3e' } : {}}>
                      <option value="">Select…</option>
                      {types.map(t => <option key={t.room_type_id} value={t.room_type_id}>{t.description}</option>)}
                    </select>
                    <FieldError msg={errors.room_type_id} />
                  </div>
                  <div className="form-group">
                    <label>Floor *</label>
                    <input name="floor" type="number" min={1} value={form.floor} onChange={handleChange}
                      style={errors.floor ? { borderColor: '#e53e3e' } : {}} />
                    <FieldError msg={errors.floor} />
                  </div>
                  <div className="form-group">
                    <label>Monthly Price (฿) *</label>
                    <input name="monthly_price" type="number" min={0} step="0.01" value={form.monthly_price} onChange={handleChange}
                      style={errors.monthly_price ? { borderColor: '#e53e3e' } : {}} />
                    {form.room_type_id && <small style={{ color: 'var(--primary)', fontSize: 11, marginTop: 3, display: 'block' }}>Auto-filled from room type base price</small>}
                    <FieldError msg={errors.monthly_price} />
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select name="status" value={form.status} onChange={handleChange}>
                      <option>Available</option>
                      <option>Maintenance</option>
                    </select>
                    <small style={{ color: 'var(--text-light)', fontSize: 11, marginTop: 3, display: 'block' }}>Status "Occupied" is set automatically when a contract is created</small>
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
      {confirm && <ConfirmDialog message={`Delete room ${confirm}?`} onConfirm={() => handleDelete(confirm)} onCancel={() => setConfirm(null)} />}
    </>
  )
}
