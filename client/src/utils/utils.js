export function formatBaht(n) {
  if (n == null || n === '') return '—';
  return '฿' + Number(n).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function today() {
  return new Date().toISOString().split('T')[0];
}

export function statusClass(status) {
  const map = {
    'Available': 'badge-available',
    'Occupied': 'badge-occupied',
    'Maintenance': 'badge-maintenance',
    'Active': 'badge-active',
    'Expired': 'badge-expired',
    'Expiring': 'badge-expiring',
    'Unpaid': 'badge-unpaid',
    'Partially Paid': 'badge-partial',
    'Fully Paid': 'badge-paid',
    'Pending': 'badge-pending',
    'In Progress': 'badge-progress',
    'Completed': 'badge-completed',
    'Pass': 'badge-pass',
    'Fail': 'badge-fail',
  };
  return map[status] || 'badge-default';
}