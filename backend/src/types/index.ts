import { Request } from 'express';

export interface AuthPayload {
  id: string;
  role: 'ADMIN' | 'BASE_COMMANDER' | 'LOGISTICS_OFFICER';
  baseId: string | null;
  username: string;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export type UserRole = 'ADMIN' | 'BASE_COMMANDER' | 'LOGISTICS_OFFICER';
