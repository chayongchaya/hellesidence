import { pool } from '../db/pool.js';

export async function list({ tenant_id, room_no, billing_month_from, billing_month_to, status } = {}) {
  let q = `SELECT mb.*, t.name as tenant_name FROM monthly_billing mb JOIN tenant t ON t.tenant_id = mb.tenant_id WHERE 1=1`;
  const params = [];
  if (tenant_id) { params.push(tenant_id); q += ` AND mb.tenant_id=$${params.length}`; }
  if (room_no) { params.push(room_no); q += ` AND mb.room_no=$${params.length}`; }
  if (billing_month_from) { params.push(billing_month_from); q += ` AND mb.billing_month >= $${params.length}`; }
  if (billing_month_to) { params.push(billing_month_to); q += ` AND mb.billing_month <= $${params.length}`; }
  if (status) { params.push(status); q += ` AND mb.status=$${params.length}`; }
  q += ' ORDER BY mb.bill_no DESC';
  const { rows } = await pool.query(q, params);
  return rows;
}
export async function listUnpaid() {
  const { rows } = await pool.query(
    `SELECT mb.*, t.name as tenant_name FROM monthly_billing mb JOIN tenant t ON t.tenant_id = mb.tenant_id
     WHERE mb.balance_due > 0 ORDER BY mb.due_date`
  );
  return rows;
}
export async function getById(id) {
  const { rows: bill } = await pool.query(
    `SELECT mb.*, t.name as tenant_name FROM monthly_billing mb JOIN tenant t ON t.tenant_id = mb.tenant_id WHERE mb.bill_no=$1`,
    [id]
  );
  if (!bill.length) return null;
  const { rows: li } = await pool.query(
    `SELECT mbl.*, pc.product_name, pc.product_type FROM monthly_bill_line mbl
     JOIN product_code pc ON pc.product_code = mbl.product_code
     WHERE mbl.bill_no=$1 ORDER BY mbl.bill_line_id`, [id]
  );
  return { ...bill[0], line_items: li };
}
export async function create(body) {
  const { bill_date, billing_month, tenant_id, room_no, due_date, line_items } = body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const total = (line_items || []).reduce((s, i) => s + (parseFloat(i.quantity) * parseFloat(i.unit_price)), 0);
    const { rows: bill } = await client.query(
      `INSERT INTO monthly_billing (bill_date, billing_month, tenant_id, room_no, due_date, total_bill_amount, total_paid, balance_due, status)
       VALUES ($1,$2,$3,$4,$5,$6,0,$7,'Unpaid') RETURNING *`,
      [bill_date, billing_month, tenant_id, room_no, due_date, total, total]
    );
    const bill_no = bill[0].bill_no;
    for (const item of (line_items || [])) {
      const amount = parseFloat(item.quantity) * parseFloat(item.unit_price);
      await client.query(
        'INSERT INTO monthly_bill_line (bill_no, product_code, description, quantity, unit_price, amount, notes) VALUES ($1,$2,$3,$4,$5,$6,$7)',
        [bill_no, item.product_code, item.description, item.quantity, item.unit_price, amount, item.notes]
      );
    }
    await client.query('COMMIT');
    return await getById(bill_no);
  } catch (err) { await client.query('ROLLBACK'); throw err; }
  finally { client.release(); }
}
export async function update(id, body) {
  const { bill_date, billing_month, tenant_id, room_no, due_date, line_items } = body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const total = (line_items || []).reduce((s, i) => s + (parseFloat(i.quantity) * parseFloat(i.unit_price)), 0);
    await client.query(
      `UPDATE monthly_billing SET bill_date=$1, billing_month=$2, tenant_id=$3, room_no=$4, due_date=$5, total_bill_amount=$6,
       balance_due = $6 - total_paid,
       status = CASE WHEN total_paid >= $6 THEN 'Fully Paid' WHEN total_paid > 0 THEN 'Partially Paid' ELSE 'Unpaid' END
       WHERE bill_no=$7`,
      [bill_date, billing_month, tenant_id, room_no, due_date, total, id]
    );
    await client.query('DELETE FROM monthly_bill_line WHERE bill_no=$1', [id]);
    for (const item of (line_items || [])) {
      const amount = parseFloat(item.quantity) * parseFloat(item.unit_price);
      await client.query(
        'INSERT INTO monthly_bill_line (bill_no, product_code, description, quantity, unit_price, amount, notes) VALUES ($1,$2,$3,$4,$5,$6,$7)',
        [id, item.product_code, item.description, item.quantity, item.unit_price, amount, item.notes]
      );
    }
    await client.query('COMMIT');
    return await getById(id);
  } catch (err) { await client.query('ROLLBACK'); throw err; }
  finally { client.release(); }
}
export async function remove(id) {
  await pool.query('DELETE FROM payments_item WHERE bill_no=$1', [id]);
  await pool.query('DELETE FROM monthly_bill_line WHERE bill_no=$1', [id]);
  await pool.query('DELETE FROM monthly_billing WHERE bill_no=$1', [id]);
  return { ok: true };
}
