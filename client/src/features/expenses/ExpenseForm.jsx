import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../services/http'
import { toast } from 'react-toastify'
import { formatBaht, today } from '../../utils/utils'

export default function ExpenseForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(isEdit)

  const [form, setForm] = useState({
    expense_date: today(), supplier_id: '', expense_category: 'Maintenance', line_items: []
  })

  useEffect(() => {
    api.get('/api/v1/suppliers').then(setSuppliers)
    if (isEdit) {
      api.get(`/api/v1/expenses/${id}`).then(d => {
        const { line_items, ...rest } = d
        setForm({
          ...rest,
          expense_date: rest.expense_date?.split('T')[0] || today(),
          line_items: (line_items || []).map(l => ({
            item_name: l.item_name, quantity: l.quantity, unit_price: l.unit_price
          }))
        })
      }).catch(err => { toast.error('Failed to load: ' + err.message) })
        .finally(() => setLoading(false))
    }
  }, [])

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const addLine = () => setForm(f => ({ ...f, line_items: [...f.line_items, { item_name: '', quantity: 1, unit_price: '' }] }))
  const removeLine = i => setForm(f => ({ ...f, line_items: f.line_items.filter((_, j) => j !== i) }))
  const updateLine = (i, field, value) => setForm(f => {
    const li = [...f.line_items]; li[i] = { ...li[i], [field]: value }; return { ...f, line_items: li }
  })

  const lineTotal = li => parseFloat(li.quantity || 0) * parseFloat(li.unit_price || 0)
  const totalExpense = form.line_items.reduce((s, l) => s + lineTotal(l), 0)

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      if (isEdit) {
        await api.put(`/api/v1/expenses/${id}`, form)
        toast.success('Expense updated!')
        navigate(`/expenses/${id}/view`)
      } else {
        const created = await api.post('/api/v1/expenses', form)
        toast.success('Expense saved!')
        navigate(`/expenses/${created.expense_no}/view?created=1`)
      }
    } catch (err) { toast.error(err.message) }
  }

  if (loading) return <div className="loading">Loading…</div>

  const categories = ['Maintenance', 'Cleaning', 'Office Supplies', 'Electrical', 'Landscaping', 'Other']

  return (
    <>
      <div className="topbar"><h1>{isEdit ? 'Edit Expense' : 'New Expense / Purchase'}</h1></div>
      <div className="page-content">
        <form onSubmit={handleSubmit}>
          <div className="card">
            <div className="card-header"><h3><span style={{display:"inline-flex",alignItems:"center",gap:6}}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>Expense Header</span></h3></div>
            <div className="card-body">
              <div className="form-grid">
                <div className="form-group"><label>Expense Date *</label><input type="date" name="expense_date" value={form.expense_date} onChange={handleChange} required /></div>
                <div className="form-group">
                  <label>Supplier *</label>
                  <select name="supplier_id" value={form.supplier_id} onChange={handleChange} required>
                    <option value="">Select Supplier…</option>
                    {suppliers.map(s => <option key={s.supplier_id} value={s.supplier_id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <select name="expense_category" value={form.expense_category} onChange={handleChange}>
                    {categories.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Total Expense</label>
                  <input value={formatBaht(totalExpense)} readOnly style={{ background: '#f0f2f5', fontWeight: 700, color: '#b71c1c' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="line-items-header">
              <h4><span style={{display:"inline-flex",alignItems:"center",gap:6}}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>Items Purchased</span></h4>
              <button type="button" className="btn btn-sm" style={{ background: 'rgba(255,255,255,.2)', color: '#fff' }} onClick={addLine}>+ Add Item</button>
            </div>
            <div className="tbl-wrap">
              <table className="line-items-table">
                <thead><tr><th>Item Name</th><th>Quantity</th><th>Unit Price (฿)</th><th>Extended Price (฿)</th><th></th></tr></thead>
                <tbody>
                  {form.line_items.map((li, i) => (
                    <tr key={i}>
                      <td><input value={li.item_name} onChange={e => updateLine(i, 'item_name', e.target.value)} placeholder="Item name…" required /></td>
                      <td style={{ width: 90 }}><input type="number" step="0.01" min="0" value={li.quantity} onChange={e => updateLine(i, 'quantity', e.target.value)} /></td>
                      <td style={{ width: 120 }}><input type="number" step="0.01" min="0" value={li.unit_price} onChange={e => updateLine(i, 'unit_price', e.target.value)} /></td>
                      <td style={{ width: 120, fontWeight: 700, color: '#b71c1c', textAlign: 'right' }}>{formatBaht(lineTotal(li))}</td>
                      <td><button type="button" className="btn btn-danger btn-sm btn-icon" onClick={() => removeLine(i)}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></td>
                    </tr>
                  ))}
                  {!form.line_items.length && <tr><td colSpan={5} style={{ textAlign: 'center', color: '#aaa', padding: 16 }}>No items — click "+ Add Item"</td></tr>}
                  <tr className="line-total-row">
                    <td colSpan={3} style={{ textAlign: 'right', paddingRight: 12 }}>Total Expense:</td>
                    <td colSpan={2} style={{ color: '#b71c1c' }}>{formatBaht(totalExpense)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/expenses')}>Cancel</button>
            <button type="submit" className="btn btn-primary"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:5,verticalAlign:"middle"}}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> {isEdit ? 'Update' : 'Save'} Expense</button>
          </div>
        </form>
      </div>
    </>
  )
}