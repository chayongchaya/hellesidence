import { pool } from '../db/pool.js';

export async function list({ tenant_id, room_no, date_from, date_to } = {}) {
  let q = `SELECT rc.*, t.name as tenant_name, r.room_no, rt.description as room_type,
           CASE WHEN rc.end_date < CURRENT_DATE THEN 'Expired'
                WHEN rc.end_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'Expiring'
                ELSE 'Active' END AS status
           FROM rental_contract rc
           JOIN tenant t ON t.tenant_id = rc.tenant_id
           JOIN room r ON r.room_no = rc.room_no
           JOIN room_type rt ON rt.room_type_id = r.room_type_id
           WHERE 1=1`;
  const params = [];
  if (tenant_id) { params.push(tenant_id); q += ` AND rc.tenant_id=$${params.length}`; }
  if (room_no) { params.push(room_no); q += ` AND rc.room_no=$${params.length}`; }
  if (date_from) { params.push(date_from); q += ` AND rc.contract_date >= $${params.length}`; }
  if (date_to) { params.push(date_to); q += ` AND rc.contract_date <= $${params.length}`; }
  q += ' ORDER BY rc.contract_no DESC';
  const { rows } = await pool.query(q, params);
  return rows;
}
export async function getById(id) {
  const { rows: contract } = await pool.query(
    `SELECT rc.*, t.name as tenant_name, rt.description as room_type
     FROM rental_contract rc
     JOIN tenant t ON t.tenant_id = rc.tenant_id
     JOIN room r ON r.room_no = rc.room_no
     JOIN room_type rt ON rt.room_type_id = r.room_type_id
     WHERE rc.contract_no=$1`, [id]
  );
  if (!contract.length) return null;
  const { rows: line_items } = await pool.query(
    `SELECT cf.*, f.name as item_name, f.category
     FROM contract_item cf JOIN furniture f ON f.item_id = cf.item_id
     WHERE cf.contract_no=$1 ORDER BY cf.contract_line_id`, [id]
  );
  return { ...contract[0], line_items };
}
export async function create(body) {
  const { contract_date, tenant_id, room_no, start_date, end_date, deposit_amount, monthly_rent, line_items } = body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: room } = await client.query('SELECT status FROM room WHERE room_no=$1', [room_no]);
    if (!room.length || room[0].status !== 'Available')
      throw Object.assign(new Error('Room is not available'), { status: 422 });
    const months = Math.round((new Date(end_date) - new Date(start_date)) / (1000*60*60*24*30.44));
    const total_value = monthly_rent * months;
    const { rows: contract } = await client.query(
      `INSERT INTO rental_contract (contract_date, tenant_id, room_no, start_date, end_date, deposit_amount, monthly_rent, total_contract_value)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [contract_date, tenant_id, room_no, start_date, end_date, deposit_amount, monthly_rent, total_value]
    );
    const contract_no = contract[0].contract_no;
    for (const item of (line_items || [])) {
      await client.query(
        'INSERT INTO contract_item (contract_no, item_id, quantity, condition, notes) VALUES ($1,$2,$3,$4,$5)',
        [contract_no, item.item_id, item.quantity, item.condition, item.notes]
      );
    }
    await client.query("UPDATE room SET status='Occupied' WHERE room_no=$1", [room_no]);
    await client.query('COMMIT');
    return await getById(contract_no);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally { client.release(); }
}
export async function update(id, body) {
  const { contract_date, tenant_id, room_no, start_date, end_date, deposit_amount, monthly_rent, line_items } = body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const months = Math.round((new Date(end_date) - new Date(start_date)) / (1000*60*60*24*30.44));
    const total_value = monthly_rent * months;
    await client.query(
      `UPDATE rental_contract SET contract_date=$1, tenant_id=$2, room_no=$3, start_date=$4, end_date=$5,
       deposit_amount=$6, monthly_rent=$7, total_contract_value=$8 WHERE contract_no=$9`,
      [contract_date, tenant_id, room_no, start_date, end_date, deposit_amount, monthly_rent, total_value, id]
    );
    await client.query('DELETE FROM contract_item WHERE contract_no=$1', [id]);
    for (const item of (line_items || [])) {
      await client.query(
        'INSERT INTO contract_item (contract_no, item_id, quantity, condition, notes) VALUES ($1,$2,$3,$4,$5)',
        [id, item.item_id, item.quantity, item.condition, item.notes]
      );
    }
    await client.query('COMMIT');
    return { ok: true };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally { client.release(); }
}
export async function remove(id) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM contract_item WHERE contract_no=$1', [id]);
    await client.query('DELETE FROM rental_contract WHERE contract_no=$1', [id]);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally { client.release(); }
  return { ok: true };
}
