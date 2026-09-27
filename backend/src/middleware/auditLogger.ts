import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import prisma from '../lib/prisma';
import logger from '../lib/logger';
import { Prisma } from '@prisma/client';

const SENSITIVE_FIELDS = ['password', 'passwordHash', 'token', 'secret'];

function sanitizePayload(payload: Record<string, unknown>): Record<string, unknown> {
  if (!payload || typeof payload !== 'object') return payload;
  const sanitized = { ...payload };
  for (const field of SENSITIVE_FIELDS) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }
  return sanitized;
}

function getActionName(method: string, endpoint: string): string {
  const parts = endpoint.split('/').filter(Boolean);
  const resource = parts[1]?.toUpperCase().replace(/-/g, '_') || 'RESOURCE';
  const actionMap: Record<string, string> = {
    POST: `CREATE_${resource}`,
    PUT: `UPDATE_${resource}`,
    PATCH: `UPDATE_${resource}`,
    DELETE: `DELETE_${resource}`,
  };
  return actionMap[method] || `${method}_${resource}`;
}

const MUTATING_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

export const auditLogger = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!MUTATING_METHODS.includes(req.method)) {
    next();
    return;
  }

  const originalSend = res.send.bind(res);

  res.send = function (body: unknown) {
    // Async fire-and-forget — never blocks the response
    if (req.user) {
      const sanitized = sanitizePayload(req.body as Record<string, unknown>);
      setImmediate(async () => {
        try {
          await prisma.auditLog.create({
            data: {
              userId: req.user!.id,
              action: getActionName(req.method, req.path),
              endpoint: req.path,
              method: req.method,
              payload: sanitized as unknown as Prisma.InputJsonValue,
              statusCode: res.statusCode,
            },
          });
        } catch (err) {
          logger.error('Audit log write failed', { err });
        }
      });
    }
    return originalSend(body);
  };

  next();
};
