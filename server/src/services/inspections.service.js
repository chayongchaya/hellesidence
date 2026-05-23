import { pool } from '../db/pool.js';

export async function list({ room_no, tenant_id, result, date_from, date_to } = {}) {
  let q = `SELECT ri.*, t.name as tenant_name, s.name as inspector_name
           FROM inspection ri
           JOIN tenant t ON t.tenant_id = ri.tenant_id
           LEFT JOIN staff s ON s.staff_id = ri.inspector_staff_id
           WHERE 1=1`;
  const params = [];
  if (room_no) { params.push(room_no); q += ` AND ri.room_no=$${params.length}`; }
  if (tenant_id) { params.push(tenant_id); q += ` AND ri.tenant_id=$${params.length}`; }
  if (result) { params.push(result); q += ` AND ri.result=$${params.length}`; }
  if (date_from) { params.push(date_from); q += ` AND ri.inspection_date >= $${params.length}`; }
  if (date_to) { params.push(date_to); q += ` AND ri.inspection_date <= $${params.length}`; }
  q += ' ORDER BY ri.inspection_no DESC';
  const { rows } = await pool.query(q, params);
  return rows;
}
export async function getById(id) {
  const { rows: insp } = await pool.query(
    `SELECT ri.*, t.name as tenant_name, s.name as inspector_name
     FROM inspection ri
     JOIN tenant t ON t.tenant_id = ri.tenant_id
     LEFT JOIN staff s ON s.staff_id = ri.inspector_staff_id
     WHERE ri.inspection_no=$1`, [id]
  );
  if (!insp.length) return null;
  const { rows: li } = await pool.query(
    'SELECT * FROM inspection_line WHERE inspection_no=$1 ORDER BY inspection_line_id', [id]
  );
  return { ...insp[0], line_items: li };
}
export async function create(body) {
  const { inspection_date, tenant_id, room_no, inspector_staff_id, result, line_items } = body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const total_fines = (line_items || []).reduce((s, i) => s + parseFloat(i.fine_amount || 0), 0);
    const { rows: insp } = await client.query(
      `INSERT INTO inspection (inspection_date, tenant_id, room_no, inspector_staff_id, result, total_fines)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [inspection_date, tenant_id, room_no, inspector_staff_id, result, total_fines]
    );
    const inspection_no = insp[0].inspection_no;
    for (const item of (line_items || [])) {
      await client.query(
        'INSERT INTO inspection_line (inspection_no, item_checked, condition, fine_amount, notes) VALUES ($1,$2,$3,$4,$5)',
        [inspection_no, item.item_checked, item.condition, item.fine_amount || 0, item.notes]
      );
    }
    if (result === 'Pass') {
      await client.query("UPDATE room SET status='Available' WHERE room_no=$1", [room_no]);
    }
    await client.query('COMMIT');
    return await getById(inspection_no);
  } catch (err) { await client.query('ROLLBACK'); throw err; }
  finally { client.release(); }
}
export async function update(id, body) {
  const { inspection_date, tenant_id, room_no, inspector_staff_id, result, line_items } = body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const total_fines = (line_items || []).reduce((s, i) => s + parseFloat(i.fine_amount || 0), 0);
    await client.query(
      `UPDATE inspection SET inspection_date=$1, tenant_id=$2, room_no=$3, inspector_staff_id=$4, result=$5, total_fines=$6 WHERE inspection_no=$7`,
      [inspection_date, tenant_id, room_no, inspector_staff_id, result, total_fines, id]
    );
    await client.query('DELETE FROM inspection_line WHERE inspection_no=$1', [id]);
    for (const item of (line_items || [])) {
      await client.query(
        'INSERT INTO inspection_line (inspection_no, item_checked, condition, fine_amount, notes) VALUES ($1,$2,$3,$4,$5)',
        [id, item.item_checked, item.condition, item.fine_amount || 0, item.notes]
      );
    }
    await client.query('COMMIT');
    return { ok: true };
  } catch (err) { await client.query('ROLLBACK'); throw err; }
  finally { client.release(); }
}
export async function remove(id) {
  await pool.query('DELETE FROM inspection WHERE inspection_no=$1', [id]);
  return { ok: true };
}
