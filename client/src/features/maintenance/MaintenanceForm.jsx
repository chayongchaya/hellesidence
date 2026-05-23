import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../services/http'
import { toast } from 'react-toastify'
import { today } from '../../utils/utils'

export default function MaintenanceForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [tenants, setTenants] = useState([])
  const [rooms, setRooms] = useState([])
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(isEdit)

  const [form, setForm] = useState({
    request_date: today(), tenant_id: '', room_no: '',
    issue_type: 'Plumbing', priority_level: 'Medium', description: '',
    technician_staff_id: '', estimated_cost: '', actual_cost: '',
    status: 'Pending', completion_date: ''
  })

  useEffect(() => {
    Promise.all([
      api.get('/api/v1/tenants'),
      api.get('/api/v1/rooms'),
      api.get('/api/v1/staff'),
    ]).then(([t, r, s]) => { setTenants(t); setRooms(r); setStaff(s) })
    if (isEdit) {
      api.get(`/api/v1/maintenance-tickets/${id}`).then(d => {
        setForm({
          ...d,
          request_date: d.request_date?.split('T')[0] || today(),
          completion_date: d.completion_date?.split('T')[0] || '',
          estimated_cost: d.estimated_cost || '',
          actual_cost: d.actual_cost || '',
          technician_staff_id: d.technician_staff_id || '',
          })
      }).catch(err => { toast.error('Failed to load: ' + err.message) })
        .finally(() => setLoading(false))
    }
  }, [])

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    const payload = { ...form }
    if (!payload.technician_staff_id) delete payload.technician_staff_id
    if (!payload.estimated_cost) delete payload.estimated_cost
    if (!payload.actual_cost) delete payload.actual_cost
    if (!payload.completion_date) delete payload.completion_date
    delete payload.notes
    try {
      if (isEdit) {
        await api.put(`/api/v1/maintenance-tickets/${id}`, payload)
        toast.success('Ticket updated!')
        navigate(`/maintenance/${id}/view`)
      } else {
        const created = await api.post('/api/v1/maintenance-tickets', payload)
        toast.success('Ticket created!')
        navigate(`/maintenance/${created.ticket_no}/view?created=1`)
      }
    } catch (err) { toast.error(err.message) }
  }

  if (loading) return <div className="loading">Loading…</div>

  return (
    <>
      <div className="topbar"><h1>{isEdit ? 'Edit Maintenance Ticket' : 'New Maintenance Ticket'}</h1></div>
      <div className="page-content">
        <form onSubmit={handleSubmit}>
          <div className="card">
            <div className="card-header"><h3><span style={{display:"inline-flex",alignItems:"center",gap:6}}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>Ticket Details</span></h3></div>
            <div className="card-body">
              <div className="form-grid">
                <div className="form-group"><label>Request Date *</label><input type="date" name="request_date" value={form.request_date} onChange={handleChange} required /></div>
                <div className="form-group">
                  <label>Tenant *</label>
                  <select name="tenant_id" value={form.tenant_id} onChange={handleChange} required>
                    <option value="">Select Tenant…</option>
                    {tenants.map(t => <option key={t.tenant_id} value={t.tenant_id}>{t.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Room *</label>
                  <select name="room_no" value={form.room_no} onChange={handleChange} required>
                    <option value="">Select Room…</option>
                    {rooms.map(r => <option key={r.room_no} value={r.room_no}>{r.room_no}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Issue Type *</label>
                  <select name="issue_type" value={form.issue_type} onChange={handleChange}>
                    <option>Plumbing</option><option>Electrical</option><option>Furniture</option><option>Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority *</label>
                  <select name="priority_level" value={form.priority_level} onChange={handleChange}>
                    <option>Low</option><option>Medium</option><option>High</option><option>Urgent</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select name="status" value={form.status} onChange={handleChange}>
                    <option>Pending</option><option>In Progress</option><option>Completed</option>
                  </select>
                </div>
                <div className="form-group full">
                  <label>Description *</label>
                  <textarea name="description" value={form.description} onChange={handleChange} rows={3} required style={{ resize: 'vertical' }} />
                </div>
                <div className="form-group">
                  <label>Technician</label>
                  <select name="technician_staff_id" value={form.technician_staff_id} onChange={handleChange}>
                    <option value="">None assigned</option>
                    {staff.map(s => <option key={s.staff_id} value={s.staff_id}>{s.name} ({s.position})</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Estimated Cost (฿)</label><input type="number" step="0.01" min="0" name="estimated_cost" value={form.estimated_cost} onChange={handleChange} /></div>
                <div className="form-group"><label>Actual Cost (฿)</label><input type="number" step="0.01" min="0" name="actual_cost" value={form.actual_cost} onChange={handleChange} /></div>
                <div className="form-group"><label>Completion Date</label><input type="date" name="completion_date" value={form.completion_date} onChange={handleChange} /></div>

              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/maintenance')}>Cancel</button>
            <button type="submit" className="btn btn-primary"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:5,verticalAlign:"middle"}}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> {isEdit ? 'Update' : 'Save'} Ticket</button>
          </div>
        </form>
      </div>
    </>
  )
}