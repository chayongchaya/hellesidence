import { pool } from '../db/pool.js';

export async function tenants({ room_type_id, name } = {}) {
  let q = `SELECT t.tenant_id, t.name, t.phone, t.email, t.id_card_no,
           COALESCE(r.room_no::TEXT, '—') AS room_no,
           COALESCE(rt.description, '—') AS room_type,
           COALESCE(r.status, 'No Contract') AS status
           FROM tenant t
           LEFT JOIN rental_contract rc ON rc.tenant_id = t.tenant_id
           LEFT JOIN room r ON r.room_no = rc.room_no
           LEFT JOIN room_type rt ON rt.room_type_id = r.room_type_id
           WHERE 1=1`;
  const params = [];
  if (room_type_id) { params.push(room_type_id); q += ` AND rt.room_type_id=$${params.length}`; }
  if (name) { params.push(`%${name}%`); q += ` AND t.name ILIKE $${params.length}`; }
  q += ' GROUP BY t.tenant_id, r.room_no, rt.description, r.status ORDER BY t.tenant_id';
  const { rows } = await pool.query(q, params); return rows;
}

export async function contracts({ date_from, date_to, tenant_id } = {}) {
  let q = `SELECT rc.contract_no, rc.contract_date, t.name AS tenant_name, rc.room_no,
           rt.description AS room_type, rc.start_date, rc.end_date, rc.monthly_rent, rc.deposit_amount, rc.total_contract_value AS total_value,
           CASE WHEN rc.end_date < CURRENT_DATE THEN 'Expired'
                WHEN rc.end_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'Expiring'
                ELSE 'Active' END AS status
           FROM rental_contract rc
           JOIN tenant t ON t.tenant_id = rc.tenant_id
           JOIN room r ON r.room_no = rc.room_no
           JOIN room_type rt ON rt.room_type_id = r.room_type_id
           WHERE 1=1`;
  const params = [];
  if (date_from) { params.push(date_from); q += ` AND rc.contract_date >= $${params.length}`; }
  if (date_to) { params.push(date_to); q += ` AND rc.contract_date <= $${params.length}`; }
  if (tenant_id) { params.push(tenant_id); q += ` AND rc.tenant_id=$${params.length}`; }
  q += ' ORDER BY rc.contract_no DESC';
  const { rows } = await pool.query(q, params); return rows;
}

export async function rentalIncome({ date_from, date_to, room_type_id, tenant_id } = {}) {
  let q = `SELECT t.name AS tenant_name, mb.room_no, rt.description AS room_type,
           COUNT(mb.bill_no) AS months_billed,
           MAX(rc.monthly_rent) AS monthly_rent,
           SUM(mb.total_bill_amount) AS total_rental,
           ROUND(SUM(mb.total_bill_amount)*100.0/NULLIF(SUM(SUM(mb.total_bill_amount)) OVER(),0),1) AS pct_of_total
           FROM monthly_billing mb
           JOIN tenant t ON t.tenant_id = mb.tenant_id
           JOIN room r ON r.room_no = mb.room_no
           JOIN room_type rt ON rt.room_type_id = r.room_type_id
           LEFT JOIN rental_contract rc ON rc.tenant_id = mb.tenant_id AND rc.room_no = mb.room_no
           WHERE 1=1`;
  const params = [];
  if (date_from) { params.push(date_from); q += ` AND mb.bill_date >= $${params.length}`; }
  if (date_to) { params.push(date_to); q += ` AND mb.bill_date <= $${params.length}`; }
  if (room_type_id) { params.push(room_type_id); q += ` AND r.room_type_id=$${params.length}`; }
  if (tenant_id) { params.push(tenant_id); q += ` AND mb.tenant_id=$${params.length}`; }
  q += ' GROUP BY t.name, mb.room_no, rt.description ORDER BY total_rental DESC';
  const { rows } = await pool.query(q, params); return rows;
}

export async function rooms({ status, room_type_id, floor } = {}) {
  let q = `SELECT r.room_no, rt.description AS room_type, r.floor, r.monthly_price, r.status,
           COALESCE(t.name,'—') AS current_tenant
           FROM room r
           JOIN room_type rt ON rt.room_type_id = r.room_type_id
           LEFT JOIN monthly_billing mb ON mb.room_no = r.room_no
           LEFT JOIN tenant t ON t.tenant_id = mb.tenant_id
           WHERE 1=1`;
  const params = [];
  if (status) { params.push(status); q += ` AND r.status=$${params.length}`; }
  if (room_type_id) { params.push(room_type_id); q += ` AND r.room_type_id=$${params.length}`; }
  if (floor) { params.push(floor); q += ` AND r.floor=$${params.length}`; }
  q += ' GROUP BY r.room_no, rt.description, r.floor, r.monthly_price, r.status, t.name ORDER BY r.room_no';
  const { rows } = await pool.query(q, params); return rows;
}

export async function availableRooms({ as_of_date, room_type_id } = {}) {
  const date = as_of_date || new Date().toISOString().split('T')[0];
  let q = `SELECT r.room_no, rt.description AS room_type, r.floor, r.monthly_price
           FROM room r JOIN room_type rt ON rt.room_type_id = r.room_type_id
           WHERE r.status != 'Maintenance'
           AND NOT EXISTS (
             SELECT 1 FROM rental_contract rc
             WHERE rc.room_no = r.room_no AND $1 BETWEEN rc.start_date::date AND rc.end_date::date
           )`;
  const params = [date];
  if (room_type_id) { params.push(room_type_id); q += ` AND r.room_type_id=$${params.length}`; }
  q += ' ORDER BY r.room_no';
  const { rows } = await pool.query(q, params); return rows;
}

export async function occupancy({ room_type_id } = {}) {
  let q = `SELECT COALESCE(rt.description,'TOTAL') AS room_type,
           COUNT(*) AS total_rooms,
           COUNT(*) FILTER (WHERE r.status='Occupied') AS occupied,
           COUNT(*) FILTER (WHERE r.status='Available') AS available,
           COUNT(*) FILTER (WHERE r.status='Maintenance') AS maintenance,
           ROUND(COUNT(*) FILTER (WHERE r.status='Occupied')*100.0/NULLIF(COUNT(*),0),1) AS occupancy_rate_pct
           FROM room r JOIN room_type rt ON rt.room_type_id = r.room_type_id WHERE 1=1`;
  const params = [];
  if (room_type_id) { params.push(room_type_id); q += ` AND r.room_type_id=$${params.length}`; }
  q += ' GROUP BY ROLLUP(rt.description) ORDER BY rt.description NULLS LAST';
  const { rows } = await pool.query(q, params); return rows;
}

export async function maintenance({ date_from, date_to, status, issue_type, priority_level } = {}) {
  let q = `SELECT mt.ticket_no, mt.request_date, mt.room_no, t.name AS tenant_name,
           mt.issue_type, mt.description, mt.priority_level, mt.status,
           COALESCE(s.name,'—') AS technician_name,
           COALESCE(mt.actual_cost::text,'—') AS actual_cost
           FROM maintenance_ticket mt
           JOIN tenant t ON t.tenant_id = mt.tenant_id
           LEFT JOIN staff s ON s.staff_id = mt.technician_staff_id
           WHERE 1=1`;
  const params = [];
  if (date_from) { params.push(date_from); q += ` AND mt.request_date >= $${params.length}`; }
  if (date_to) { params.push(date_to); q += ` AND mt.request_date <= $${params.length}`; }
  if (status) { params.push(status); q += ` AND mt.status=$${params.length}`; }
  if (issue_type) { params.push(issue_type); q += ` AND mt.issue_type=$${params.length}`; }
  if (priority_level) { params.push(priority_level); q += ` AND mt.priority_level=$${params.length}`; }
  q += ' ORDER BY mt.request_date DESC';
  const { rows } = await pool.query(q, params); return rows;
}

export async function maintenanceVoucher(id) {
  const { rows: mt } = await pool.query(
    `SELECT mt.*, t.name AS tenant_name, s.name AS technician_name
     FROM maintenance_ticket mt
     JOIN tenant t ON t.tenant_id = mt.tenant_id
     LEFT JOIN staff s ON s.staff_id = mt.technician_staff_id
     WHERE mt.ticket_no=$1`, [id]
  );
  return mt[0] ?? null;
}

export async function maintenanceCost({ date_from, date_to } = {}) {
  let q = `SELECT TO_CHAR(mt.request_date,'Mon YYYY') AS month,
           TO_CHAR(DATE_TRUNC('month',mt.request_date),'YYYY-MM') AS month_sort,
           COUNT(*) AS tickets,
           SUM(CASE WHEN mt.issue_type='Plumbing' THEN COALESCE(mt.actual_cost,0) ELSE 0 END) AS plumbing,
           SUM(CASE WHEN mt.issue_type='Electrical' THEN COALESCE(mt.actual_cost,0) ELSE 0 END) AS electrical,
           SUM(CASE WHEN mt.issue_type='Furniture' THEN COALESCE(mt.actual_cost,0) ELSE 0 END) AS furniture,
           SUM(CASE WHEN mt.issue_type='Other' THEN COALESCE(mt.actual_cost,0) ELSE 0 END) AS other,
           SUM(COALESCE(mt.actual_cost,0)) AS total_cost
           FROM maintenance_ticket mt WHERE mt.status='Completed'`;
  const params = [];
  if (date_from) { params.push(date_from); q += ` AND mt.request_date >= $${params.length}`; }
  if (date_to) { params.push(date_to); q += ` AND mt.request_date <= $${params.length}`; }
  q += ' GROUP BY month, month_sort ORDER BY month_sort';
  const { rows } = await pool.query(q, params); return rows;
}

export async function monthlyBills({ billing_month_from, billing_month_to, tenant_id, status } = {}) {
  let q = `SELECT mb.bill_no, mb.bill_date, mb.billing_month, mb.room_no, t.name AS tenant_name,
           mb.due_date, mb.total_bill_amount, mb.total_paid, mb.balance_due, mb.status
           FROM monthly_billing mb JOIN tenant t ON t.tenant_id = mb.tenant_id WHERE 1=1`;
  const params = [];
  if (billing_month_from) { params.push(billing_month_from); q += ` AND mb.billing_month >= $${params.length}`; }
  if (billing_month_to) { params.push(billing_month_to); q += ` AND mb.billing_month <= $${params.length}`; }
  if (tenant_id) { params.push(tenant_id); q += ` AND mb.tenant_id=$${params.length}`; }
  if (status) { params.push(status); q += ` AND mb.status=$${params.length}`; }
  q += ' ORDER BY mb.bill_no DESC';
  const { rows } = await pool.query(q, params); return rows;
}

export async function billingStatement(bill_no) {
  const { rows: bill } = await pool.query(
    `SELECT mb.*, t.name AS tenant_name FROM monthly_billing mb JOIN tenant t ON t.tenant_id = mb.tenant_id WHERE mb.bill_no=$1`,
    [bill_no]
  );
  if (!bill.length) return null;
  const { rows: li } = await pool.query(
    `SELECT mbl.*, pc.product_name, pc.product_type FROM monthly_bill_line mbl
     JOIN product_code pc ON pc.product_code = mbl.product_code WHERE mbl.bill_no=$1`, [bill_no]
  );
  return { ...bill[0], line_items: li };
}

export async function chargesByType({ date_from, date_to, tenant_id } = {}) {
  let q = `SELECT pc.product_type, pc.product_name,
           COUNT(mbl.bill_line_id) AS times_charged,
           SUM(mbl.amount) AS total_amount,
           ROUND(SUM(mbl.amount)*100.0/NULLIF(SUM(SUM(mbl.amount)) OVER(),0),1) AS pct_of_total
           FROM monthly_bill_line mbl
           JOIN product_code pc ON pc.product_code = mbl.product_code
           JOIN monthly_billing mb ON mb.bill_no = mbl.bill_no
           WHERE 1=1`;
  const params = [];
  if (date_from) { params.push(date_from); q += ` AND mb.bill_date >= $${params.length}`; }
  if (date_to) { params.push(date_to); q += ` AND mb.bill_date <= $${params.length}`; }
  if (tenant_id) { params.push(tenant_id); q += ` AND mb.tenant_id=$${params.length}`; }
  q += ' GROUP BY pc.product_type, pc.product_name ORDER BY total_amount DESC';
  const { rows } = await pool.query(q, params); return rows;
}

export async function payments({ date_from, date_to, tenant_id, payment_method } = {}) {
  let q = `SELECT pr.receipt_no, pr.receipt_date, t.name AS tenant_name, pr.room_no,
           pr.payment_method, pr.reference_number, pr.total_paid
           FROM payment_receipt pr JOIN tenant t ON t.tenant_id = pr.tenant_id WHERE 1=1`;
  const params = [];
  if (date_from) { params.push(date_from); q += ` AND pr.receipt_date >= $${params.length}`; }
  if (date_to) { params.push(date_to); q += ` AND pr.receipt_date <= $${params.length}`; }
  if (tenant_id) { params.push(tenant_id); q += ` AND pr.tenant_id=$${params.length}`; }
  if (payment_method) { params.push(payment_method); q += ` AND pr.payment_method=$${params.length}`; }
  q += ' ORDER BY pr.receipt_date DESC';
  const { rows } = await pool.query(q, params); return rows;
}

export async function unpaidBalances({ tenant_id } = {}) {
  let q = `SELECT t.name AS tenant_name, mb.room_no, mb.bill_no, mb.billing_month,
           mb.due_date, mb.total_bill_amount AS bill_total,
           COALESCE(mb.total_paid,0) AS paid_amount,
           mb.balance_due AS balance, mb.status
           FROM monthly_billing mb
           JOIN tenant t ON t.tenant_id = mb.tenant_id
           WHERE mb.balance_due > 0`;
  const params = [];
  if (tenant_id) { params.push(tenant_id); q += ` AND mb.tenant_id=$${params.length}`; }
  q += ' ORDER BY mb.due_date';
  const { rows } = await pool.query(q, params); return rows;
}

export async function paymentsByMethod({ date_from, date_to, tenant_id } = {}) {
  let q = `SELECT pr.payment_method, COUNT(pr.receipt_no) AS receipt_count,
           SUM(pr.total_paid) AS total_amount,
           ROUND(SUM(pr.total_paid)*100.0/NULLIF(SUM(SUM(pr.total_paid)) OVER(),0),1) AS pct_of_total,
           ROUND(AVG(pr.total_paid),0) AS avg_per_receipt
           FROM payment_receipt pr WHERE 1=1`;
  const params = [];
  if (date_from) { params.push(date_from); q += ` AND pr.receipt_date >= $${params.length}`; }
  if (date_to) { params.push(date_to); q += ` AND pr.receipt_date <= $${params.length}`; }
  if (tenant_id) { params.push(tenant_id); q += ` AND pr.tenant_id=$${params.length}`; }
  q += ' GROUP BY pr.payment_method ORDER BY total_amount DESC';
  const { rows } = await pool.query(q, params); return rows;
}

export async function expenses({ date_from, date_to, supplier_id, expense_category } = {}) {
  let q = `SELECT e.expense_no, e.expense_date, s.name AS supplier_name, e.expense_category,
           COUNT(el.expense_line_id) AS no_items, e.total_expense
           FROM expense e JOIN supplier s ON s.supplier_id = e.supplier_id
           LEFT JOIN expense_line el ON el.expense_no = e.expense_no
           WHERE 1=1`;
  const params = [];
  if (date_from) { params.push(date_from); q += ` AND e.expense_date >= $${params.length}`; }
  if (date_to) { params.push(date_to); q += ` AND e.expense_date <= $${params.length}`; }
  if (supplier_id) { params.push(supplier_id); q += ` AND e.supplier_id=$${params.length}`; }
  if (expense_category) { params.push(expense_category); q += ` AND e.expense_category=$${params.length}`; }
  q += ' GROUP BY e.expense_no, s.name ORDER BY e.expense_date DESC';
  const { rows } = await pool.query(q, params); return rows;
}

export async function expenseVoucher(id) {
  const { rows: exp } = await pool.query(
    `SELECT e.*, s.name AS supplier_name FROM expense e JOIN supplier s ON s.supplier_id = e.supplier_id WHERE e.expense_no=$1`, [id]
  );
  if (!exp.length) return null;
  const { rows: li } = await pool.query('SELECT * FROM expense_line WHERE expense_no=$1 ORDER BY expense_line_id', [id]);
  return { ...exp[0], line_items: li };
}

export async function expensesByCategory({ date_from, date_to, supplier_id } = {}) {
  let q = `SELECT e.expense_category, COUNT(e.expense_no) AS expense_count,
           COUNT(el.expense_line_id) AS item_count,
           SUM(e.total_expense) AS total_amount,
           ROUND(SUM(e.total_expense)*100.0/NULLIF(SUM(SUM(e.total_expense)) OVER(),0),1) AS pct_of_total
           FROM expense e
           LEFT JOIN expense_line el ON el.expense_no = e.expense_no
           WHERE 1=1`;
  const params = [];
  if (date_from) { params.push(date_from); q += ` AND e.expense_date >= $${params.length}`; }
  if (date_to) { params.push(date_to); q += ` AND e.expense_date <= $${params.length}`; }
  if (supplier_id) { params.push(supplier_id); q += ` AND e.supplier_id=$${params.length}`; }
  q += ' GROUP BY e.expense_category ORDER BY total_amount DESC';
  const { rows } = await pool.query(q, params); return rows;
}
