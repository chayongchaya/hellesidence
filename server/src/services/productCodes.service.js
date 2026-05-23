import { pool } from '../db/pool.js';

export async function list({ product_type } = {}) {
  let q = 'SELECT * FROM product_code WHERE 1=1';
  const params = [];
  if (product_type) { params.push(product_type); q += ` AND product_type=$${params.length}`; }
  q += ' ORDER BY product_type, product_code';
  const { rows } = await pool.query(q, params);
  return rows;
}
export async function getById(id) {
  const { rows } = await pool.query('SELECT * FROM product_code WHERE product_code=$1', [id]);
  return rows[0] ?? null;
}
export async function create({ product_code, product_name, product_type, default_unit_price, unit }) {
  const { rows } = await pool.query(
    'INSERT INTO product_code (product_code, product_name, product_type, default_unit_price, unit) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [product_code, product_name, product_type, default_unit_price, unit]
  );
  return rows[0];
}
export async function update(id, { product_name, product_type, default_unit_price, unit }) {
  const { rows } = await pool.query(
    'UPDATE product_code SET product_name=$1, product_type=$2, default_unit_price=$3, unit=$4 WHERE product_code=$5 RETURNING *',
    [product_name, product_type, default_unit_price, unit, id]
  );
  return rows[0] ?? null;
}
export async function remove(id) {
  await pool.query('DELETE FROM product_code WHERE product_code=$1', [id]);
  return { ok: true };
}
