import { pool } from '../db/pool.js';

export async function list({ status, priority_level, room_no, tenant_id, date_from, date_to } = {}) {
  let q = `SELECT mt.*, t.name as tenant_name, s.name as technician_name
           FROM maintenance_ticket mt
           JOIN tenant t ON t.tenant_id = mt.tenant_id
           LEFT JOIN staff s ON s.staff_id = mt.technician_staff_id
           WHERE 1=1`;
  const params = [];
  if (status) { params.push(status); q += ` AND mt.status=$${params.length}`; }
  if (priority_level) { params.push(priority_level); q += ` AND mt.priority_level=$${params.length}`; }
  if (room_no) { params.push(room_no); q += ` AND mt.room_no=$${params.length}`; }
  if (tenant_id) { params.push(tenant_id); q += ` AND mt.tenant_id=$${params.length}`; }
  if (date_from) { params.push(date_from); q += ` AND mt.request_date >= $${params.length}`; }
  if (date_to) { params.push(date_to); q += ` AND mt.request_date <= $${params.length}`; }
  q += ' ORDER BY mt.ticket_no DESC';
  const { rows } = await pool.query(q, params);
  return rows;
}
export async function getById(id) {
  const { rows } = await pool.query(
    `SELECT mt.*, t.name as tenant_name, s.name as technician_name
     FROM maintenance_ticket mt
     JOIN tenant t ON t.tenant_id = mt.tenant_id
     LEFT JOIN staff s ON s.staff_id = mt.technician_staff_id
     WHERE mt.ticket_no=$1`, [id]
  );
  return rows[0] ?? null;
}
export async function create(body) {
  const { request_date, tenant_id, room_no, issue_type, description, priority_level, estimated_cost, technician_staff_id, notes } = body;
  const { rows } = await pool.query(
    `INSERT INTO maintenance_ticket (request_date, tenant_id, room_no, issue_type, description, priority_level, estimated_cost, technician_staff_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [request_date, tenant_id, room_no, issue_type, description, priority_level, estimated_cost, technician_staff_id]
  );
  return rows[0];
}
export async function update(id, body) {
  const { request_date, tenant_id, room_no, issue_type, description, priority_level, status, estimated_cost, actual_cost, technician_staff_id, completion_date, notes } = body;
  const { rows } = await pool.query(
    `UPDATE maintenance_ticket SET request_date=$1, tenant_id=$2, room_no=$3, issue_type=$4,
     description=$5, priority_level=$6, status=$7, estimated_cost=$8, actual_cost=$9,
     technician_staff_id=$10, completion_date=$11 WHERE ticket_no=$12 RETURNING *`,
    [request_date, tenant_id, room_no, issue_type, description, priority_level, status, estimated_cost, actual_cost, technician_staff_id, completion_date, id]
  );
  return rows[0] ?? null;
}
export async function remove(id) {
  await pool.query('DELETE FROM maintenance_ticket WHERE ticket_no=$1', [id]);
  return { ok: true };
}
