import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../services/http'
import { toast } from 'react-toastify'
import { formatBaht, today } from '../../utils/utils'

export default function PaymentForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [tenants, setTenants] = useState([])
  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(isEdit)

  const [form, setForm] = useState({
    receipt_date: today(), tenant_id: '', room_no: '',
    payment_method: 'Cash', reference_number: '', line_items: []
  })

  useEffect(() => {
    api.get('/api/v1/tenants').then(setTenants)
    if (isEdit) {
      api.get(`/api/v1/payment-receipts/${id}`).then(d => {
        const { line_items, ...rest } = d
        setForm({
          ...rest,
          receipt_date: rest.receipt_date?.split('T')[0] || today(),
          line_items: (line_items || []).map(l => ({
            bill_no: l.bill_no, billing_month: l.billing_month,
            bill_total_amount: l.bill_total_amount, amount_paid: l.amount_paid, notes: l.notes || ''
          }))
        })
        if (rest.tenant_id) loadBills(rest.tenant_id)
      }).catch(err => { toast.error('Failed to load: ' + err.message) })
        .finally(() => setLoading(false))
    }
  }, [])

  const loadBills = (tid) => {
    api.get(`/api/v1/monthly-bills?tenant_id=${tid}`).then(setBills)
  }

  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => {
      const updated = { ...f, [name]: value }
      if (name === 'tenant_id') { loadBills(value); updated.line_items = [] }
      return updated
    })
  }

  const addLine = () => setForm(f => ({ ...f, line_items: [...f.line_items, { bill_no: '', billing_month: '', bill_total_amount: '', amount_paid: '', notes: '' }] }))
  const removeLine = i => setForm(f => ({ ...f, line_items: f.line_items.filter((_, j) => j !== i) }))
  const updateLine = (i, field, value) => setForm(f => {
    const li = [...f.line_items]
    li[i] = { ...li[i], [field]: value }
    if (field === 'bill_no') {
      const bill = bills.find(b => String(b.bill_no) === String(value))
      if (bill) {
        li[i].billing_month = bill.billing_month
        li[i].bill_total_amount = bill.total_bill_amount
        li[i].amount_paid = bill.balance_due
        // Set room_no from first bill
        setForm(ff => ({ ...ff, room_no: bill.room_no }))
      }
    }
    return { ...f, line_items: li }
  })

  const totalPaid = form.line_items.reduce((s, l) => s + parseFloat(l.amount_paid || 0), 0)

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      if (isEdit) {
        toast.info('Receipts cannot be edited. Please delete and re-create if needed.')
        return
      }
      const created = await api.post('/api/v1/payment-receipts', form)
      toast.success('Receipt created!')
      navigate(`/payments/${created.receipt_no}/view?created=1`)
    } catch (err) { toast.error(err.message) }
  }

  if (loading) return <div className="loading">Loading…</div>

  return (
    <>
      <div className="topbar"><h1>{isEdit ? 'View/Edit Receipt' : 'New Payment Receipt'}</h1></div>
      <div className="page-content">
        <form onSubmit={handleSubmit}>
          <div className="card">
            <div className="card-header"><h3><span style={{display:"inline-flex",alignItems:"center",gap:6}}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>Receipt Header</span></h3></div>
            <div className="card-body">
              <div className="form-grid">
                <div className="form-group"><label>Receipt Date *</label><input type="date" name="receipt_date" value={form.receipt_date} onChange={handleChange} required /></div>
                <div className="form-group">
                  <label>Tenant *</label>
                  <select name="tenant_id" value={form.tenant_id} onChange={handleChange} required>
                    <option value="">Select Tenant…</option>
                    {tenants.map(t => <option key={t.tenant_id} value={t.tenant_id}>{t.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Payment Method *</label>
                  <select name="payment_method" value={form.payment_method} onChange={handleChange} required>
                    <option>Cash</option><option>Transfer</option><option>Card</option>
                  </select>
                </div>
                <div className="form-group"><label>Reference Number</label><input name="reference_number" value={form.reference_number || ''} onChange={handleChange} placeholder="TXN-xxxx" /></div>
                <div className="form-group">
                  <label>Total Paid</label>
                  <input value={formatBaht(totalPaid)} readOnly style={{ background: '#f0f2f5', fontWeight: 700, color: '#2e7d32' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="line-items-header">
              <h4><span style={{display:"inline-flex",alignItems:"center",gap:6}}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>Bills Being Paid</span></h4>
              <button type="button" className="btn btn-sm" style={{ background: 'rgba(255,255,255,.2)', color: '#fff' }} onClick={addLine}>+ Add Bill</button>
            </div>
            <div className="tbl-wrap">
              <table className="line-items-table">
                <thead><tr><th>Bill No</th><th>Billing Month</th><th>Bill Total (฿)</th><th>Amount Paid (฿)</th><th>Notes</th><th></th></tr></thead>
                <tbody>
                  {form.line_items.map((li, i) => (
                    <tr key={i}>
                      <td style={{ minWidth: 140 }}>
                        <select value={li.bill_no} onChange={e => updateLine(i, 'bill_no', e.target.value)}>
                          <option value="">Select Bill…</option>
                          {bills.filter(b => b.status !== 'Fully Paid').map(b => (
                            <option key={b.bill_no} value={b.bill_no}>
                              B{String(b.bill_no).padStart(4,'0')} – {b.billing_month} (bal: ฿{Number(b.balance_due).toLocaleString()})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td><input value={li.billing_month || ''} readOnly style={{ background: '#f8f9fa' }} /></td>
                      <td><input value={li.bill_total_amount || ''} readOnly style={{ background: '#f8f9fa' }} /></td>
                      <td style={{ width: 120 }}><input type="number" step="0.01" min="0" value={li.amount_paid} onChange={e => updateLine(i, 'amount_paid', e.target.value)} /></td>
                      <td><input value={li.notes} onChange={e => updateLine(i, 'notes', e.target.value)} placeholder="Notes…" /></td>
                      <td><button type="button" className="btn btn-danger btn-sm btn-icon" onClick={() => removeLine(i)}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></td>
                    </tr>
                  ))}
                  {!form.line_items.length && <tr><td colSpan={6} style={{ textAlign: 'center', color: '#aaa', padding: 16 }}>Select a tenant then click "+ Add Bill"</td></tr>}
                  <tr className="line-total-row">
                    <td colSpan={3} style={{ textAlign: 'right', paddingRight: 12 }}>Total Paid (This Receipt):</td>
                    <td colSpan={3} style={{ color: '#2e7d32', fontWeight: 700 }}>{formatBaht(totalPaid)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/payments')}>Cancel</button>
            <button type="submit" className="btn btn-primary"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:5,verticalAlign:"middle"}}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> {isEdit ? 'Update' : 'Save'} Receipt</button>
          </div>
        </form>
      </div>
    </>
  )
}