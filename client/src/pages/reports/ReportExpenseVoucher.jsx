import ReportTopbar from '../../components/ReportTopbar'
import { useState, useEffect, useRef } from 'react'
import { api } from '../../services/http'
import { formatBaht, formatDate } from '../../utils/utils'

export default function ReportExpenseVoucher() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [ran, setRan] = useState(false)

  const [expenseList, setExpenseList] = useState([])
  const [searchText, setSearchText] = useState('')
  const [selectedExpense, setSelectedExpense] = useState(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [dropdownStyle, setDropdownStyle] = useState({})
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)

  useEffect(() => {
    api.get('/api/v1/reports/expenses?').then(rows => setExpenseList(rows)).catch(() => {})
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

  const filtered = expenseList.filter(e => {
    const s = searchText.toLowerCase()
    return (
      String(e.expense_no).includes(s) ||
      (e.supplier_name || '').toLowerCase().includes(s) ||
      (e.expense_category || '').toLowerCase().includes(s)
    )
  }).slice(0, 50)

  const selectExpense = exp => {
    setSelectedExpense(exp)
    setSearchText(`EX${String(exp.expense_no).padStart(4,'0')} — ${exp.supplier_name} (${exp.expense_category})`)
    setDropdownOpen(false)
  }

  const run = () => {
    if (!selectedExpense) return
    setLoading(true); setRan(true)
    api.get(`/api/v1/reports/expense-voucher?expense_no=${selectedExpense.expense_no}`)
      .then(setData).catch(() => setData(null)).finally(() => setLoading(false))
  }

  return (
    <>
      <ReportTopbar title="Expense Voucher" />
      <div className="page-content">
        <div className="card">
          <div className="card-header" style={{gap:8}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <h3>Filter & Parameters</h3>
          </div>
          <div className="card-body">
            <div className="filter-bar" style={{background:'transparent',border:'none',padding:0,alignItems:'flex-end'}}>
              <div className="form-group" style={{flex:1}}>
                <label>Expense No *</label>
                <div style={{position:'relative'}}>
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchText}
                    onChange={e => { setSearchText(e.target.value); setSelectedExpense(null); openDropdown() }}
                    onFocus={openDropdown}
                    placeholder="Search by expense no, supplier, category…"
                    style={{paddingRight:32}}
                  />
                  <svg style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',opacity:.4,pointerEvents:'none'}} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                </div>
              </div>
              <button className="btn btn-primary" onClick={run} disabled={!selectedExpense}>Run Report</button>
            </div>
            {dropdownOpen && filtered.length > 0 && (
              <div ref={dropdownRef} style={{
                ...dropdownStyle,
                background:'#fff',border:'1px solid var(--border)',borderRadius:8,
                boxShadow:'0 4px 20px rgba(0,0,0,.12)',maxHeight:260,overflowY:'auto'
              }}>
                {filtered.map(e => (
                  <div
                    key={e.expense_no}
                    onMouseDown={() => selectExpense(e)}
                    style={{
                      padding:'8px 12px',cursor:'pointer',borderBottom:'1px solid #f3f4f6',
                      display:'flex',justifyContent:'space-between',alignItems:'center',
                      background: selectedExpense?.expense_no === e.expense_no ? '#eff6ff' : '#fff'
                    }}
                    onMouseEnter={ev => ev.currentTarget.style.background='#f8faff'}
                    onMouseLeave={ev => ev.currentTarget.style.background=selectedExpense?.expense_no === e.expense_no?'#eff6ff':'#fff'}
                  >
                    <span>
                      <strong style={{color:'var(--primary)'}}>EX{String(e.expense_no).padStart(4,'0')}</strong>
                      <span style={{margin:'0 8px',color:'#aaa'}}>|</span>
                      <span>{e.supplier_name}</span>
                    </span>
                    <span style={{fontSize:12,color:'var(--text-muted)'}}>{e.expense_category}</span>
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
              }}>No expenses found</div>
            )}
          </div>
        </div>
        {ran && loading && <div className="loading">Loading…</div>}
        {ran && !loading && data && (
          <div className="card">
            <div className="card-header" style={{background:'var(--primary)',color:'#fff'}}>
              <h3 style={{color:'#fff'}}>Expense Voucher — EX{String(data.expense_no).padStart(4,'0')}</h3>
            </div>
            <div className="card-body">
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px 24px',marginBottom:20}}>
                {[
                  ['Expense No', `EX${String(data.expense_no).padStart(4,'0')}`],
                  ['Date', formatDate(data.expense_date)],
                  ['Supplier', data.supplier_name],
                  ['Category', data.expense_category],
                ].map(([k,v])=>(
                  <div key={k} style={{display:'flex',gap:12,borderBottom:'1px solid #eee',paddingBottom:6}}>
                    <span style={{minWidth:120,fontWeight:600,color:'#6b7280',fontSize:13}}>{k}</span>
                    <span style={{fontWeight:500}}>{v}</span>
                  </div>
                ))}
              </div>
              <table className="line-items-table">
                <thead><tr><th>#</th><th>Item Name</th><th>Qty</th><th>Unit Price</th><th>Extended Price</th></tr></thead>
                <tbody>
                  {(data.line_items||[]).map((l,i)=>(
                    <tr key={i}>
                      <td>{i+1}</td>
                      <td><strong>{l.item_name}</strong></td>
                      <td style={{textAlign:'center'}}>{l.quantity}</td>
                      <td>{formatBaht(l.unit_price)}</td>
                      <td style={{fontWeight:700,color:'var(--primary)'}}>{formatBaht(l.extended_price)}</td>
                    </tr>
                  ))}
                  <tr style={{background:'#fce4ec',fontWeight:700}}>
                    <td colSpan={4} style={{textAlign:'right'}}>TOTAL EXPENSE</td>
                    <td style={{color:'var(--red-text)'}}>{formatBaht(data.total_expense)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
        {ran && !loading && !data && <div className="error-msg">Expense not found. Please check the Expense No.</div>}
      </div>
    </>
  )
}