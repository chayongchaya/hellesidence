import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../services/http'
import { toast } from 'react-toastify'
import { formatBaht, today } from '../../utils/utils'

// Badge color per room type
const TYPE_COLORS = {
  Standard: { bg: '#e3f2fd', color: '#1565c0', border: '#90caf9' },
  Deluxe:   { bg: '#f3e5f5', color: '#6a1b9a', border: '#ce93d8' },
  Suite:    { bg: '#fff8e1', color: '#e65100', border: '#ffcc02' },
}

const EMPTY_LINE = { item_id: '', item_name: '', category: '', quantity: 1, condition: 'Good', notes: '' }

export default function ContractForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [tenants, setTenants]     = useState([])
  const [rooms, setRooms]         = useState([])
  const [furniture, setFurniture] = useState([])
  const [loading, setLoading]     = useState(isEdit)
  const [selectedRoom, setSelectedRoom] = useState(null)

  const [form, setForm] = useState({
    contract_date: today(), tenant_id: '', room_no: '',
    start_date: today(), end_date: '', deposit_amount: '', monthly_rent: '', line_items: []
  })

  useEffect(() => {
    Promise.all([
      api.get('/api/v1/tenants'),
      api.get('/api/v1/rooms'),
      api.get('/api/v1/furniture'),
    ]).then(([t, r, f]) => {
      setTenants(t); setRooms(r); setFurniture(f)
    })
    if (isEdit) {
      api.get(`/api/v1/contracts/${id}`).then(d => {
        const { line_items, ...rest } = d
        setForm({
          ...rest,
          contract_date: rest.contract_date?.split('T')[0] || today(),
          start_date: rest.start_date?.split('T')[0] || today(),
          end_date: rest.end_date?.split('T')[0] || '',
          line_items: (line_items || []).map(l => ({
            item_id: l.item_id, item_name: l.item_name, category: l.category,
            quantity: l.quantity, condition: l.condition, notes: l.notes || ''
          }))
        })
      }).catch(err => { toast.error('Failed to load: ' + err.message) })
        .finally(() => setLoading(false))
    }
  }, [])

  // Sync selectedRoom whenever rooms list loads and form.room_no is set (edit mode)
  useEffect(() => {
    if (form.room_no && rooms.length) {
      const room = rooms.find(r => r.room_no === form.room_no)
      setSelectedRoom(room || null)
    }
  }, [rooms, form.room_no])

  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => {
      const updated = { ...f, [name]: value }
      if (name === 'room_no') {
        const room = rooms.find(r => r.room_no === value)
        setSelectedRoom(room || null)
        if (room) updated.monthly_rent = room.monthly_price
      }
      return updated
    })
  }

  const addLine = () => setForm(f => ({ ...f, line_items: [...f.line_items, { ...EMPTY_LINE }] }))
  const removeLine = i => setForm(f => ({ ...f, line_items: f.line_items.filter((_, j) => j !== i) }))
  const updateLine = (i, field, value) => setForm(f => {
    const li = [...f.line_items]
    li[i] = { ...li[i], [field]: value }
    if (field === 'item_id') {
      const furn = furniture.find(x => String(x.item_id) === String(value))
      if (furn) { li[i].item_name = furn.name; li[i].category = furn.category }
    }
    return { ...f, line_items: li }
  })

  const months = () => {
    if (!form.start_date || !form.end_date) return 0
    return Math.round((new Date(form.end_date) - new Date(form.start_date)) / (1000*60*60*24*30.44))
  }
  const totalValue = () => (parseFloat(form.monthly_rent || 0) * months()).toFixed(2)

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      const payload = { ...form, line_items: form.line_items }
      if (isEdit) {
        await api.put(`/api/v1/contracts/${id}`, payload)
        toast.success('Contract updated!')
        navigate(`/contracts/${id}/view`)
      } else {
        const created = await api.post('/api/v1/contracts', payload)
        toast.success('Contract created!')
        navigate(`/contracts/${created.contract_no}/view?created=1`)
      }
    } catch (err) { toast.error(err.message) }
  }

  if (loading) return <div className="loading">Loading…</div>

  return (
    <>
      <div className="topbar"><h1>{isEdit ? 'Edit Contract' : 'New Rental Contract'}</h1></div>
      <div className="page-content">
        <form onSubmit={handleSubmit}>
          <div className="card">
            <div className="card-header"><h3><span style={{display:"inline-flex",alignItems:"center",gap:6}}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>Contract Header</span></h3></div>
            <div className="card-body">
              <div className="form-grid">
                <div className="form-group"><label>Contract Date *</label><input type="date" name="contract_date" value={form.contract_date} onChange={handleChange} required /></div>
                <div className="form-group">
                  <label>Tenant *</label>
                  <select name="tenant_id" value={form.tenant_id} onChange={handleChange} required>
                    <option value="">Select Tenant…</option>
                    {tenants.map(t => <option key={t.tenant_id} value={t.tenant_id}>{t.name} (T{String(t.tenant_id).padStart(3,'0')})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Room *</label>
                  <select name="room_no" value={form.room_no} onChange={handleChange} required>
                    <option value="">Select Room…</option>
                  {rooms
                    .filter(r => r.status !== 'Occupied' || r.room_no === form.room_no)
                    .map(r => (
                      <option key={r.room_no} value={r.room_no}>
                        {r.room_no} – {r.room_type} ({formatBaht(r.monthly_price)}/mo){r.status === 'Maintenance' ? ' ⚠ Maintenance' : ''}
                      </option>
                    ))
                  }
                  </select>
                  {selectedRoom && (() => {
                    const c = TYPE_COLORS[selectedRoom.room_type] || { bg:'#f0f2f5', color:'#555', border:'#ccc' }
                    return (
                      <div style={{marginTop:6,display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                        <span style={{fontSize:11,fontWeight:700,padding:'2px 9px',borderRadius:12,background:c.bg,color:c.color,border:`1px solid ${c.border}`}}>
                          {selectedRoom.room_type}
                        </span>
                        <span style={{fontSize:11,color:'var(--text-light)'}}>Floor {selectedRoom.floor}</span>
                        <span style={{fontSize:11,color:'#2e7d32',fontWeight:600}}>
                          Base price: {formatBaht(selectedRoom.base_price)}/mo
                        </span>
                      </div>
                    )
                  })()}
                </div>
                <div className="form-group">
                  <label>Monthly Rent (฿) *</label>
                  <input
                    type="number"
                    name="monthly_rent"
                    step="0.01"
                    value={form.monthly_rent}
                    readOnly
                    style={{background:'#f0f2f5', fontWeight:600, color:'#1a237e', cursor:'not-allowed'}}
                  />
                  {selectedRoom
                    ? <small style={{color:'var(--primary)',fontSize:11,marginTop:3,display:'block'}}>✔ Auto-filled from Room {selectedRoom.room_no} ({selectedRoom.room_type})</small>
                    : <small style={{color:'#e57373',fontSize:11,marginTop:3,display:'block'}}>Select a room above to set the price automatically</small>
                  }
                </div>
                <div className="form-group"><label>Start Date *</label><input type="date" name="start_date" value={form.start_date} onChange={handleChange} required /></div>
                <div className="form-group"><label>End Date *</label><input type="date" name="end_date" value={form.end_date} onChange={handleChange} required /></div>
                <div className="form-group"><label>Deposit Amount (฿) *</label><input type="number" name="deposit_amount" step="0.01" value={form.deposit_amount} onChange={handleChange} required /></div>
                <div className="form-group">
                  <label>Total Contract Value</label>
                  <input value={`฿${Number(totalValue()).toLocaleString('th-TH', {minimumFractionDigits:2})}`} readOnly style={{background:'#f0f2f5', fontWeight:700, color:'#1a237e'}} />
                </div>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="card">
            <div className="line-items-header">
              <h4><span style={{display:"inline-flex",alignItems:"center",gap:6}}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3"/><path d="M2 11v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H6v-2a2 2 0 0 0-4 0z"/></svg>Furniture / Facility Inventory</span></h4>
              <button type="button" className="btn btn-sm" style={{background:'rgba(255,255,255,.2)', color:'#fff'}} onClick={addLine}>+ Add Item</button>
            </div>
            <div className="tbl-wrap">
              <table className="line-items-table">
                <thead>
                  <tr><th>Furniture</th><th>Item Name</th><th>Category</th><th>Qty</th><th>Condition</th><th>Notes</th><th></th></tr>
                </thead>
                <tbody>
                  {form.line_items.map((li, i) => (
                    <tr key={i}>
                      <td style={{minWidth:160}}>
                        <select value={li.item_id} onChange={e => updateLine(i,'item_id',e.target.value)}>
                          <option value="">Select…</option>
                          {furniture.map(f => <option key={f.item_id} value={f.item_id}>{f.name}</option>)}
                        </select>
                      </td>
                      <td><input value={li.item_name} readOnly style={{background:'#f8f9fa'}} /></td>
                      <td><input value={li.category} readOnly style={{background:'#f8f9fa'}} /></td>
                      <td style={{width:70}}><input type="number" min={1} value={li.quantity} onChange={e => updateLine(i,'quantity',e.target.value)} /></td>
                      <td style={{width:120}}>
                        <select value={li.condition} onChange={e => updateLine(i,'condition',e.target.value)}>
                          {['Good','Fair','Damaged'].map(c => <option key={c}>{c}</option>)}
                        </select>
                      </td>
                      <td><input value={li.notes} onChange={e => updateLine(i,'notes',e.target.value)} placeholder="Notes…" /></td>
                      <td><button type="button" className="btn btn-danger btn-sm btn-icon" onClick={() => removeLine(i)}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></td>
                    </tr>
                  ))}
                  {!form.line_items.length && <tr><td colSpan={7} style={{textAlign:'center', color:'#aaa', padding:16}}>No items — click "+ Add Item"</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{display:'flex', gap:12, justifyContent:'flex-end'}}>
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/contracts')}>Cancel</button>
            <button type="submit" className="btn btn-primary"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:5,verticalAlign:"middle"}}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> {isEdit ? 'Update' : 'Save'} Contract</button>
          </div>
        </form>
      </div>
    </>
  )
}