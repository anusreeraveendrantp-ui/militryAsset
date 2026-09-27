import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../types';
import prisma from '../lib/prisma';

export const list = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        role: true,
        baseId: true,
        createdAt: true,
        base: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { username, password, role, baseId } = req.body;

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      res.status(409).json({ message: 'Username already taken' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        username,
        passwordHash,
        role,
        baseId: role === 'ADMIN' ? null : baseId,
      },
      select: {
        id: true,
        username: true,
        role: true,
        baseId: true,
        createdAt: true,
        base: { select: { id: true, name: true } },
      },
    });

    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, baseId, password } = req.body;
    const updateData: Record<string, unknown> = {};

    if (role) updateData.role = role;
    if (baseId !== undefined) updateData.baseId = role === 'ADMIN' ? null : baseId;
    if (password) updateData.passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: updateData,
      select: {
        id: true,
        username: true,
        role: true,
        baseId: true,
        createdAt: true,
        base: { select: { id: true, name: true } },
      },
    });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const remove = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.params.id === req.user!.id) {
      res.status(400).json({ message: 'Cannot delete your own account' });
      return;
    }
    await prisma.user.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
