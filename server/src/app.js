import express from 'express';
import cors from 'cors';
import logger from './utils/logger.js';

import hostelRoutes       from './routes/hostel.routes.js';
import tenantsRoutes      from './routes/tenants.routes.js';
import roomTypesRoutes    from './routes/roomTypes.routes.js';
import roomsRoutes        from './routes/rooms.routes.js';
import furnitureRoutes    from './routes/furniture.routes.js';
import productCodesRoutes from './routes/productCodes.routes.js';
import staffRoutes        from './routes/staff.routes.js';
import suppliersRoutes    from './routes/suppliers.routes.js';
import maintenanceRoutes  from './routes/maintenance.routes.js';
import contractsRoutes    from './routes/contracts.routes.js';
import billingRoutes      from './routes/billing.routes.js';
import receiptsRoutes     from './routes/receipts.routes.js';
import inspectionsRoutes  from './routes/inspections.routes.js';
import expensesRoutes     from './routes/expenses.routes.js';
import reportsRoutes      from './routes/reports.routes.js';

const app = express();

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () =>
    logger.info(`[${req.method}] ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms`)
  );
  next();
});

const corsOrigin = process.env.CORS_ORIGIN;
app.use(cors({
  origin: !corsOrigin ? true : corsOrigin.split(',').map(o => o.trim()),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

app.get('/health', (_, res) => res.json({ ok: true }));

app.use('/api/v1/hostel',              hostelRoutes);
app.use('/api/v1/tenants',             tenantsRoutes);
app.use('/api/v1/room-types',          roomTypesRoutes);
app.use('/api/v1/rooms',               roomsRoutes);
app.use('/api/v1/furniture',           furnitureRoutes);
app.use('/api/v1/product-codes',       productCodesRoutes);
app.use('/api/v1/staff',               staffRoutes);
app.use('/api/v1/suppliers',           suppliersRoutes);
app.use('/api/v1/maintenance-tickets', maintenanceRoutes);
app.use('/api/v1/contracts',           contractsRoutes);
app.use('/api/v1/monthly-bills',       billingRoutes);
app.use('/api/v1/payment-receipts',    receiptsRoutes);
app.use('/api/v1/room-inspections',    inspectionsRoutes);
app.use('/api/v1/expenses',            expensesRoutes);
app.use('/api/v1/reports',             reportsRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, data: null, error: { code: 'NOT_FOUND', message: `Cannot ${req.method} ${req.path}` } });
});

app.use((err, req, res, _next) => {
  logger.error('Unhandled error', { message: err.message });
  res.status(err.status || 500).json({ success: false, data: null, error: { code: 'INTERNAL_ERROR', message: err.message || 'Internal server error' } });
});

const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || '0.0.0.0';
app.listen(PORT, HOST, () => logger.info(`Hellesidence server listening on http://${HOST}:${PORT}`));
