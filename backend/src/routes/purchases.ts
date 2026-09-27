import { Router } from 'express';
import { list, create, getById } from '../controllers/purchaseController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.get('/', authenticate, list);
router.get('/:id', authenticate, getById);
router.post('/', authenticate, requireRole(['ADMIN', 'LOGISTICS_OFFICER']), create);

export default router;
