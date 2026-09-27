import { Response, NextFunction } from 'express';
import { AuthRequest, UserRole } from '../types';

export const requireRole = (roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (!roles.includes(req.user.role as UserRole)) {
      res.status(403).json({ message: 'Forbidden: insufficient permissions' });
      return;
    }

    next();
  };
};

export const scopeToBase = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  // ADMIN can access any base; scoped roles are restricted to their own base
  if (req.user.role !== 'ADMIN') {
    const requestedBaseId = req.query.baseId || req.body.baseId || req.params.baseId;
    if (requestedBaseId && requestedBaseId !== req.user.baseId) {
      res.status(403).json({ message: 'Forbidden: access restricted to your base' });
      return;
    }
  }

  next();
};
