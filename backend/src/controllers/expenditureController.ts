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
      where.expenditureDate = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [expenditures, total] = await Promise.all([
      prisma.expenditure.findMany({
        where,
        include: {
          base: { select: { id: true, name: true } },
          equipmentType: { select: { id: true, name: true, category: true } },
          creator: { select: { id: true, username: true } },
        },
        orderBy: { expenditureDate: 'desc' },
        skip,
        take: parseInt(limit as string),
      }),
      prisma.expenditure.count({ where }),
    ]);

    res.json({ data: expenditures, total, page: parseInt(page as string), limit: parseInt(limit as string) });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { baseId, equipmentTypeId, quantity, expenditureDate, reason } = req.body;

    const effectiveBaseId = req.user!.role !== 'ADMIN' ? req.user!.baseId! : baseId;

    const expenditure = await prisma.expenditure.create({
      data: {
        baseId: effectiveBaseId,
        equipmentTypeId,
        quantity: parseInt(quantity),
        expenditureDate: new Date(expenditureDate),
        reason,
        createdBy: req.user!.id,
      },
      include: {
        base: { select: { id: true, name: true } },
        equipmentType: { select: { id: true, name: true, category: true } },
        creator: { select: { id: true, username: true } },
      },
    });

    res.status(201).json(expenditure);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
