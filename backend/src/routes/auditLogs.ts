import { Router } from 'express';
import { list } from '../controllers/auditLogController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.get('/', authenticate, requireRole(['ADMIN']), list);

export default router;
