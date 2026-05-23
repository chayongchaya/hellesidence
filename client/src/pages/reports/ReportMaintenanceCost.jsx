import { useNavigate } from 'react-router-dom'
import ReportTopbar from '../../components/ReportTopbar'
import { useState } from 'react'
import { api } from '../../services/http'
import { formatBaht } from '../../utils/utils'

export default function ReportMaintenanceCost() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState({ date_from: '', date_to: '' })
  const [ran, setRan] = useState(false)

  const run = () => {
    setLoading(true); setRan(true)
    let q = '/api/v1/reports/maintenance-cost?'
    if (filter.date_from) q += `date_from=${filter.date_from}&`
    if (filter.date_to)   q += `date_to=${filter.date_to}&`
    api.get(q).then(setRows).finally(() => setLoading(false))
  }

  const grand        = rows.reduce((s, r) => s + parseFloat(r.total_cost   || 0), 0)
  const totalTickets = rows.reduce((s, r) => s + parseInt(r.tickets        || 0), 0)
  const totalPlumb   = rows.reduce((s, r) => s + parseFloat(r.plumbing     || 0), 0)
  const totalElec    = rows.reduce((s, r) => s + parseFloat(r.electrical   || 0), 0)
  const totalFurn    = rows.reduce((s, r) => s + parseFloat(r.furniture    || 0), 0)
  const totalOther   = rows.reduce((s, r) => s + parseFloat(r.other        || 0), 0)

  // Compute category breakdown for summary cards
  const categories = [
    { label: 'Plumbing',    value: totalPlumb, color: 'var(--blue)',   bg: 'var(--blue-bg)',   icon: '🔧' },
    { label: 'Electrical',  value: totalElec,  color: 'var(--yellow)', bg: 'var(--yellow-bg)', icon: '⚡' },
    { label: 'Furniture',   value: totalFurn,  color: 'var(--purple)', bg: 'var(--purple-bg)', icon: '🪑' },
    { label: 'Other',       value: totalOther, color: 'var(--orange)', bg: 'var(--orange-bg)', icon: '🔩' },
  ]

  // Bar chart: max bar width relative to max month total_cost
  const maxCost = Math.max(...rows.map(r => parseFloat(r.total_cost || 0)), 1)

  return (
    <>
      <ReportTopbar title="Maintenance Cost by Month" />

      <div className="page-content">

        {/* ── Filter Card ── */}
        <div className="card">
          <div className="card-header" style={{ gap: 8 }}>
            <span style={{ fontSize: 16 }}>🔎</span>
            <h3>Filter &amp; Parameters</h3>
          </div>
          <div className="card-body">
            <div className="filter-bar" style={{ background: 'transparent', border: 'none', padding: 0 }}>
              <div className="form-group">
                <label>Date From</label>
                <input
                  type="date"
                  value={filter.date_from}
                  onChange={e => setFilter(f => ({ ...f, date_from: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Date To</label>
                <input
                  type="date"
                  value={filter.date_to}
                  onChange={e => setFilter(f => ({ ...f, date_to: e.target.value }))}
                />
              </div>
              <button className="btn btn-primary" onClick={run}>Run Report</button>
            </div>
          </div>
        </div>

        {/* ── Results ── */}
        {ran && (
          <>
            {loading ? (
              <div className="loading">Loading…</div>
            ) : (
              <>
                {/* ── Summary KPI Cards ── */}
                {rows.length > 0 && (
                  <>
                    {/* Top-level totals */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}>

                      {/* Grand Total */}
                      <div className="card mb-0" style={{ borderTop: '3px solid var(--red)' }}>
                        <div className="card-body" style={{ padding: '16px 20px' }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>
                            Total Cost
                          </div>
                          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--red-text)' }}>{formatBaht(grand)}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{rows.length} month{rows.length !== 1 ? 's' : ''} · {totalTickets} tickets</div>
                        </div>
                      </div>

                      {/* Per-category cards */}
                      {categories.map(cat => (
                        <div
                          key={cat.label}
                          className="card mb-0"
                          style={{ borderTop: `3px solid ${cat.color}` }}
                        >
                          <div className="card-body" style={{ padding: '16px 20px' }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>
                              {cat.icon} {cat.label}
                            </div>
                            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>
                              {cat.value > 0 ? formatBaht(cat.value) : '—'}
                            </div>
                            {grand > 0 && cat.value > 0 && (
                              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                                {((cat.value / grand) * 100).toFixed(1)}% of total
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* ── Mini Bar Chart ── */}
                    <div className="card mb-0" style={{ marginBottom: 16 }}>
                      <div className="card-header">
                        <h3>Monthly Cost Overview</h3>
                      </div>
                      <div className="card-body" style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {rows.map((r, i) => {
                            const pct = (parseFloat(r.total_cost || 0) / maxCost) * 100
                            return (
                              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 72, fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', flexShrink: 0, textAlign: 'right' }}>
                                  {r.month}
                                </div>
                                <div style={{ flex: 1, background: 'var(--border-light)', borderRadius: 6, height: 22, overflow: 'hidden', position: 'relative' }}>
                                  <div style={{
                                    width: `${pct}%`,
                                    height: '100%',
                                    background: 'linear-gradient(90deg, var(--red) 0%, #f97316 100%)',
                                    borderRadius: 6,
                                    transition: 'width .4s ease',
                                  }} />
                                </div>
                                <div style={{ width: 110, fontSize: 13, fontWeight: 700, color: 'var(--red-text)', flexShrink: 0 }}>
                                  {formatBaht(r.total_cost)}
                                </div>
                                <div style={{ width: 60, fontSize: 11, color: 'var(--text-muted)', flexShrink: 0, textAlign: 'right' }}>
                                  {r.tickets} ticket{r.tickets !== '1' ? 's' : ''}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* ── Detailed Table ── */}
                <div className="card mb-0">
                  <div className="card-header" style={{ background: 'var(--primary)', color: '#fff' }}>
                    <h3 style={{ color: '#fff' }}>
                      Maintenance Cost by Month — Grand Total: {formatBaht(grand)}
                    </h3>
                  </div>
                  <div className="tbl-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Month</th>
                          <th style={{ textAlign: 'center' }}>Tickets</th>
                          <th>🔧 Plumbing (฿)</th>
                          <th>⚡ Electrical (฿)</th>
                          <th>🪑 Furniture (฿)</th>
                          <th>🔩 Other (฿)</th>
                          <th>Total (฿)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((r, i) => (
                          <tr key={i}>
                            <td><strong>{r.month}</strong></td>
                            <td style={{ textAlign: 'center' }}>{r.tickets}</td>
                            <td>{r.plumbing   > 0 ? formatBaht(r.plumbing)   : '—'}</td>
                            <td>{r.electrical > 0 ? formatBaht(r.electrical) : '—'}</td>
                            <td>{r.furniture  > 0 ? formatBaht(r.furniture)  : '—'}</td>
                            <td>{r.other      > 0 ? formatBaht(r.other)      : '—'}</td>
                            <td style={{ fontWeight: 700, color: 'var(--red-text)' }}>
                              {formatBaht(r.total_cost)}
                            </td>
                          </tr>
                        ))}

                        {/* Grand Total Row */}
                        {rows.length > 0 && (
                          <tr style={{ background: 'var(--surface2)', fontWeight: 700 }}>
                            <td>GRAND TOTAL</td>
                            <td style={{ textAlign: 'center' }}>{totalTickets}</td>
                            <td>{totalPlumb > 0 ? formatBaht(totalPlumb) : '—'}</td>
                            <td>{totalElec  > 0 ? formatBaht(totalElec)  : '—'}</td>
                            <td>{totalFurn  > 0 ? formatBaht(totalFurn)  : '—'}</td>
                            <td>{totalOther > 0 ? formatBaht(totalOther) : '—'}</td>
                            <td style={{ color: 'var(--red-text)', fontSize: 15 }}>{formatBaht(grand)}</td>
                          </tr>
                        )}

                        {!rows.length && (
                          <tr>
                            <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>
                              No completed maintenance tickets found in this period.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  )
}
