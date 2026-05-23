import * as svc from '../services/reports.service.js';
import { sendList, sendOne, sendError } from '../utils/response.js';

const wrap = (fn) => async (req, res) => {
  try {
    const data = await fn(req.query);
    sendList(res, { data, total: data.length, page: 1, limit: data.length, totalPages: 1 });
  } catch (e) { sendError(res, e.message, 500); }
};

export const tenants      = wrap(svc.tenants);
export const contracts    = wrap(svc.contracts);
export const rentalIncome = wrap(svc.rentalIncome);
export const rooms        = wrap(svc.rooms);
export const availableRooms = wrap(svc.availableRooms);
export const occupancy    = wrap(svc.occupancy);
export const maintenance  = wrap(svc.maintenance);
export const maintenanceCost = wrap(svc.maintenanceCost);
export const monthlyBills = wrap(svc.monthlyBills);
export const chargesByType = wrap(svc.chargesByType);
export const payments     = wrap(svc.payments);
export const unpaidBalances = wrap(svc.unpaidBalances);
export const paymentsByMethod = wrap(svc.paymentsByMethod);
export const expenses     = wrap(svc.expenses);
export const expensesByCategory = wrap(svc.expensesByCategory);

export async function maintenanceVoucher(req, res) {
  try {
    const d = await svc.maintenanceVoucher(req.query.ticket_id);
    if (!d) return sendError(res, 'Not found', 404);
    sendOne(res, d);
  } catch (e) { sendError(res, e.message, 500); }
}
export async function billingStatement(req, res) {
  try {
    const d = await svc.billingStatement(req.query.bill_no);
    if (!d) return sendError(res, 'Not found', 404);
    sendOne(res, d);
  } catch (e) { sendError(res, e.message, 500); }
}
export async function expenseVoucher(req, res) {
  try {
    const d = await svc.expenseVoucher(req.query.expense_no);
    if (!d) return sendError(res, 'Not found', 404);
    sendOne(res, d);
  } catch (e) { sendError(res, e.message, 500); }
}
