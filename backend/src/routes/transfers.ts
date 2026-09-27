import { Router } from 'express';
import { list, create, complete, cancel } from '../controllers/transferController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.get('/', authenticate, list);
router.post('/', authenticate, requireRole(['ADMIN', 'LOGISTICS_OFFICER']), create);
router.patch('/:id/complete', authenticate, requireRole(['ADMIN', 'LOGISTICS_OFFICER']), complete);
router.patch('/:id/cancel', authenticate, requireRole(['ADMIN', 'LOGISTICS_OFFICER']), cancel);

export default router;
