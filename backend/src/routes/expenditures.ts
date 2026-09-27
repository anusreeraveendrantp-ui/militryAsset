import { Router } from 'express';
import { list, create } from '../controllers/expenditureController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.get('/', authenticate, requireRole(['ADMIN', 'BASE_COMMANDER']), list);
router.post('/', authenticate, requireRole(['ADMIN', 'BASE_COMMANDER']), create);

export default router;
