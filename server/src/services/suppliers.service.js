import { pool } from '../db/pool.js';

export async function list() {
  const { rows } = await pool.query('SELECT * FROM supplier ORDER BY supplier_id');
  return rows;
}
export async function getById(id) {
  const { rows } = await pool.query('SELECT * FROM supplier WHERE supplier_id=$1', [id]);
  return rows[0] ?? null;
}
export async function create({ name, contact_information }) {
  const { rows } = await pool.query(
    'INSERT INTO supplier (name, contact_information) VALUES ($1,$2) RETURNING *',
    [name, contact_information]
  );
  return rows[0];
}
export async function update(id, { name, contact_information }) {
  const { rows } = await pool.query(
    'UPDATE supplier SET name=$1, contact_information=$2 WHERE supplier_id=$3 RETURNING *',
    [name, contact_information, id]
  );
  return rows[0] ?? null;
}
export async function remove(id) {
  await pool.query('DELETE FROM supplier WHERE supplier_id=$1', [id]);
  return { ok: true };
}
