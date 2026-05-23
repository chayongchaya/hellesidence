import { pool } from '../db/pool.js';

export async function list({ tenant_id, room_no, payment_method, date_from, date_to } = {}) {
  let q = `SELECT pr.*, t.name as tenant_name FROM payment_receipt pr JOIN tenant t ON t.tenant_id = pr.tenant_id WHERE 1=1`;
  const params = [];
  if (tenant_id) { params.push(tenant_id); q += ` AND pr.tenant_id=$${params.length}`; }
  if (room_no) { params.push(room_no); q += ` AND pr.room_no=$${params.length}`; }
  if (payment_method) { params.push(payment_method); q += ` AND pr.payment_method=$${params.length}`; }
  if (date_from) { params.push(date_from); q += ` AND pr.receipt_date >= $${params.length}`; }
  if (date_to) { params.push(date_to); q += ` AND pr.receipt_date <= $${params.length}`; }
  q += ' ORDER BY pr.receipt_no DESC';
  const { rows } = await pool.query(q, params);
  return rows;
}
export async function getById(id) {
  const { rows: r } = await pool.query(
    `SELECT pr.*, t.name as tenant_name FROM payment_receipt pr JOIN tenant t ON t.tenant_id = pr.tenant_id WHERE pr.receipt_no=$1`,
    [id]
  );
  if (!r.length) return null;
  const { rows: li } = await pool.query(
    `SELECT rl.*, mb.billing_month, mb.total_bill_amount FROM payments_item rl
     JOIN monthly_billing mb ON mb.bill_no = rl.bill_no WHERE rl.receipt_no=$1`, [id]
  );
  return { ...r[0], line_items: li };
}
export async function create(body) {
  const { receipt_date, tenant_id, room_no, payment_method, reference_number, line_items } = body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const total = (line_items || []).reduce((s, i) => s + parseFloat(i.amount_paid), 0);
    const { rows: receipt } = await client.query(
      `INSERT INTO payment_receipt (receipt_date, tenant_id, room_no, payment_method, reference_number, total_paid)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [receipt_date, tenant_id, room_no, payment_method, reference_number, total]
    );
    const receipt_no = receipt[0].receipt_no;
    for (const item of (line_items || [])) {
      await client.query(
        'INSERT INTO payments_item (receipt_no, bill_no, amount_paid, notes) VALUES ($1,$2,$3,$4)',
        [receipt_no, item.bill_no, item.amount_paid, item.notes]
      );
      await client.query(
        `UPDATE monthly_billing SET total_paid = total_paid + $1, balance_due = balance_due - $1,
         status = CASE WHEN (balance_due - $1) <= 0 THEN 'Fully Paid' WHEN (total_paid + $1) > 0 AND (balance_due - $1) > 0 THEN 'Partially Paid' ELSE 'Unpaid' END
         WHERE bill_no=$2`,
        [item.amount_paid, item.bill_no]
      );
    }
    await client.query('COMMIT');
    return await getById(receipt_no);
  } catch (err) { await client.query('ROLLBACK'); throw err; }
  finally { client.release(); }
}
export async function remove(id) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Reverse payment amounts from billing before deleting
    const { rows: items } = await client.query(
      'SELECT bill_no, amount_paid FROM payments_item WHERE receipt_no=$1', [id]
    );
    for (const item of items) {
      await client.query(
        `UPDATE monthly_billing SET total_paid = total_paid - $1, balance_due = balance_due + $1,
         status = CASE WHEN (total_paid - $1) <= 0 THEN 'Unpaid' WHEN (balance_due + $1) > 0 THEN 'Partially Paid' ELSE 'Fully Paid' END
         WHERE bill_no=$2`,
        [item.amount_paid, item.bill_no]
      );
    }
    await client.query('DELETE FROM payments_item WHERE receipt_no=$1', [id]);
    await client.query('DELETE FROM payment_receipt WHERE receipt_no=$1', [id]);
    await client.query('COMMIT');
  } catch (err) { await client.query('ROLLBACK'); throw err; }
  finally { client.release(); }
  return { ok: true };
}
