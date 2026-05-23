import { pool } from '../db/pool.js';

export async function list({ status, room_type_id } = {}) {
  let q = `SELECT r.*, rt.description as room_type, rt.base_price,
           COALESCE(t.name, '—') as current_tenant
           FROM room r
           JOIN room_type rt ON rt.room_type_id = r.room_type_id
           LEFT JOIN monthly_billing mb ON mb.room_no = r.room_no
           LEFT JOIN tenant t ON t.tenant_id = mb.tenant_id
           WHERE 1=1`;
  const params = [];
  if (status) { params.push(status); q += ` AND r.status = $${params.length}`; }
  if (room_type_id) { params.push(room_type_id); q += ` AND r.room_type_id = $${params.length}`; }
  q += ' GROUP BY r.room_no, rt.description, rt.base_price, t.name ORDER BY r.room_no';
  const { rows } = await pool.query(q, params);
  return rows;
}
export async function getById(id) {
  const { rows } = await pool.query(
    `SELECT r.*, rt.description as room_type, rt.base_price
     FROM room r JOIN room_type rt ON rt.room_type_id = r.room_type_id
     WHERE r.room_no = $1`, [id]
  );
  return rows[0] ?? null;
}
export async function create({ room_no, room_type_id, floor, monthly_price, status, description }) {
  const { rows } = await pool.query(
    'INSERT INTO room (room_no, room_type_id, floor, monthly_price, status, description) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
    [room_no, room_type_id, floor, monthly_price, status || 'Available', description]
  );
  return rows[0];
}
export async function update(id, { room_type_id, floor, monthly_price, status, description }) {
  // Only block if trying to manually SET a non-Occupied room to Occupied
  if (status === 'Occupied') {
    const { rows: current } = await pool.query('SELECT status FROM room WHERE room_no=$1', [id]);
    if (!current.length || current[0].status !== 'Occupied') {
      throw Object.assign(new Error('Cannot manually set status to Occupied'), { status: 422 });
    }
  }
  const { rows } = await pool.query(
    'UPDATE room SET room_type_id=$1, floor=$2, monthly_price=$3, status=$4, description=$5 WHERE room_no=$6 RETURNING *',
    [room_type_id, floor, monthly_price, status, description, id]
  );
  return rows[0] ?? null;
}
export async function remove(id) {
  await pool.query('DELETE FROM room WHERE room_no=$1', [id]);
  return { ok: true };
}
