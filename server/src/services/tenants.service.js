import { pool } from '../db/pool.js';

export async function list({ name, room_type_id } = {}) {
  let q = `SELECT t.*, r.room_no as current_room
           FROM tenant t
           LEFT JOIN rental_contract rc ON rc.tenant_id = t.tenant_id AND NOW() BETWEEN rc.start_date AND rc.end_date
           LEFT JOIN room r ON r.room_no = rc.room_no
           WHERE 1=1`;
  const params = [];
  if (name) { params.push(`%${name}%`); q += ` AND t.name ILIKE $${params.length}`; }
  if (room_type_id) { params.push(room_type_id); q += ` AND r.room_type_id = $${params.length}`; }
  q += ' ORDER BY t.tenant_id';
  const { rows } = await pool.query(q, params);
  return rows;
}
export async function getById(id) {
  const { rows } = await pool.query('SELECT * FROM tenant WHERE tenant_id = $1', [id]);
  return rows[0] ?? null;
}
export async function create({ name, phone, email, address, id_card_no }) {
  const { rows } = await pool.query(
    'INSERT INTO tenant (name, phone, email, address, id_card_no) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [name, phone, email, address, id_card_no]
  );
  return rows[0];
}
export async function update(id, { name, phone, email, address, id_card_no }) {
  const { rows } = await pool.query(
    'UPDATE tenant SET name=$1, phone=$2, email=$3, address=$4, id_card_no=$5 WHERE tenant_id=$6 RETURNING *',
    [name, phone, email, address, id_card_no, id]
  );
  return rows[0] ?? null;
}
export async function remove(id) {
  await pool.query('DELETE FROM tenant WHERE tenant_id=$1', [id]);
  return { ok: true };
}
