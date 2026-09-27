import { Router } from 'express';
import { list, create, updateStatus } from '../controllers/assignmentController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.get('/', authenticate, requireRole(['ADMIN', 'BASE_COMMANDER']), list);
router.post('/', authenticate, requireRole(['ADMIN', 'BASE_COMMANDER']), create);
router.patch('/:id/status', authenticate, requireRole(['ADMIN', 'BASE_COMMANDER']), updateStatus);

export default router;
