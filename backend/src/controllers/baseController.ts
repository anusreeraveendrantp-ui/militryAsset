import { Response } from 'express';
import { AuthRequest } from '../types';
import prisma from '../lib/prisma';

export const list = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bases = await prisma.base.findMany({ orderBy: { name: 'asc' } });
    res.json(bases);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, location } = req.body;

    const existing = await prisma.base.findFirst({ where: { name } });
    if (existing) {
      res.status(409).json({ message: 'Base with this name already exists' });
      return;
    }

    const base = await prisma.base.create({ data: { name, location } });
    res.status(201).json(base);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, location } = req.body;
    const base = await prisma.base.update({
      where: { id: req.params.id },
      data: { name, location },
    });
    res.json(base);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const remove = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.base.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
