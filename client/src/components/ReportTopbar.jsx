import { useNavigate } from 'react-router-dom'

export default function ReportTopbar({ title }) {
  const nav = useNavigate()
  return (
    <div className="topbar no-print">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => nav('/reports')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', borderRadius: 8,
            border: '1.5px solid var(--border)',
            background: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 500, color: 'var(--text-muted)',
            transition: 'all .12s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg)'; e.currentTarget.style.color = 'var(--text)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)' }}
        >
          ‹ Reports
        </button>
        <span style={{ color: 'var(--border)', fontSize: 18 }}>/</span>
        <h1 style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-.3px' }}>{title}</h1>
      </div>
      <button
        onClick={() => window.print()}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '7px 14px', borderRadius: 8,
          border: '1.5px solid var(--border)',
          background: 'none', cursor: 'pointer',
          fontSize: 12, fontWeight: 600, color: 'var(--text-muted)',
          transition: 'all .12s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg)'; e.currentTarget.style.color = 'var(--text)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)' }}
      >
        🖨 Print
      </button>
    </div>
  )
}