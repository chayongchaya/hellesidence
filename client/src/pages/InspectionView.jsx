import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom'
import { api } from '../services/http'
import { formatBaht } from '../utils/utils'

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'

const ACCENT = '#1565c0'

export default function InspectionView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const wasCreated = searchParams.get("created") === "1"
  const wasUpdated = searchParams.get("updated") === "1"

  const [inspection, setInspection] = useState(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)

  useEffect(() => {
    api.get(`/api/v1/room-inspections/${id}`)
      .then(data => { setInspection(data); setError(null) })
      .catch(err  => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="loading">Loading…</div>
  if (error) return (
    <div className="page-content">
      <div className="card" style={{ padding: 32, textAlign: 'center' }}>
        <p style={{ color: '#b71c1c', marginBottom: 16 }}>Failed to load inspection: {error}</p>
        <button className="btn btn-primary" onClick={() => navigate('/inspections')}>Back to Inspections</button>
      </div>
    </div>
  )
  if (!inspection) return (
    <div className="page-content">
      <div className="card" style={{ padding: 32, textAlign: 'center' }}>
        <p style={{ marginBottom: 16 }}>Inspection not found.</p>
        <button className="btn btn-primary" onClick={() => navigate('/inspections')}>Back to Inspections</button>
      </div>
    </div>
  )

  const totalFines  = (inspection.line_items || []).reduce((s, l) => s + parseFloat(l.fine_amount || 0), 0)
  const resultColor = inspection.result === 'Pass' ? '#2e7d32' : '#b71c1c'
  const resultBg    = inspection.result === 'Pass' ? '#e8f5e9'  : '#ffebee'

  const condStyle = (c) => ({
    padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600,
    background: c === 'Good' ? '#e8f5e9' : c === 'Fair' ? '#fff3e0' : '#ffebee',
    color:      c === 'Good' ? '#2e7d32' : c === 'Fair' ? '#e65100' : '#b71c1c',
  })

  return (
    <div className="invoice-preview">

      {/* ── Topbar: hidden on print ── */}
      <div className="page-header no-print">
        <h3>Inspection I{String(inspection.inspection_no).padStart(4, '0')}</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to="/inspections" className="btn btn-outline">← Back</Link>
          <Link to={`/inspections/${id}/edit`} className="btn btn-outline">Edit</Link>
          <button onClick={() => window.print()} className="btn btn-primary">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
            </svg>
            Print PDF
          </button>
        </div>
      </div>

      {/* ── Success banner ── */}
      {(wasCreated || wasUpdated) && (
      <div className="no-print" style={{
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'linear-gradient(135deg,#1565c0,#1976d2)',
        borderRadius: 12, padding: '14px 20px', marginBottom: 24,
        boxShadow: '0 2px 12px rgba(21,101,192,.2)',
      }}>
        <span style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </span>
        <div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>
            {wasCreated ? 'Inspection Created Successfully' : 'Inspection Updated Successfully'}
          </div>
          <div style={{ color: 'rgba(255,255,255,.8)', fontSize: 13 }}>
            {wasCreated ? 'The new inspection has been saved to the database.' : 'All changes have been saved to the database.'}
          </div>
        </div>
      </div>
      )}

      {/* ══ PRINTABLE DOCUMENT ════════════════════════════════ */}
      <div className="card" style={{ padding: 40 }}>

        {/* Header */}
        <div className="doc-header">
          <div>
            <div className="doc-brand" style={{ color: ACCENT }}>Hellesidence</div>
            <div className="doc-subtitle">Dormitory Management System</div>
            <div style={{ marginTop: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>Tenant</div>
              <div style={{ fontSize: 14 }}>{inspection.tenant_name || '—'}</div>
              <div style={{ fontSize: 13, color: '#888' }}>Room {inspection.room_no || '—'}</div>
            </div>
          </div>

          <div className="doc-meta">
            <div className="doc-title" style={{ color: ACCENT }}>ROOM INSPECTION</div>
            <div><span className="label">Inspection No:</span> I{String(inspection.inspection_no).padStart(4, '0')}</div>
            <div><span className="label">Date:</span> {fmt(inspection.inspection_date)}</div>
            <div><span className="label">Inspector:</span> {inspection.inspector_name || '—'}</div>
            <div style={{ marginTop: 6 }}>
              <span className="doc-badge" style={{ background: resultBg, color: resultColor }}>{inspection.result}</span>
            </div>
          </div>
        </div>

        {/* Items table */}
        <table className="doc-table">
          <thead>
            <tr style={{ background: ACCENT }}>
              <th>ITEM CHECKED</th>
              <th>CONDITION</th>
              <th className="text-right">FINE AMOUNT</th>
              <th>NOTES</th>
            </tr>
          </thead>
          <tbody>
            {(inspection.line_items || []).map((li, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 500 }}>{li.item_checked}</td>
                <td><span style={condStyle(li.condition)}>{li.condition}</span></td>
                <td className="text-right" style={{
                  fontWeight: parseFloat(li.fine_amount) > 0 ? 700 : 400,
                  color:      parseFloat(li.fine_amount) > 0 ? '#b71c1c' : '#888',
                }}>
                  {parseFloat(li.fine_amount) > 0 ? formatBaht(li.fine_amount) : '—'}
                </td>
                <td style={{ color: '#888' }}>{li.notes || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="doc-totals">
          <div className="doc-totals-note">
            This inspection report documents the condition of the room and its contents at the time of inspection.
          </div>
          <div className="doc-totals-box">
            <div className="doc-totals-grand" style={{
              background: totalFines > 0 ? '#fff0f0' : '#e8f5e9',
              color:      totalFines > 0 ? '#b71c1c' : '#2e7d32',
            }}>
              <span>Total Fines:</span>
              <span>{formatBaht(totalFines)}</span>
            </div>
          </div>
        </div>

        {/* Signature lines */}
        <div className="doc-signatures">
          <div>
            <div className="doc-sig-line">Tenant Signature</div>
            <div className="doc-sig-name">{inspection.tenant_name || '—'}</div>
          </div>
          <div>
            <div className="doc-sig-line">Inspector</div>
            <div className="doc-sig-name">{inspection.inspector_name || '—'}</div>
          </div>
        </div>

      </div>
    </div>
  )
}