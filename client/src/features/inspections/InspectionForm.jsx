import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../services/http'
import { toast } from 'react-toastify'
import { formatBaht, today } from '../../utils/utils'

export default function InspectionForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [tenants, setTenants]   = useState([])
  const [rooms, setRooms]       = useState([])
  const [staff, setStaff]       = useState([])
  const [furniture, setFurniture] = useState([])
  const [loading, setLoading]   = useState(isEdit)

  const [form, setForm] = useState({
    inspection_date: today(), tenant_id: '', room_no: '',
    inspector_staff_id: '', result: 'Pass', line_items: []
  })

  useEffect(() => {
    Promise.all([
      api.get('/api/v1/tenants'),
      api.get('/api/v1/rooms'),
      api.get('/api/v1/staff'),
      api.get('/api/v1/furniture'),
    ]).then(([t, r, s, f]) => { setTenants(t); setRooms(r); setStaff(s); setFurniture(f) })
    if (isEdit) {
      api.get(`/api/v1/room-inspections/${id}`).then(d => {
        const { line_items, ...rest } = d
        setForm({
          ...rest,
          inspection_date: rest.inspection_date?.split('T')[0] || today(),
          line_items: (line_items || []).map(l => ({
            item_checked: l.item_checked, condition: l.condition,
            fine_amount: l.fine_amount || 0, notes: l.notes || ''
          }))
        })
      }).catch(err => { toast.error('Failed to load: ' + err.message) })
        .finally(() => setLoading(false))
    }
  }, [])

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const addLine = () => setForm(f => ({ ...f, line_items: [...f.line_items, { item_checked: '', condition: 'Good', fine_amount: 0, notes: '' }] }))
  const removeLine = i => setForm(f => ({ ...f, line_items: f.line_items.filter((_, j) => j !== i) }))
  const updateLine = (i, field, value) => setForm(f => {
    const li = [...f.line_items]
    li[i] = { ...li[i], [field]: value }
    if (field === 'item_checked') {
      const match = furniture.find(furn => furn.name === value)
      if (match) li[i].fine_amount = match.default_price
    }
    if (field === 'condition' && (value === 'Good' || value === 'Fair')) li[i].fine_amount = 0
    return { ...f, line_items: li }
  })

  const totalFines = form.line_items.reduce((s, l) => s + parseFloat(l.fine_amount || 0), 0)

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      if (isEdit) {
        await api.put(`/api/v1/room-inspections/${id}`, form)
        toast.success('Inspection updated!')
        navigate(`/inspections/${id}/view`)
      } else {
        const created = await api.post('/api/v1/room-inspections', form)
        toast.success('Inspection saved!')
        navigate(`/inspections/${created.inspection_no}/view?created=1`)
      }
    } catch (err) { toast.error(err.message) }
  }

  if (loading) return <div className="loading">Loading…</div>

  return (
    <>
      <div className="topbar"><h1>{isEdit ? 'Edit Inspection' : 'New Room Inspection'}</h1></div>
      <div className="page-content">
        <form onSubmit={handleSubmit}>
          <div className="card">
            <div className="card-header"><h3><span style={{display:"inline-flex",alignItems:"center",gap:6}}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>Inspection Header</span></h3></div>
            <div className="card-body">
              <div className="form-grid">
                <div className="form-group"><label>Inspection Date *</label><input type="date" name="inspection_date" value={form.inspection_date} onChange={handleChange} required /></div>
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
                    {rooms.map(r => <option key={r.room_no} value={r.room_no}>{r.room_no} – {r.room_type}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Inspector Staff *</label>
                  <select name="inspector_staff_id" value={form.inspector_staff_id} onChange={handleChange} required>
                    <option value="">Select Staff…</option>
                    {staff.map(s => <option key={s.staff_id} value={s.staff_id}>{s.name} ({s.position})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Result *</label>
                  <select name="result" value={form.result} onChange={handleChange}>
                    <option>Pass</option><option>Fail</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Total Fines</label>
                  <input value={formatBaht(totalFines)} readOnly style={{ background: '#f0f2f5', fontWeight: 700, color: totalFines > 0 ? '#b71c1c' : '#2e7d32' }} />
                </div>
              </div>
              {form.result === 'Pass' && <p style={{ marginTop: 12, color: '#2e7d32', fontSize: 12 }}>✅ Saving with Pass will automatically set room status to Available.</p>}
            </div>
          </div>

          <div className="card">
            <div className="line-items-header">
              <h4><span style={{display:"inline-flex",alignItems:"center",gap:6}}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>Items Inspected</span></h4>
              <button type="button" className="btn btn-sm" style={{ background: 'rgba(255,255,255,.2)', color: '#fff' }} onClick={addLine}>+ Add Item</button>
            </div>
            <div className="tbl-wrap">
              <table className="line-items-table">
                <thead><tr><th>Item Checked</th><th>Condition</th><th>Fine Amount (฿)</th><th>Notes</th><th></th></tr></thead>
                <tbody>
                  {form.line_items.map((li, i) => (
                    <tr key={i}>
                      <td style={{minWidth:200}}>
                        <div style={{position:'relative'}}>
                          <input
                            list={`furniture-list-${i}`}
                            value={li.item_checked}
                            onChange={e => updateLine(i, 'item_checked', e.target.value)}
                            placeholder="Select or type item…"
                            required
                            style={{width:'100%'}}
                          />
                          <datalist id={`furniture-list-${i}`}>
                            {furniture.map(f => (
                              <option key={f.item_id} value={f.name}>{f.name} – ฿{Number(f.default_price).toLocaleString()}</option>
                            ))}
                          </datalist>
                          {furniture.find(f => f.name === li.item_checked) && (
                            <small style={{color:'var(--primary)',fontSize:11,marginTop:2,display:'block'}}>
                              ✔ Price ฿{Number(furniture.find(f=>f.name===li.item_checked).default_price).toLocaleString()} auto-filled
                            </small>
                          )}
                        </div>
                      </td>
                      <td style={{ width: 130 }}>
                        <select value={li.condition} onChange={e => updateLine(i, 'condition', e.target.value)}>
                          {['Good', 'Fair', 'Damaged', 'Missing'].map(c => <option key={c}>{c}</option>)}
                        </select>
                      </td>
                      <td style={{ width: 120 }}>
                        <input type="number" step="0.01" min="0" value={li.fine_amount}
                          onChange={e => updateLine(i, 'fine_amount', e.target.value)}
                          style={{ color: parseFloat(li.fine_amount) > 0 ? '#b71c1c' : 'inherit' }} />
                      </td>
                      <td><input value={li.notes} onChange={e => updateLine(i, 'notes', e.target.value)} placeholder="Remarks…" /></td>
                      <td><button type="button" className="btn btn-danger btn-sm btn-icon" onClick={() => removeLine(i)}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></td>
                    </tr>
                  ))}
                  {!form.line_items.length && <tr><td colSpan={5} style={{ textAlign: 'center', color: '#aaa', padding: 16 }}>No items — click "+ Add Item"</td></tr>}
                  <tr className="line-total-row">
                    <td colSpan={2} style={{ textAlign: 'right', paddingRight: 12 }}>Total Fines:</td>
                    <td colSpan={3} style={{ color: totalFines > 0 ? '#b71c1c' : '#2e7d32' }}>{formatBaht(totalFines)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/inspections')}>Cancel</button>
            <button type="submit" className="btn btn-primary"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:5,verticalAlign:"middle"}}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> {isEdit ? 'Update' : 'Save'} Inspection</button>
          </div>
        </form>
      </div>
    </>
  )
}