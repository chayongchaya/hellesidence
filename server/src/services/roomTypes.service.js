import { pool } from '../db/pool.js';

export async function list() {
  const { rows } = await pool.query('SELECT * FROM room_type ORDER BY room_type_id');
  return rows;
}
export async function getById(id) {
  const { rows } = await pool.query('SELECT * FROM room_type WHERE room_type_id=$1', [id]);
  return rows[0] ?? null;
}
export async function create({ description, base_price, max_occupants, size_sqm }) {
  const { rows } = await pool.query(
    'INSERT INTO room_type (description, base_price, max_occupants, size_sqm) VALUES ($1,$2,$3,$4) RETURNING *',
    [description, base_price, max_occupants, size_sqm]
  );
  return rows[0];
}
export async function update(id, { description, base_price, max_occupants, size_sqm }) {
  const { rows } = await pool.query(
    'UPDATE room_type SET description=$1, base_price=$2, max_occupants=$3, size_sqm=$4 WHERE room_type_id=$5 RETURNING *',
    [description, base_price, max_occupants, size_sqm, id]
  );
  return rows[0] ?? null;
}
export async function remove(id) {
  await pool.query('DELETE FROM room_type WHERE room_type_id=$1', [id]);
  return { ok: true };
}
