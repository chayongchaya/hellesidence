import { pool } from '../db/pool.js';

export async function list({ supplier_id, expense_category, date_from, date_to } = {}) {
  let q = `SELECT e.*, s.name as supplier_name FROM expense e JOIN supplier s ON s.supplier_id = e.supplier_id WHERE 1=1`;
  const params = [];
  if (supplier_id) { params.push(supplier_id); q += ` AND e.supplier_id=$${params.length}`; }
  if (expense_category) { params.push(expense_category); q += ` AND e.expense_category=$${params.length}`; }
  if (date_from) { params.push(date_from); q += ` AND e.expense_date >= $${params.length}`; }
  if (date_to) { params.push(date_to); q += ` AND e.expense_date <= $${params.length}`; }
  q += ' ORDER BY e.expense_no DESC';
  const { rows } = await pool.query(q, params);
  return rows;
}
export async function getById(id) {
  const { rows: exp } = await pool.query(
    `SELECT e.*, s.name as supplier_name FROM expense e JOIN supplier s ON s.supplier_id = e.supplier_id WHERE e.expense_no=$1`,
    [id]
  );
  if (!exp.length) return null;
  const { rows: li } = await pool.query(
    'SELECT * FROM expense_line WHERE expense_no=$1 ORDER BY expense_line_id', [id]
  );
  return { ...exp[0], line_items: li };
}
export async function create(body) {
  const { expense_date, supplier_id, expense_category, line_items } = body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const total = (line_items || []).reduce((s, i) => s + (parseFloat(i.quantity) * parseFloat(i.unit_price)), 0);
    const { rows: exp } = await client.query(
      'INSERT INTO expense (expense_date, supplier_id, expense_category, total_expense) VALUES ($1,$2,$3,$4) RETURNING *',
      [expense_date, supplier_id, expense_category, total]
    );
    const expense_no = exp[0].expense_no;
    for (const item of (line_items || [])) {
      const extended = parseFloat(item.quantity) * parseFloat(item.unit_price);
      await client.query(
        'INSERT INTO expense_line (expense_no, item_name, quantity, unit_price, extended_price) VALUES ($1,$2,$3,$4,$5)',
        [expense_no, item.item_name, item.quantity, item.unit_price, extended]
      );
    }
    await client.query('COMMIT');
    return await getById(expense_no);
  } catch (err) { await client.query('ROLLBACK'); throw err; }
  finally { client.release(); }
}
export async function update(id, body) {
  const { expense_date, supplier_id, expense_category, line_items } = body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const total = (line_items || []).reduce((s, i) => s + (parseFloat(i.quantity) * parseFloat(i.unit_price)), 0);
    await client.query(
      'UPDATE expense SET expense_date=$1, supplier_id=$2, expense_category=$3, total_expense=$4 WHERE expense_no=$5',
      [expense_date, supplier_id, expense_category, total, id]
    );
    await client.query('DELETE FROM expense_line WHERE expense_no=$1', [id]);
    for (const item of (line_items || [])) {
      const extended = parseFloat(item.quantity) * parseFloat(item.unit_price);
      await client.query(
        'INSERT INTO expense_line (expense_no, item_name, quantity, unit_price, extended_price) VALUES ($1,$2,$3,$4,$5)',
        [id, item.item_name, item.quantity, item.unit_price, extended]
      );
    }
    await client.query('COMMIT');
    return { ok: true };
  } catch (err) { await client.query('ROLLBACK'); throw err; }
  finally { client.release(); }
}
export async function remove(id) {
  await pool.query('DELETE FROM expense WHERE expense_no=$1', [id]);
  return { ok: true };
}
