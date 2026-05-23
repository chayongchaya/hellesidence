import { pool } from '../db/pool.js';

export async function list() {
  const { rows } = await pool.query('SELECT * FROM staff ORDER BY staff_id');
  return rows;
}
export async function getById(id) {
  const { rows } = await pool.query('SELECT * FROM staff WHERE staff_id=$1', [id]);
  return rows[0] ?? null;
}
export async function create({ name, position, phone }) {
  const { rows } = await pool.query(
    'INSERT INTO staff (name, position, phone) VALUES ($1,$2,$3) RETURNING *',
    [name, position, phone]
  );
  return rows[0];
}
export async function update(id, { name, position, phone }) {
  const { rows } = await pool.query(
    'UPDATE staff SET name=$1, position=$2, phone=$3 WHERE staff_id=$4 RETURNING *',
    [name, position, phone, id]
  );
  return rows[0] ?? null;
}
export async function remove(id) {
  await pool.query('DELETE FROM staff WHERE staff_id=$1', [id]);
  return { ok: true };
}
