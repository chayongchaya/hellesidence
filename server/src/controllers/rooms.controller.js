import * as svc from '../services/rooms.service.js';
import { sendOne, sendList, sendCreated, sendOk, sendError } from '../utils/response.js';

export async function list(req, res) {
  try { sendList(res, { data: await svc.list(req.query), total: -1, page: 1, limit: -1, totalPages: 1 }); }
  catch (e) { sendError(res, e.message, e.status || 500); }
}
export async function getOne(req, res) {
  try {
    const item = await svc.getById(req.params.id);
    if (!item) return sendError(res, 'Not found', 404);
    sendOne(res, item);
  } catch (e) { sendError(res, e.message, e.status || 500); }
}
export async function create(req, res) {
  try { sendCreated(res, await svc.create(req.body)); }
  catch (e) { sendError(res, e.message, e.status || 422); }
}
export async function update(req, res) {
  try {
    const item = await svc.update(req.params.id, req.body);
    if (!item) return sendError(res, 'Not found', 404);
    sendOne(res, item);
  } catch (e) { sendError(res, e.message, e.status || 422); }
}
export async function remove(req, res) {
  try { sendOk(res, await svc.remove(req.params.id)); }
  catch (e) { sendError(res, e.message, e.status || 500); }
}
