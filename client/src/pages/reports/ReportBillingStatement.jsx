import ReportTopbar from '../../components/ReportTopbar'
import { useState, useEffect, useRef } from 'react'
import { api } from '../../services/http'
import { formatBaht, formatDate } from '../../utils/utils'

export default function ReportBillingStatement() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [ran, setRan] = useState(false)

  const [billList, setBillList] = useState([])
  const [searchText, setSearchText] = useState('')
  const [selectedBill, setSelectedBill] = useState(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [dropdownStyle, setDropdownStyle] = useState({})
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)

  useEffect(() => {
    api.get('/api/v1/reports/monthly-bills?').then(rows => setBillList(rows)).catch(() => {})
  }, [])

  useEffect(() => {
    const handleClick = e => {
      if (inputRef.current && !inputRef.current.contains(e.target) &&
          dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const openDropdown = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect()
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 2,
        left: rect.left,
        width: rect.width,
        zIndex: 99999,
      })
    }
    setDropdownOpen(true)
  }

  const filtered = billList.filter(b => {
    const s = searchText.toLowerCase()
    return (
      String(b.bill_no).includes(s) ||
      (b.tenant_name || '').toLowerCase().includes(s) ||
      (b.room_no || '').toLowerCase().includes(s) ||
      (b.billing_month || '').toLowerCase().includes(s)
    )
  }).slice(0, 50)

  const selectBill = bill => {
    setSelectedBill(bill)
    setSearchText(`B${String(bill.bill_no).padStart(4,'0')} — ${bill.tenant_name} (${bill.billing_month})`)
    setDropdownOpen(false)
  }

  const run = () => {
    if (!selectedBill) return
    setLoading(true); setRan(true)
    api.get(`/api/v1/reports/billing-statement?bill_no=${selectedBill.bill_no}`)
      .then(setData).catch(() => setData(null)).finally(() => setLoading(false))
  }

  const sBadge = s => s==='Fully Paid'?'paid':s==='Partially Paid'?'partial':'unpaid'

  return (
    <>
      <ReportTopbar title="Monthly Billing Statement" />
      <div className="page-content">
        <div className="card">
          <div className="card-header" style={{gap:8}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <h3>Filter & Parameters</h3>
          </div>
          <div className="card-body">
            <div className="filter-bar" style={{background:'transparent',border:'none',padding:0,alignItems:'flex-end'}}>
              <div className="form-group" style={{flex:1}}>
                <label>Bill No *</label>
                <div style={{position:'relative'}}>
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchText}
                    onChange={e => { setSearchText(e.target.value); setSelectedBill(null); openDropdown() }}
                    onFocus={openDropdown}
                    placeholder="Search by bill no, tenant, room, month…"
                    style={{paddingRight:32}}
                  />
                  <svg style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',opacity:.4,pointerEvents:'none'}} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                </div>
              </div>
              <button className="btn btn-primary" onClick={run} disabled={!selectedBill}>Run Report</button>
            </div>
            {dropdownOpen && filtered.length > 0 && (
              <div ref={dropdownRef} style={{
                ...dropdownStyle,
                background:'#fff',border:'1px solid var(--border)',borderRadius:8,
                boxShadow:'0 4px 20px rgba(0,0,0,.12)',maxHeight:260,overflowY:'auto'
              }}>
                {filtered.map(b => (
                  <div
                    key={b.bill_no}
                    onMouseDown={() => selectBill(b)}
                    style={{
                      padding:'8px 12px',cursor:'pointer',borderBottom:'1px solid #f3f4f6',
                      display:'flex',justifyContent:'space-between',alignItems:'center',
                      background: selectedBill?.bill_no === b.bill_no ? '#eff6ff' : '#fff'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background='#f8faff'}
                    onMouseLeave={e => e.currentTarget.style.background=selectedBill?.bill_no === b.bill_no?'#eff6ff':'#fff'}
                  >
                    <span>
                      <strong style={{color:'var(--primary)'}}>B{String(b.bill_no).padStart(4,'0')}</strong>
                      <span style={{margin:'0 8px',color:'#aaa'}}>|</span>
                      <span>{b.tenant_name}</span>
                      <span style={{margin:'0 6px',color:'#aaa'}}>·</span>
                      <span style={{color:'var(--text-muted)',fontSize:12}}>Room {b.room_no}</span>
                    </span>
                    <span style={{fontSize:12,color:'var(--text-muted)'}}>{b.billing_month}</span>
                  </div>
                ))}
              </div>
            )}
            {dropdownOpen && filtered.length === 0 && searchText && (
              <div ref={dropdownRef} style={{
                ...dropdownStyle,
                background:'#fff',border:'1px solid var(--border)',borderRadius:8,
                boxShadow:'0 4px 20px rgba(0,0,0,.12)',padding:'12px 16px',
                color:'var(--text-muted)',fontSize:13
              }}>No bills found</div>
            )}
          </div>
        </div>
        {ran && loading && <div className="loading">Loading…</div>}
        {ran && !loading && data && (
          <div className="card">
            <div className="card-header" style={{background:'var(--primary)',color:'#fff'}}>
              <h3 style={{color:'#fff'}}>Billing Statement — Bill No B{String(data.bill_no).padStart(4,'0')}</h3>
            </div>
            <div className="card-body">
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px 24px',marginBottom:20}}>
                {[
                  ['Bill No', `B${String(data.bill_no).padStart(4,'0')}`],
                  ['Bill Date', formatDate(data.bill_date)],
                  ['Billing Month', data.billing_month],
                  ['Tenant', `${data.tenant_name} — Room ${data.room_no}`],
                  ['Due Date', formatDate(data.due_date)],
                  ['Status', null],
                ].map(([k,v])=>(
                  <div key={k} style={{display:'flex',gap:12,borderBottom:'1px solid #eee',paddingBottom:6}}>
                    <span style={{minWidth:140,fontWeight:600,color:'#6b7280',fontSize:13}}>{k}</span>
                    {v !== null
                      ? <span style={{fontWeight:500}}>{v}</span>
                      : <span className={`badge badge-${sBadge(data.status)}`}>{data.status}</span>
                    }
                  </div>
                ))}
              </div>
              <table className="line-items-table" style={{marginTop:8}}>
                <thead><tr><th>Product</th><th>Description</th><th>Qty</th><th>Unit Price</th><th>Amount</th></tr></thead>
                <tbody>
                  {(data.line_items||[]).map((l,i)=>(
                    <tr key={i}>
                      <td><span className="badge badge-active">{l.product_type}</span> {l.product_name}</td>
                      <td>{l.description||'—'}</td>
                      <td>{l.quantity}</td>
                      <td>{formatBaht(l.unit_price)}</td>
                      <td style={{fontWeight:700,color:'var(--primary)'}}>{formatBaht(l.amount)}</td>
                    </tr>
                  ))}
                  <tr style={{background:'var(--surface2)',fontWeight:700}}>
                    <td colSpan={4} style={{textAlign:'right'}}>Total Bill Amount</td>
                    <td style={{color:'var(--primary)'}}>{formatBaht(data.total_bill_amount)}</td>
                  </tr>
                  <tr style={{background:'var(--green-bg)'}}>
                    <td colSpan={4} style={{textAlign:'right',color:'var(--green-text)'}}>Amount Paid</td>
                    <td style={{fontWeight:700,color:'var(--green-text)'}}>{formatBaht(data.total_paid)}</td>
                  </tr>
                  <tr style={{background:parseFloat(data.balance_due)>0?'#fce4ec':'#e8f5e9'}}>
                    <td colSpan={4} style={{textAlign:'right',fontWeight:700}}>Balance Due</td>
                    <td style={{fontWeight:700,color:parseFloat(data.balance_due)>0?'#b71c1c':'#2e7d32'}}>{formatBaht(data.balance_due)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
        {ran && !loading && !data && <div className="error-msg">Bill not found. Please check the Bill No.</div>}
      </div>
    </>
  )
}