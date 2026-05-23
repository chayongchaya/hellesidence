import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Icon } from './Icons'

const mainSections = [
  {
    title: 'Main',
    links: [{ to: '/dashboard', icon: 'dashboard', label: 'Dashboard' }]
  },
  {
    title: 'Transactions',
    links: [
      { to: '/contracts',   icon: 'contracts',   label: 'Rental Contracts' },
      { to: '/billing',     icon: 'billing',      label: 'Monthly Billing' },
      { to: '/payments',    icon: 'payments',     label: 'Payment Receipts' },
      { to: '/inspections', icon: 'inspections',  label: 'Room Inspections' },
      { to: '/expenses',    icon: 'expenses',     label: 'Expenses' },
      { to: '/maintenance', icon: 'maintenance',  label: 'Maintenance Tickets' },
    ]
  },
  {
    title: 'Master Data',
    links: [
      { to: '/tenants',       icon: 'tenants',        label: 'Tenants' },
      { to: '/rooms',         icon: 'rooms',          label: 'Rooms' },
      { to: '/room-types',    icon: 'room-types',     label: 'Room Types' },
      { to: '/furniture',     icon: 'furniture',      label: 'Furniture' },
      { to: '/product-codes', icon: 'product-codes',  label: 'Product Codes' },
      { to: '/staff',         icon: 'staff',          label: 'Staff' },
      { to: '/suppliers',     icon: 'suppliers',      label: 'Suppliers' },
    ]
  },
]

const reportGroups = [
  {
    label: 'Tenants & Contracts',
    icon: 'tenants',
    color: '#3b82f6',
    links: [
      { to: '/reports/tenants',   label: 'Tenant List' },
      { to: '/reports/contracts', label: 'Contract Printout' },
    ]
  },
  {
    label: 'Rooms',
    icon: 'rooms',
    color: '#10b981',
    links: [
      { to: '/reports/rooms',           label: 'Room List' },
      { to: '/reports/available-rooms', label: 'Available Rooms' },
      { to: '/reports/occupancy',       label: 'Occupancy Rate' },
    ]
  },
  {
    label: 'Finance',
    icon: 'rental-income',
    color: '#8b5cf6',
    links: [
      { to: '/reports/rental-income',      label: 'Rental Income' },
      { to: '/reports/monthly-bills',      label: 'Monthly Bills' },
      { to: '/reports/billing-statement',  label: 'Billing Statement' },
      { to: '/reports/charges-by-type',    label: 'Charges by Type' },
      { to: '/reports/payments',           label: 'Payment List' },
      { to: '/reports/unpaid-balances',    label: 'Unpaid Balances' },
      { to: '/reports/payments-by-method', label: 'Payments by Method' },
    ]
  },
  {
    label: 'Maintenance',
    icon: 'maintenance',
    color: '#f59e0b',
    links: [
      { to: '/reports/maintenance',                  label: 'Maintenance List' },
      { to: '/reports/maintenance-cost',             label: 'Maintenance Cost' },
      { to: '/reports/maintenance-request-voucher',  label: 'Maintenance Request Voucher' },
    ]
  },
  {
    label: 'Expenses',
    icon: 'expenses',
    color: '#ef4444',
    links: [
      { to: '/reports/expenses',         label: 'Expense List' },
      { to: '/reports/expense-voucher',  label: 'Expense Voucher' },
      { to: '/reports/expenses-by-cat',  label: 'Expenses by Category' },
    ]
  },
]

function CollapsibleGroup({ group, defaultOpen }) {
  const location = useLocation()
  const isAnyActive = group.links.some(l => location.pathname === l.to)
  const [open, setOpen] = useState(defaultOpen || isAnyActive)

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 9,
          width: '100%', padding: '8px 16px 8px 20px',
          background: 'none', border: 'none', cursor: 'pointer',
          color: isAnyActive ? '#1d4ed8' : 'var(--text-muted)',
          fontWeight: isAnyActive ? 600 : 500,
          fontSize: 13.5,
          transition: 'background .12s, color .12s',
          borderRadius: 0,
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
      >
        <span style={{ width: 22, textAlign: 'center', opacity: .8, flexShrink: 0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <span style={{
            display: 'inline-block', width: 8, height: 8,
            borderRadius: '50%', background: group.color,
            boxShadow: `0 0 0 2px ${group.color}30`,
          }} />
        </span>
        <span style={{ flex: 1, textAlign: 'left' }}>{group.label}</span>
        <span style={{
          fontSize: 11, opacity: .45,
          transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
          transition: 'transform .2s',
        }}>›</span>
      </button>

      {open && (
        <div style={{ paddingLeft: 20 }}>
          {group.links.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 16px 6px 22px',
                fontSize: 12.5, fontWeight: isActive ? 600 : 400,
                color: isActive ? '#1d4ed8' : 'var(--text-muted)',
                background: isActive ? '#eff6ff' : 'none',
                textDecoration: 'none',
                borderLeft: `2px solid ${isActive ? group.color : 'var(--border)'}`,
                transition: 'background .12s, color .12s',
              })}
              onMouseEnter={e => { if (!e.currentTarget.classList.contains('active')) e.currentTarget.style.background = 'var(--bg)' }}
              onMouseLeave={e => { if (!e.currentTarget.classList.contains('active')) e.currentTarget.style.background = 'none' }}
            >
              {l.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Sidebar() {
  const location = useLocation()
  const isInReports = location.pathname.startsWith('/reports')

  return (
    <nav className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon" style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
          <Icon name="hostel" size={20} color="#fff" />
        </div>
        <div>
          <h2>Hellesidence</h2>
          <p>Dormitory Mgmt</p>
        </div>
      </div>

      {/* Main sections */}
      {mainSections.map(sec => (
        <div key={sec.title} className="sidebar-section">
          <div className="sidebar-section-title">{sec.title}</div>
          {sec.links.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}
            >
              <span className="icon"><Icon name={l.icon} size={15} /></span>
              {l.label}
            </NavLink>
          ))}
        </div>
      ))}

      {/* Reports — collapsible groups */}
      <div className="sidebar-section">
        <div className="sidebar-section-title">Reports</div>

        <NavLink
          to="/reports"
          end
          className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}
        >
          <span className="icon"><Icon name="reports" size={15} /></span>
          All Reports
        </NavLink>

        {isInReports && reportGroups.map(g => (
          <CollapsibleGroup key={g.label} group={g} />
        ))}
      </div>

      {/* Settings */}
      <div className="sidebar-section">
        <div className="sidebar-section-title">Settings</div>
        <NavLink to="/hostel" className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}>
          <span className="icon"><Icon name="hostel" size={15} /></span>
          Hostel Info
        </NavLink>
      </div>
    </nav>
  )
}
