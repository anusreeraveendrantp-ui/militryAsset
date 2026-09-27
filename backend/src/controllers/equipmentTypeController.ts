import { Response } from 'express';
import { AuthRequest } from '../types';
import prisma from '../lib/prisma';

export const list = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category } = req.query;
    const where = category ? { category: category as string } : {};
    const types = await prisma.equipmentType.findMany({
      where: where as Record<string, unknown>,
      orderBy: { name: 'asc' },
    });
    res.json(types);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, category } = req.body;

    const existing = await prisma.equipmentType.findFirst({ where: { name } });
    if (existing) {
      res.status(409).json({ message: 'Equipment type with this name already exists' });
      return;
    }

    const type = await prisma.equipmentType.create({ data: { name, category } });
    res.status(201).json(type);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, category } = req.body;
    const type = await prisma.equipmentType.update({
      where: { id: req.params.id },
      data: { name, category },
    });
    res.json(type);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
