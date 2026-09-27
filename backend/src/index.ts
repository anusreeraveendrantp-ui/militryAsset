import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import logger from './lib/logger';
import { auditLogger } from './middleware/auditLogger';

import authRoutes from './routes/auth';
import dashboardRoutes from './routes/dashboard';
import purchaseRoutes from './routes/purchases';
import transferRoutes from './routes/transfers';
import assignmentRoutes from './routes/assignments';
import expenditureRoutes from './routes/expenditures';
import baseRoutes from './routes/bases';
import equipmentTypeRoutes from './routes/equipmentTypes';
import auditLogRoutes from './routes/auditLogs';
import userRoutes from './routes/users';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));
app.use(express.json());
app.use(auditLogger);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/expenditures', expenditureRoutes);
app.use('/api/bases', baseRoutes);
app.use('/api/equipment-types', equipmentTypeRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/users', userRoutes);

// 404
app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled error', { error: err.message });
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, () => {
  logger.info(`🚀 MAMS API running on http://localhost:${PORT}`);
});

export default app;
