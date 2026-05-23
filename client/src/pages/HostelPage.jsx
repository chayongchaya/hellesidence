import { useEffect, useState } from 'react'
import { api } from '../services/http'
import { toast } from 'react-toastify'
import { validatePhone, validateEmail, validateTaxId, validateRequired, formatPhoneInput, stripFormatting } from '../utils/validation'

function FieldError({ msg }) {
  if (!msg) return null
  return <span style={{ color: '#e53e3e', fontSize: 11, marginTop: 3, display: 'block' }}>⚠ {msg}</span>
}

export default function HostelPage() {
  const [form, setForm] = useState({ hostel_name: '', address: '', phone: '', email: '', tax_id: '' })
  const [hostelId, setHostelId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    api.get('/api/v1/hostel').then(d => {
      if (d && d.length) { setForm(d[0]); setHostelId(d[0].hostel_id) }
    }).finally(() => setLoading(false))
  }, [])

  const handleChange = e => {
    const { name, value } = e.target
    const finalValue = name === 'phone' ? formatPhoneInput(value) : value
    setForm(f => ({ ...f, [name]: finalValue }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }))
  }

  const validate = () => {
    const errs = {}
    errs.hostel_name = validateRequired(form.hostel_name, 'Hostel Name')
    errs.address = validateRequired(form.address, 'Address')
    errs.phone = validatePhone(form.phone)
    errs.email = validateEmail(form.email)
    errs.tax_id = validateTaxId(form.tax_id)
    Object.keys(errs).forEach(k => { if (!errs[k]) delete errs[k] })
    return errs
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); toast.error('Please fix the errors before submitting'); return }
    const payload = { ...form, phone: stripFormatting(form.phone) }
    try {
      if (hostelId) await api.put(`/api/v1/hostel/${hostelId}`, payload)
      else { const d = await api.post('/api/v1/hostel', payload); setHostelId(d.hostel_id) }
      toast.success('Hostel info saved!')
    } catch (err) { toast.error(err.message) }
  }

  if (loading) return <div className="loading">Loading...</div>
  return (
    <>
      <div className="topbar"><h1>🏨 Hostel Information</h1></div>
      <div className="page-content">
        <div className="card" style={{ maxWidth: 700 }}>
          <div className="card-header"><h3>Hostel Details</h3></div>
          <div className="card-body">
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-grid">
                <div className="form-group full">
                  <label>Hostel Name *</label>
                  <input name="hostel_name" value={form.hostel_name} onChange={handleChange}
                    placeholder="e.g. Happy Place Hostel"
                    style={errors.hostel_name ? { borderColor: '#e53e3e' } : {}} />
                  <FieldError msg={errors.hostel_name} />
                </div>
                <div className="form-group full">
                  <label>Address *</label>
                  <textarea name="address" value={form.address} onChange={handleChange} rows={2} required
                    style={{ resize: 'vertical', ...(errors.address ? { borderColor: '#e53e3e' } : {}) }} />
                  <FieldError msg={errors.address} />
                </div>
                <div className="form-group">
                  <label>Phone * <small style={{ fontWeight: 400, color: 'var(--text-light)' }}>(10 digits)</small></label>
                  <input name="phone" value={form.phone} onChange={handleChange}
                    placeholder="02-123-4567 or 081-234-5678" maxLength={12}
                    style={errors.phone ? { borderColor: '#e53e3e' } : {}} />
                  <FieldError msg={errors.phone} />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input name="email" type="text" value={form.email || ''} onChange={handleChange}
                    placeholder="hostel@example.com"
                    style={errors.email ? { borderColor: '#e53e3e' } : {}} />
                  <FieldError msg={errors.email} />
                </div>
                <div className="form-group">
                  <label>Tax ID <small style={{ fontWeight: 400, color: 'var(--text-light)' }}>(13 digits)</small></label>
                  <input name="tax_id" value={form.tax_id || ''} onChange={handleChange}
                    placeholder="1234567890123" maxLength={13}
                    style={errors.tax_id ? { borderColor: '#e53e3e' } : {}} />
                  <FieldError msg={errors.tax_id} />
                </div>
              </div>
              <div style={{ marginTop: 20 }}>
                <button type="submit" className="btn btn-primary">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 5, verticalAlign: 'middle' }}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg> Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
