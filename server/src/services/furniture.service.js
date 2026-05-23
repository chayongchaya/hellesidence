import { pool } from '../db/pool.js';

export async function list() {
  const { rows } = await pool.query('SELECT * FROM furniture ORDER BY item_id');
  return rows;
}
export async function getById(id) {
  const { rows } = await pool.query('SELECT * FROM furniture WHERE item_id=$1', [id]);
  return rows[0] ?? null;
}
export async function create({ name, category, default_price, description }) {
  const { rows } = await pool.query(
    'INSERT INTO furniture (name, category, default_price, description) VALUES ($1,$2,$3,$4) RETURNING *',
    [name, category, default_price, description]
  );
  return rows[0];
}
export async function update(id, { name, category, default_price, description }) {
  const { rows } = await pool.query(
    'UPDATE furniture SET name=$1, category=$2, default_price=$3, description=$4 WHERE item_id=$5 RETURNING *',
    [name, category, default_price, description, id]
  );
  return rows[0] ?? null;
}
export async function remove(id) {
  await pool.query('DELETE FROM furniture WHERE item_id=$1', [id]);
  return { ok: true };
}
