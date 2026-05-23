import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom'
import { api } from '../services/http'
import { formatBaht } from '../utils/utils'

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'

const ACCENT = '#1a237e'

export default function ContractView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const wasCreated = searchParams.get('created') === '1'
  const wasUpdated = searchParams.get('updated') === '1'

  const [contract, setContract] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  useEffect(() => {
    api.get(`/api/v1/contracts/${id}`)
      .then(data => { setContract(data); setError(null) })
      .catch(err  => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="loading">Loading…</div>
  if (error) return (
    <div className="page-content">
      <div className="card" style={{ padding: 32, textAlign: 'center' }}>
        <p style={{ color: '#b71c1c', marginBottom: 16 }}>Failed to load contract: {error}</p>
        <button className="btn btn-primary" onClick={() => navigate('/contracts')}>Back to Contracts</button>
      </div>
    </div>
  )
  if (!contract) return (
    <div className="page-content">
      <div className="card" style={{ padding: 32, textAlign: 'center' }}>
        <p style={{ marginBottom: 16 }}>Contract not found.</p>
        <button className="btn btn-primary" onClick={() => navigate('/contracts')}>Back to Contracts</button>
      </div>
    </div>
  )

  const months = contract.start_date && contract.end_date
    ? Math.round((new Date(contract.end_date) - new Date(contract.start_date)) / (1000 * 60 * 60 * 24 * 30.44))
    : 0
  const monthlyRent = parseFloat(contract.monthly_rent  || 0)
  const deposit     = parseFloat(contract.deposit_amount || 0)
  const totalRent   = monthlyRent * months
  const grandTotal  = totalRent + deposit

  const condStyle = (c) => ({
    padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600,
    background: c === 'Good' ? '#e8f5e9' : c === 'Fair' ? '#fff3e0' : '#ffebee',
    color:      c === 'Good' ? '#2e7d32' : c === 'Fair' ? '#e65100' : '#b71c1c',
  })

  return (
    <div className="invoice-preview">

      {/* ── Topbar: hidden on print ── */}
      <div className="page-header no-print">
        <h3>Contract C{String(contract.contract_no).padStart(4, '0')}</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to="/contracts" className="btn btn-outline">← Back</Link>
          <Link to={`/contracts/${id}/edit`} className="btn btn-outline">Edit</Link>
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
        background: 'linear-gradient(135deg,#1a237e,#283593)',
        borderRadius: 12, padding: '14px 20px', marginBottom: 24,
        boxShadow: '0 2px 12px rgba(26,35,126,.2)',
      }}>
        <span style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </span>
        <div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>
            {wasCreated ? 'Contract Created Successfully' : 'Contract Updated Successfully'}
          </div>
          <div style={{ color: 'rgba(255,255,255,.75)', fontSize: 13 }}>
            {wasCreated ? 'The new contract has been saved to the database.' : 'All changes have been saved to the database.'}
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
              <div style={{ fontSize: 14 }}>{contract.tenant_name || '—'}</div>
              <div style={{ fontSize: 13, color: '#888' }}>Room {contract.room_no || '—'}</div>
            </div>
          </div>

          <div className="doc-meta">
            <div className="doc-title" style={{ color: ACCENT }}>RENTAL CONTRACT</div>
            <div><span className="label">Contract No:</span> C{String(contract.contract_no).padStart(4, '0')}</div>
            <div><span className="label">Contract Date:</span> {fmt(contract.contract_date)}</div>
            <div><span className="label">Start Date:</span> {fmt(contract.start_date)}</div>
            <div><span className="label">End Date:</span> {fmt(contract.end_date)}</div>
            <div><span className="label">Duration:</span> {months ? `${months} month${months !== 1 ? 's' : ''}` : '—'}</div>
          </div>
        </div>

        {/* Contract terms table */}
        <table className="doc-table">
          <thead>
            <tr style={{ background: ACCENT }}>
              <th>DESCRIPTION</th>
              <th className="text-right">RATE</th>
              <th className="text-right">MONTHS</th>
              <th className="text-right">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Monthly Rent — Room {contract.room_no}</td>
              <td className="text-right">{formatBaht(monthlyRent)}</td>
              <td className="text-right">{months}</td>
              <td className="text-right" style={{ fontWeight: 700 }}>{formatBaht(totalRent)}</td>
            </tr>
            <tr>
              <td>Security Deposit (refundable)</td>
              <td className="text-right">{formatBaht(deposit)}</td>
              <td className="text-right">—</td>
              <td className="text-right" style={{ fontWeight: 700 }}>{formatBaht(deposit)}</td>
            </tr>
          </tbody>
        </table>

        {/* Totals */}
        <div className="doc-totals" style={{ marginBottom: 32 }}>
          <div className="doc-totals-note">
            This document serves as the official rental contract agreement between the tenant and Hellesidence Dormitory.
          </div>
          <div className="doc-totals-box">
            <div className="doc-totals-row">
              <span>Total Rent Value:</span>
              <span>{formatBaht(totalRent)}</span>
            </div>
            <div className="doc-totals-row">
              <span>Security Deposit:</span>
              <span>{formatBaht(deposit)}</span>
            </div>
            <div className="doc-totals-grand" style={{ background: '#f0f4ff', color: ACCENT }}>
              <span>Grand Total:</span>
              <span>{formatBaht(grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Furniture / inventory table */}
        {(contract.line_items?.length > 0) && (
          <div style={{ marginTop: 32 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, paddingBottom: 8, borderBottom: `2px solid ${ACCENT}`, color: ACCENT, letterSpacing: '.3px' }}>
              FURNITURE &amp; FACILITY INVENTORY
            </div>
            <table className="doc-table" style={{ marginBottom: 0 }}>
              <thead>
                <tr style={{ background: '#f0f4ff' }}>
                  <th style={{ color: '#333' }}>ITEM</th>
                  <th style={{ color: '#333' }}>CATEGORY</th>
                  <th className="text-right" style={{ color: '#333' }}>QTY</th>
                  <th style={{ color: '#333' }}>CONDITION</th>
                  <th style={{ color: '#333' }}>NOTES</th>
                </tr>
              </thead>
              <tbody>
                {contract.line_items.map((li, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{li.item_name}</td>
                    <td style={{ color: '#555' }}>{li.category}</td>
                    <td className="text-right">{li.quantity}</td>
                    <td><span style={condStyle(li.condition)}>{li.condition}</span></td>
                    <td style={{ color: '#888' }}>{li.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Signature lines */}
        <div className="doc-signatures">
          <div>
            <div className="doc-sig-line">Tenant Signature</div>
            <div className="doc-sig-name">{contract.tenant_name || '—'}</div>
          </div>
          <div>
            <div className="doc-sig-line">Authorized Signature</div>
            <div className="doc-sig-name">Hellesidence Management</div>
          </div>
        </div>

      </div>
    </div>
  )
}