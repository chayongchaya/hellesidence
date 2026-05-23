import { pool } from '../db/pool.js';

export async function list() {
  const { rows } = await pool.query('SELECT * FROM hostel_info ORDER BY hostel_id');
  return rows;
}
export async function getById(id) {
  const { rows } = await pool.query('SELECT * FROM hostel_info WHERE hostel_id = $1', [id]);
  return rows[0] ?? null;
}
export async function create({ hostel_name, address, phone, email, tax_id }) {
  const { rows } = await pool.query(
    'INSERT INTO hostel_info (hostel_name, address, phone, email, tax_id) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [hostel_name, address, phone, email, tax_id]
  );
  return rows[0];
}
export async function update(id, { hostel_name, address, phone, email, tax_id }) {
  const { rows } = await pool.query(
    'UPDATE hostel_info SET hostel_name=$1, address=$2, phone=$3, email=$4, tax_id=$5 WHERE hostel_id=$6 RETURNING *',
    [hostel_name, address, phone, email, tax_id, id]
  );
  return rows[0] ?? null;
}
export async function remove(id) {
  await pool.query('DELETE FROM hostel_info WHERE hostel_id=$1', [id]);
  return { ok: true };
}
