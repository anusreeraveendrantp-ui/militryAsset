import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import logger from '../lib/logger';

export const login = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ message: 'Username and password are required' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username },
      include: { base: { select: { id: true, name: true, location: true } } },
    });

    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const payload = {
      id: user.id,
      role: user.role,
      baseId: user.baseId,
      username: user.username,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: (process.env.JWT_EXPIRES_IN || '24h') as string,
    } as jwt.SignOptions);

    logger.info('User logged in', { userId: user.id, role: user.role });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        baseId: user.baseId,
        base: user.base,
      },
    });
  } catch (err) {
    logger.error('Login error', { err });
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const me = async (req: Request & { user?: { id: string } }, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { base: { select: { id: true, name: true, location: true } } },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({
      id: user.id,
      username: user.username,
      role: user.role,
      baseId: user.baseId,
      base: user.base,
    });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
