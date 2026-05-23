import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../services/http'
import { toast } from 'react-toastify'
import { formatBaht, today } from '../../utils/utils'

function InfoRow({ icon, label, value }) {
  return (
    <div style={{display:'flex', alignItems:'flex-start', gap:8, marginBottom:8, fontSize:13}}>
      <span style={{width:18, flexShrink:0, textAlign:'center'}}>{icon}</span>
      <span style={{color:'#888', minWidth:70, flexShrink:0}}>{label}:</span>
      <span style={{color:'#333', fontWeight:500, wordBreak:'break-word'}}>{value}</span>
    </div>
  )
}

export default function BillingForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [tenants, setTenants]   = useState([])
  const [rooms, setRooms]       = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(isEdit)
  const [saving, setSaving]     = useState(false)

  // Info cards for selected tenant / room
  const [tenantInfo, setTenantInfo] = useState(null)
  const [roomInfo, setRoomInfo]     = useState(null)

  const [form, setForm] = useState({
    bill_date: today(), billing_month: today().slice(0,7), tenant_id: '', room_no: '',
    due_date: '', line_items: []
  })

  useEffect(() => {
    Promise.all([
      api.get('/api/v1/tenants'),
      api.get('/api/v1/rooms?status=Occupied'),
      api.get('/api/v1/product-codes'),
    ]).then(([t, r, p]) => { setTenants(t); setRooms(r); setProducts(p) })

    if (isEdit) {
      api.get(`/api/v1/monthly-bills/${id}`).then(d => {
        const { line_items, ...rest } = d
        setForm({
          ...rest,
          bill_date: rest.bill_date?.split('T')[0] || today(),
          due_date: rest.due_date?.split('T')[0] || '',
          line_items: (line_items||[]).map(l => ({
            product_code: l.product_code, product_name: l.product_name, product_type: l.product_type,
            description: l.description||'', quantity: l.quantity, unit_price: l.unit_price, notes: l.notes||''
          }))
        })
        if (rest.tenant_id) api.get(`/api/v1/tenants/${rest.tenant_id}`).then(setTenantInfo).catch(() => {})
        if (rest.room_no)   api.get(`/api/v1/rooms/${rest.room_no}`).then(setRoomInfo).catch(() => {})
      }).catch(err => {
        toast.error('Failed to load bill: ' + err.message)
      }).finally(() => {
        setLoading(false)
      })
    }
  }, [])

  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    if (name === 'tenant_id') {
      if (value) api.get(`/api/v1/tenants/${value}`).then(setTenantInfo).catch(() => setTenantInfo(null))
      else setTenantInfo(null)
    }
    if (name === 'room_no') {
      if (value) {
        api.get(`/api/v1/rooms/${value}`).then(info => {
          setRoomInfo(info)
          // Update unit_price of any existing Rent-type line items to match new room price
          if (info?.monthly_price) {
            setForm(f => ({
              ...f,
              line_items: f.line_items.map(li =>
                li.product_type === 'Rent'
                  ? { ...li, unit_price: info.monthly_price }
                  : li
              )
            }))
          }
        }).catch(() => setRoomInfo(null))
      } else {
        setRoomInfo(null)
      }
    }
  }

  const addLine    = () => { setForm(f => ({ ...f, line_items: [...f.line_items, { product_code:'', product_name:'', product_type:'', description:'', quantity:1, unit_price:'', notes:'' }] })) }
  const removeLine = i  => { setForm(f => ({ ...f, line_items: f.line_items.filter((_,j) => j!==i) })) }
  const updateLine = (i, field, value) => {
    setForm(f => {
      const li = [...f.line_items]
      li[i] = { ...li[i], [field]: value }
      if (field === 'product_code') {
        const p = products.find(x => x.product_code === value)
        if (p) {
          li[i].product_name = p.product_name
          li[i].product_type = p.product_type
          // For Rent type: use the actual room's monthly_price, not the hardcoded default
          if (p.product_type === 'Rent' && roomInfo?.monthly_price) {
            li[i].unit_price = roomInfo.monthly_price
          } else {
            li[i].unit_price = p.default_unit_price
          }
        }
      }
      return { ...f, line_items: li }
    })
  }

  const lineAmount  = li => (parseFloat(li.quantity||0) * parseFloat(li.unit_price||0))
  const totalAmount = form.line_items.reduce((s, li) => s + lineAmount(li), 0)

  const handleSubmit = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      if (isEdit) {
        await api.put(`/api/v1/monthly-bills/${id}`, form)
        toast.success('Bill updated!')
        navigate(`/billing/${id}/view`)
      } else {
        const created = await api.post('/api/v1/monthly-bills', form)
        toast.success('Bill created!')
        navigate(`/billing/${created.bill_no}/view?created=1`)
      }
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="loading">Loading…</div>

  return (
    <>
      <div className="topbar"><h1>{isEdit ? 'Edit Bill' : 'New Monthly Bill'}</h1></div>
      <div className="page-content">
        <form onSubmit={handleSubmit}>

          {/* ── Bill Header ─────────────────────────────────── */}
          <div className="card">
            <div className="card-header">
              <h3>
                <span style={{display:'inline-flex',alignItems:'center',gap:6}}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                  Bill Header
                </span>
              </h3>
            </div>
            <div className="card-body">
              <div className="form-grid">
                <div className="form-group"><label>Bill Date *</label><input type="date" name="bill_date" value={form.bill_date} onChange={handleChange} required /></div>
                <div className="form-group"><label>Billing Month *</label><input type="month" name="billing_month" value={form.billing_month} onChange={handleChange} required /></div>
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
                <div className="form-group"><label>Due Date *</label><input type="date" name="due_date" value={form.due_date} onChange={handleChange} required /></div>
                <div className="form-group">
                  <label>Total Bill Amount</label>
                  <input value={formatBaht(totalAmount)} readOnly style={{background:'#f0f2f5', fontWeight:700, color:'#1a237e'}} />
                </div>
              </div>

              {/* Info Cards */}
              {(tenantInfo || roomInfo) && (
                <div style={{
                  display:'grid',
                  gridTemplateColumns: tenantInfo && roomInfo ? '1fr 1fr' : '1fr',
                  gap:16, marginTop:20
                }}>
                  {tenantInfo && (
                    <div style={{background:'linear-gradient(135deg,#e8eaf6 0%,#f3f4fb 100%)',border:'1px solid #c5cae9',borderRadius:10,padding:'16px 20px'}}>
                      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
                        <span style={{width:36,height:36,borderRadius:'50%',background:'#3949ab',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        </span>
                        <div>
                          <div style={{fontSize:10,color:'#5c6bc0',fontWeight:700,textTransform:'uppercase',letterSpacing:.8}}>Tenant Info</div>
                          <div style={{fontWeight:700,color:'#1a237e',fontSize:15,lineHeight:1.2}}>{tenantInfo.name}</div>
                        </div>
                      </div>
                      <InfoRow icon="📞" label="Phone"   value={tenantInfo.phone     || '—'} />
                      <InfoRow icon="✉️"  label="Email"   value={tenantInfo.email     || '—'} />
                      <InfoRow icon="🏠" label="Address" value={tenantInfo.address    || '—'} />
                      <InfoRow icon="🪪" label="ID Card" value={tenantInfo.id_card_no || '—'} />
                    </div>
                  )}
                  {roomInfo && (
                    <div style={{background:'linear-gradient(135deg,#e8f5e9 0%,#f1f8f2 100%)',border:'1px solid #c8e6c9',borderRadius:10,padding:'16px 20px'}}>
                      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
                        <span style={{width:36,height:36,borderRadius:'50%',background:'#2e7d32',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                        </span>
                        <div>
                          <div style={{fontSize:10,color:'#388e3c',fontWeight:700,textTransform:'uppercase',letterSpacing:.8}}>Room Info</div>
                          <div style={{fontWeight:700,color:'#1b5e20',fontSize:15,lineHeight:1.2}}>Room {roomInfo.room_no}</div>
                        </div>
                      </div>
                      <InfoRow icon="🏷️" label="Type"          value={roomInfo.room_type || roomInfo.description || '—'} />
                      <InfoRow icon="📐" label="Floor"         value={roomInfo.floor != null ? `Floor ${roomInfo.floor}` : '—'} />
                      <InfoRow icon="💰" label="Monthly Price" value={roomInfo.monthly_price != null ? formatBaht(roomInfo.monthly_price) : '—'} />
                      <InfoRow icon="🔖" label="Status"        value={roomInfo.status || '—'} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Line Items ──────────────────────────────────── */}
          <div className="card">
            <div className="line-items-header">
              <h4>
                <span style={{display:'inline-flex',alignItems:'center',gap:6}}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  Charges
                </span>
              </h4>
              <button type="button" className="btn btn-sm" style={{background:'rgba(255,255,255,.2)',color:'#fff'}} onClick={addLine}>+ Add Charge</button>
            </div>
            <div className="tbl-wrap">
              <table className="line-items-table">
                <thead><tr><th>Product Code</th><th>Description</th><th>Qty/Units</th><th>Unit Price (฿)</th><th>Amount (฿)</th><th>Notes</th><th></th></tr></thead>
                <tbody>
                  {form.line_items.map((li, i) => (
                    <tr key={i}>
                      <td style={{minWidth:150}}>
                        <select value={li.product_code} onChange={e => updateLine(i,'product_code',e.target.value)}>
                          <option value="">Select…</option>
                          {products.map(p => <option key={p.product_code} value={p.product_code}>{p.product_code} – {p.product_name}</option>)}
                        </select>
                      </td>
                      <td><input value={li.description} onChange={e => updateLine(i,'description',e.target.value)} placeholder="Description…" /></td>
                      <td style={{width:80}}><input type="number" step="0.01" value={li.quantity} onChange={e => updateLine(i,'quantity',e.target.value)} /></td>
                      <td style={{width:110}}><input type="number" step="0.01" value={li.unit_price} onChange={e => updateLine(i,'unit_price',e.target.value)} /></td>
                      <td style={{width:110,fontWeight:700,color:'#1a237e',textAlign:'right'}}>{formatBaht(lineAmount(li))}</td>
                      <td><input value={li.notes} onChange={e => updateLine(i,'notes',e.target.value)} placeholder="Notes…" /></td>
                      <td><button type="button" className="btn btn-danger btn-sm btn-icon" onClick={() => removeLine(i)}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></td>
                    </tr>
                  ))}
                  {!form.line_items.length && <tr><td colSpan={7} style={{textAlign:'center',color:'#aaa',padding:16}}>No charges — click "+ Add Charge"</td></tr>}
                  <tr className="line-total-row">
                    <td colSpan={4} style={{textAlign:'right',paddingRight:12}}>Total Bill Amount:</td>
                    <td colSpan={3} style={{color:'#1a237e'}}>{formatBaht(totalAmount)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div style={{display:'flex', gap:12, justifyContent:'flex-end'}}>
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/billing')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:5,verticalAlign:'middle'}}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              {saving ? 'Saving…' : isEdit ? 'Update Bill' : 'Save Bill'}
            </button>
          </div>
        </form>

      </div>
    </>
  )
}