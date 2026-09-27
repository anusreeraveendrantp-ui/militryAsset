import { Router } from 'express';
import { list, create, update, remove } from '../controllers/baseController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.get('/', authenticate, list);
router.post('/', authenticate, requireRole(['ADMIN']), create);
router.put('/:id', authenticate, requireRole(['ADMIN']), update);
router.delete('/:id', authenticate, requireRole(['ADMIN']), remove);

export default router;
