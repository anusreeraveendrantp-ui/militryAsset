import { Router } from 'express';
import { getMetrics, getNetMovementByBase } from '../controllers/dashboardController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/metrics', authenticate, getMetrics);
router.get('/net-movement/:baseId', authenticate, getNetMovementByBase);

export default router;
