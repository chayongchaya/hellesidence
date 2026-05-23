import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/http'
import { toast } from 'react-toastify'
import ConfirmDialog from '../components/ConfirmDialog'
import { formatBaht, formatDate } from '../utils/utils'

export default function InspectionsPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirm, setConfirm] = useState(null)
  const [filter, setFilter] = useState({ date_from: '', date_to: '', result: '', search: '' })

  const load = () => {
    setLoading(true)
    let q = '/api/v1/room-inspections?'
    if (filter.date_from) q += `date_from=${filter.date_from}&`
    if (filter.date_to) q += `date_to=${filter.date_to}&`
    if (filter.result) q += `result=${filter.result}&`
    api.get(q).then(data => {
      if (filter.search.trim()) {
        const kw = filter.search.trim().toLowerCase()
        data = data.filter(r =>
          String(r.inspection_no).padStart(4,'0').includes(kw) ||
          r.tenant_name?.toLowerCase().includes(kw) ||
          r.room_no?.toLowerCase().includes(kw) ||
          r.inspector_name?.toLowerCase().includes(kw)
        )
      }
      setRows(data)
    }).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const clearFilter = () => setFilter({ date_from:'', date_to:'', result:'', search:'' })

  const handleDelete = async id => {
    try { await api.delete(`/api/v1/room-inspections/${id}`); toast.success('Deleted'); setConfirm(null); load() }
    catch (err) { toast.error(err.message) }
  }

  return (
    <>
      <div className="topbar"><h1><span style={{display:"inline-flex",alignItems:"center",gap:6}}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>Room Inspections</span></h1></div>
      <div className="page-content">
        <div className="page-header">
          <div><h2>Room Inspections / Check-Out</h2><p>{rows.length} inspections</p></div>
          <div style={{display:'flex', gap:8}}>
            <button onClick={() => window.print()} className="btn btn-outline">🖨 Print</button>
            <Link to="/inspections/new" className="btn btn-primary">+ New Inspection</Link>
          </div>
        </div>
        <div className="filter-bar" style={{flexWrap:'wrap',gap:12}}>
          <div className="form-group" style={{minWidth:200,flex:'1 1 200px'}}>
            <label>Search (Insp No / Name / Room / Staff)</label>
            <input placeholder="e.g. INS0001, tenant name, 101…" value={filter.search} onChange={e => setFilter(f => ({...f, search:e.target.value}))} onKeyDown={e => e.key==='Enter' && load()} />
          </div>
          <div className="form-group" style={{minWidth:140,flex:'1 1 140px'}}>
            <label>Date From</label>
            <input type="date" value={filter.date_from} onChange={e => setFilter(f => ({ ...f, date_from: e.target.value }))} />
          </div>
          <div className="form-group" style={{minWidth:140,flex:'1 1 140px'}}>
            <label>Date To</label>
            <input type="date" value={filter.date_to} onChange={e => setFilter(f => ({ ...f, date_to: e.target.value }))} />
          </div>
          <div className="form-group" style={{minWidth:120,flex:'1 1 120px'}}>
            <label>Result</label>
            <select value={filter.result} onChange={e => setFilter(f => ({ ...f, result: e.target.value }))}>
              <option value="">All</option><option>Pass</option><option>Fail</option>
            </select>
          </div>
          <div style={{display:'flex',alignItems:'flex-end',gap:8}}>
            <button className="btn btn-primary" onClick={load}>🔍 Search</button>
            <button className="btn btn-ghost" onClick={clearFilter}>✕ Clear</button>
          </div>
        </div>
        <div className="card mb-0">
          <div className="tbl-wrap">
            {loading ? <div className="loading">Loading…</div> :
            <table>
              <thead><tr><th>Insp. No</th><th>Date</th><th>Tenant</th><th>Room</th><th>Inspector</th><th>Result</th><th>Total Fines</th><th>Actions</th></tr></thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.inspection_no}>
                    <td><strong>INS{String(r.inspection_no).padStart(4,'0')}</strong></td>
                    <td>{formatDate(r.inspection_date)}</td>
                    <td>{r.tenant_name}</td>
                    <td>{r.room_no}</td>
                    <td>{r.inspector_name}</td>
                    <td><span className={`badge badge-${r.result === 'Pass' ? 'pass' : 'fail'}`}>{r.result}</span></td>
                    <td style={{ color: parseFloat(r.total_fines) > 0 ? '#b71c1c' : '#2e7d32', fontWeight: 700 }}>{formatBaht(r.total_fines)}</td>
                    <td>
                      <div className="tbl-actions">
                        <Link to={`/inspections/${r.inspection_no}/edit`} className="btn btn-outline btn-sm">Edit</Link>
                        <button className="btn btn-danger btn-sm" onClick={() => setConfirm(r.inspection_no)}>Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!rows.length && <tr><td colSpan={8}><div className="empty-state"><div className="icon">🔍</div><p>No inspections found</p></div></td></tr>}
              </tbody>
            </table>}
          </div>
        </div>
      </div>
      {confirm && <ConfirmDialog onConfirm={() => handleDelete(confirm)} onCancel={() => setConfirm(null)} />}
    </>
  )
}