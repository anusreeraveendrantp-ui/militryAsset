import { Response } from 'express';
import { AuthRequest } from '../types';
import prisma from '../lib/prisma';

export const list = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { baseId, equipmentTypeId, startDate, endDate, page = '1', limit = '20' } = req.query;

    const where: Record<string, unknown> = {};

    if (req.user!.role !== 'ADMIN') {
      where.baseId = req.user!.baseId;
    } else if (baseId) {
      where.baseId = baseId;
    }

    if (equipmentTypeId) where.equipmentTypeId = equipmentTypeId;

    if (startDate && endDate) {
      where.purchaseDate = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [purchases, total] = await Promise.all([
      prisma.purchase.findMany({
        where,
        include: {
          base: { select: { id: true, name: true } },
          equipmentType: { select: { id: true, name: true, category: true } },
          creator: { select: { id: true, username: true } },
        },
        orderBy: { purchaseDate: 'desc' },
        skip,
        take: parseInt(limit as string),
      }),
      prisma.purchase.count({ where }),
    ]);

    res.json({ data: purchases, total, page: parseInt(page as string), limit: parseInt(limit as string) });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { baseId, equipmentTypeId, quantity, purchaseDate } = req.body;

    // Non-admins can only create for their own base
    const effectiveBaseId = req.user!.role !== 'ADMIN' ? req.user!.baseId! : baseId;

    const purchase = await prisma.purchase.create({
      data: {
        baseId: effectiveBaseId,
        equipmentTypeId,
        quantity: parseInt(quantity),
        purchaseDate: new Date(purchaseDate),
        createdBy: req.user!.id,
      },
      include: {
        base: { select: { id: true, name: true } },
        equipmentType: { select: { id: true, name: true, category: true } },
        creator: { select: { id: true, username: true } },
      },
    });

    res.status(201).json(purchase);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const purchase = await prisma.purchase.findUnique({
      where: { id: req.params.id },
      include: {
        base: { select: { id: true, name: true } },
        equipmentType: { select: { id: true, name: true, category: true } },
        creator: { select: { id: true, username: true } },
      },
    });

    if (!purchase) {
      res.status(404).json({ message: 'Purchase not found' });
      return;
    }

    if (req.user!.role !== 'ADMIN' && purchase.baseId !== req.user!.baseId) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    res.json(purchase);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
